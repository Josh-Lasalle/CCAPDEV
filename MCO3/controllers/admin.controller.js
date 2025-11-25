const express = require('express');
const router = express.Router();

// Admin Home
router.get('/home', (req, res) => {
  res.render('admin/AdminHome', { 
    title: 'Admin Dashboard',
    layout: 'AdminMain'  
  });
});

module.exports = router;


