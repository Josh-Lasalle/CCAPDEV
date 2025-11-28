// ==============================================
// server.js - Express + Mongoose + Handlebars
// ==============================================
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const flightRoutes = require('./controllers/flight.controller');
const userRoutes = require('./controllers/user.controller');
const adminRoutes = require('./controllers/admin.controller');
const clientRoutes = require('./controllers/client.controller');
const apiRoutes = require('./controllers/api.controller');
const path = require('path');
const fs = require('fs'); //File system mod
const User = require('./models/user.model');

const app = express();
const PORT = 3000;

// MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/airlinedb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create admin account
User.findOne({ role: 'Admin' })
  .then(async (admin) => {
    if (!admin) {
    
      const newAdmin = new User({
        username: 'admin',
        password: 'admin123',
        email: 'admin@gmail.com',
        role: 'Admin'
      });

      await newAdmin.save();
    }
  })
  .catch(err => console.error("Admin check error:", err));


// Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//------------log
app.use(session({
  secret: 'myAirlineDB',  
  resave: false,
  saveUninitialized: false
}));



app.use((req, res, next) => {
    const user = req.session.username || "NoUserLogged";
    const role = req.session.role || "NoRole";
      if (!req.url.startsWith('/images') && !req.url.startsWith('/style.css')) {
        const message = new Date() + " | TRAFFIC | User: " + user + " | Role: " + role + " | " + req.method + " " + req.url + "\n";
        fs.appendFile('sys.log', message, (err) => {
            if (err) console.log(err);
        });
    }
    next();
});
//------------log

app.use((req, res, next) => {
  const username = req.session?.username ?? null;
  const role = String(req.session?.role ?? '').toLowerCase();
  res.locals.currentUser = username;
  res.locals.isAdmin = role === 'admin';
  res.locals.isClient = role === 'client';
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('users/login', {layout: 'LoginMain'});
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/client', clientRoutes);
app.use('/admin', adminRoutes);
app.use('/flights', flightRoutes);
app.use('/users', userRoutes);
app.use('/api', apiRoutes);

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
