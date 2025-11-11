const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Flight = require('../models/flight.model');

// Client Home
router.get('/home', (req, res) => {
  res.render('client/ClientHome', { 
    title: 'Client Dashboard', 
  });
});

// Client Home
router.get('/search', (req, res) => {
  res.render('client/ClientSearch', { 
    title: 'Client Search Flight Page', 
  });
});

// Client Profile 
router.get('/profile', (req, res) => {
  res.render('client/ClientProfile', {
    title: 'Client Profile Page',
  });
});

// Search Form
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

module.exports = router;





