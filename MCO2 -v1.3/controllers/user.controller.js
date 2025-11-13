const express = require('express');
const router = express.Router();

const User = require('../models/user.model');


// ===== Register =====
router.get('/register', (req, res) => {
  res.render('users/register', {layout: 'LoginMain'});
});

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const newUser = new User({ 
        username, 
        password, 
        email 
    });

    await newUser.save();
    res.redirect('/users/login');
  } catch (err) {

    let errors = {};

    if (err.name === 'ValidationError') {
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
    }

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      errors[duplicateField] = `${duplicateField} already exists`;
    }

    res.render('users/register', {
      layout: 'LoginMain',
      errors,                  
      user: { username, email }
    });
  }
});


// ===== Index =====
router.get('/', (req, res) => {
  User.find().lean()
    .then(data => {
      res.render('users/index', { layout: 'AdminMain', users: data });
    })
    .catch(err => {
      console.log('Error during fetching operation:\n', err);
    });
});


// ===== Add =====
router.get('/add', (req, res) => {
  res.render('users/add', {layout: 'LoginMain'});
});

router.post('/add', async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    const newUser = new User({ 
        username, 
        password, 
        email,
        role 
    });

    await newUser.save();
    res.redirect('/users');
  } catch (err) {

    let errors = {};

    if (err.name === 'ValidationError') {
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
    }

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      errors[duplicateField] = `${duplicateField} already exists`;
    }

    res.render('users/add', {
      layout: 'LoginMain',
      errors,                  
      user: { username, email, role }
    });
  }
});


// ===== Edit =====
router.get('/edit/:id', async (req, res) => {
  try {
    const data = await User.findById(req.params.id).lean();
    res.render('users/edit', { layout: 'LoginMain', user: data });
  } catch (err) {
    console.log('Error while retrieving the record:\n', err);
  }
});

router.post('/edit/:id', async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    await User.findByIdAndUpdate(req.params.id, { username, password, email, role }, { runValidators: true });
    res.redirect('/users');
  } catch (err) {
    let errors = {};

    if (err.name === 'ValidationError') {
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
    }

     if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      errors[duplicateField] = `${duplicateField} already exists`;
    }

    res.render('users/edit', {
      layout: 'LoginMain',
      errors,
      user: { _id: req.params.id, username, email, role }
    });
  }
});


// ===== Delete ===== 
router.post('/delete/:id', (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.redirect('/users'))
    .catch(err => console.log('error during deletion:\n', err))
})

// ===== Login routes =====
router.get('/login', (req, res) => {
  res.render('users/login', { layout: 'LoginMain' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.render('users/login', {
        layout: 'LoginMain',
        errors: { username: 'User not found' },
        user: { username }
      });
    }

    if (user.password !== password) {
      return res.render('users/login', {
        layout: 'LoginMain',
        errors: { password: 'Incorrect password' },
        user: { username }
      });
    }

    // ===== SESSION HANDLING =====
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    // ===== REDIRECT =====
    if (user.role === 'Admin') {
      res.redirect('/admin/home');
    } else {
      res.redirect(`/client/home`);
    }

  } catch (err) {
    console.error('Login error:', err);
    res.render('users/login', {
      layout: 'LoginMain',
      errors: { general: 'An unexpected error occurred. Please try again.' },
      user: { username }
    });
  }
});

// ===== Logout =====
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('logout error:', err);
    }
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
});


// ===== Client Update =====
router.post('/profile/update', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if (password && password !== confirmPassword) {
        console.log('Passwords do not match');
        return res.redirect('/client/profile?error=2');
    }
    const updateData = { username, email };
    if (password) {
        updateData.password = password; 
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId, 
            updateData, 
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
          return res.redirect('/client/profile?status=0');
        }
        req.session.username = updatedUser.username;
        res.redirect('/client/profile?status=1');
    } catch (err) {
        console.error('Update error (or validation failed):', err);
        if (err.name === 'ValidationError') {
            if (err.errors.username) {
                return res.redirect('/client/profile?error=3');
            }
            if (err.errors.password) {
                return res.redirect('/client/profile?error=4');
            }
            if (err.errors.email) {
                return res.redirect('/client/profile?error=5');
            }
        }
        res.redirect('/client/profile?status=0');
    }
});

// ===== Client Delete =====
router.post('/profile/delete', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/users/login');
    }
    User.findByIdAndDelete(req.session.userId)
    .then(deletedUser => {
        if (!deletedUser) {
            console.log('User not found for deletion:', req.session.userId);
        }
        req.session.destroy(err => {
          if (err) {
            console.error('logout error:', err);
          }
          res.clearCookie('connect.sid');
          return res.redirect('/');
        });
    })
    .catch(err => {
        console.error(err);
        res.redirect('/client/profile?status=0');
    });
});


module.exports = router;



