const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');

router.use(isAuthenticated); 
router.use(isAdmin);        

// Admin Home
router.get('/home', (req, res) => {
  res.render('admin/AdminHome', { 
    title: 'Admin Dashboard',
    layout: 'AdminMain'  
  });
});

module.exports = router;


