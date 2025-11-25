const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Passenger = require('../models/Passenger');

// POST /api/checkin
router.post('/checkin', async (req, res) => {
  const { username, password, referenceNum } = req.body;

  if (!username || !password || !referenceNum) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing username, password, or referenceNum'
    });
  }

  // Check user credentials
  const user = await User.findOne({ username, password });
  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid username or password'
    });
  }

  // Check if user owns the reference number
  if (!user.referenceNums.includes(referenceNum)) {
    return res.status(403).json({
      status: 'error',
      message: 'Reference number does not belong to this user'
    });
  }

  // Find the passenger
  const passenger = await Passenger.findOne({ referenceNum });
  if (!passenger) {
    return res.status(404).json({
      status: 'error',
      message: 'Passenger not found'
    });
  }

  if (passenger.checkedIn) {
    return res.json({
      status: 'success',
      message: 'Passenger is already checked in'
    });
  }

  // Check-in
  passenger.checkedIn = true;
  await passenger.save();

  return res.json({
    status: 'success',
    message: 'Check-in successful',
    referenceNum
  });
});

module.exports = router;
