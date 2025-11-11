const express = require('express');
const router = express.Router();

const User = require('../models/user.model');


//register
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


//index
router.get('/', (req, res) => {
  User.find().lean()
    .then(data => {
      res.render('users/index', { layout: 'AdminMain', users: data });
    })
    .catch(err => {
      console.log('Error during fetching operation:\n', err);
    });
});


//add
router.get('/add', (req, res) => {
  res.render('users/add', {layout: 'AdminMain'});
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
      layout: 'AdminMain',
      errors,                  
      user: { username, email, role }
    });
  }
});


//edit
router.get('/edit/:id', async (req, res) => {
  try {
    const data = await User.findById(req.params.id).lean();
    res.render('users/edit', { layout: 'AdminMain', user: data });
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
      layout: 'AdminMain',
      errors,
      user: { _id: req.params.id, username, email, role }
    });
  }
});


//delete
router.post('/delete/:id', (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.redirect('/users'))
    .catch(err => console.log('error during deletion:\n', err))
})


//login
router.get('/login', (req, res) => {
  res.render('users/login', {layout: 'LoginMain',});
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
    //Modification to redirect user to either client or admin landing page
    if (user.role === 'Admin') {
      res.redirect('/admin/home');
    } else {
      res.redirect(`/client/home/`);
    }
    //res.redirect('/users');
    
  } catch (err) {
    console.error('Login error:', err);
    res.render('users/login', {
      layout: 'LoginMain',
      errors: { general: 'An unexpected error occurred. Please try again.' },
      user: { username }
    });
  }
});

module.exports = router;

