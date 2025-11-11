const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Flight = require('../models/flight.model');
const User = require('../models/user.model');

// Client Home
router.get('/home', (req, res) => {
  res.render('client/ClientHome', { 
    title: 'Client Dashboard', 
  });
});

// Client Search
router.get('/search', (req, res) => {
  res.render('client/ClientSearch', { 
    title: 'Client Search Flight Page', 
  });
});

// Client Profile 
router.get('/profile/:username', (req, res) => {
  User.findOne({ username: req.params.username }).lean()
    .then(user => {
      if (!user) {
        return res.send('User not found.');
      }
      var successMessage = null;
      var errorMessage = null;
      if (req.query.status === '1') {
        successMessage = 'Profile updated';
      }
      if (req.query.status === '0') {
        errorMessage = 'Update fail';
      }
      if (req.query.error === '2') {
        errorMessage = 'Passwords did not match';
      }
      res.render('client/ClientProfile', {
        title: 'Client Profile Page',
        user: user,
        successMsg: successMessage,
        errorMsg: errorMessage
      });
    })
    .catch(err => {
      console.log('Error', err);
      res.redirect('/client/home');
    });
});


// Client Book
router.get('/book', (req, res) => {
  res.render('client/ClientBook', {
    title: 'Client Booking Page',
  });
});

//register
router.post('/register', async (req, res) => {
  const { flightId, passengerCount } = req.body;
  
  const flight = await Flight.findById(flightId).lean(); // plain JS object

  // Prepare rows
  const rows = ['A','B','C','D','E','F','G','H','I','J'];
  const seatsByRow = {};

  rows.forEach(row => {
    const rowSeats = flight.seats.filter(seat => seat.seatNumber.startsWith(row));
    seatsByRow[row] = {
      left: rowSeats.slice(0,3),   // seats 1-3
      right: rowSeats.slice(3,6)   // seats 4-6
    };
  });

  res.render('client/ClientRegister', {
    title: 'Client Booking Page',
    flight,
    passengerCount,
    seatsByRow
  });
});

// Client Search
router.post('/searchFlight', async (req, res) => {
  const { origin, destination, departure, passengerCount } = req.body;

  const depDate = new Date(departure);
  if (!departure || isNaN(depDate)) {
    return res.render('client/ClientSearch', {
      title: 'Client Search Flight Page',
      flights: [],
      search: { origin, destination, departure, passengerCount },
      message: 'No flights found matching your criteria.'
    });
  }

  const dayStart = new Date(depDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const f = await Flight.find({
    origin,
    destination,
    departureDate: { $gte: dayStart, $lt: dayEnd }
  }).lean();

  const flights = f.filter(flight => (flight.seatCap - flight.passengerCount) >= passengerCount);

  res.render('client/ClientSearch', {
    title: 'Client Search Flight Page',
    flights,
    search: { origin, destination, departure, passengerCount },
    message: flights.length ? null : 'No flights found matching your criteria.'
  });
});

// Book flight
router.post('/bookFlight', async (req, res) => {
  const { origin, destination, departure, passengerCount } = req.body;

  const depDate = new Date(departure);
  if (!departure || isNaN(depDate)) {
    return res.render('client/ClientBook', {
      title: 'Client Book Flight Page',
      flights: [],
      search: { origin, destination, departure, passengerCount },
      message: 'No flights found matching your criteria.'
    });
  }

  const dayStart = new Date(depDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const f = await Flight.find({
    origin,
    destination,
    departureDate: { $gte: dayStart, $lt: dayEnd }
  }).lean();

  const flights = f.filter(flight => (flight.seatCap - flight.passengerCount) >= passengerCount);

  res.render('client/ClientBook', {
    title: 'Client Search Flight Page',
    flights,
    search: { origin, destination, departure, passengerCount },
    message: flights.length ? null : 'No flights found matching your criteria.'
  });
});

module.exports = router;













