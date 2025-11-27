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

const app = express();
const PORT = 3000;

// ===== 1⃣ CONNECT TO MONGODB =====
mongoose.connect('mongodb://127.0.0.1:27017/airlinedb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ===== 2⃣ CONFIGURE HANDLEBARS =====
app.engine('handlebars', engine({
  defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');
app.set('views', './views');

// ===== 3⃣ MIDDLEWARE =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//------------log
app.use((req, res, next) => {
    const message = new Date() + " | " + req.method + " " + req.url + "\n\n";
    console.log(message);
    fs.appendFile('sys.log', message, (err) => {
        if (err) {
            console.log(err);
        }
    });
    next();
});

app.use(session({
  secret: 'myAirlineDB',  
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  const username = req.session?.username ?? null;
  const role = String(req.session?.role ?? '').toLowerCase();
  res.locals.currentUser = username;
  res.locals.isAdmin = role === 'admin';
  res.locals.isClient = role === 'client';
  next();
});

// ===== 4⃣ ROUTES =====
app.get('/', (req, res) => {
  res.render('users/login', {layout: 'LoginMain'});
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/client', clientRoutes);
app.use('/admin', adminRoutes);
app.use('/flights', flightRoutes);
app.use('/users', userRoutes);
app.use('/api', apiRoutes);

// ===== 5⃣ START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
