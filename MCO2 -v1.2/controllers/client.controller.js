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

// Search Form
router.post('/searchFlight', async (req, res) => {
  try {
    let { origin, destination, departure, passengerCount } = req.body;

    // Log incoming payload
    console.log('POST /client/searchFlight body:', req.body);

    // basic validation
    if (!origin || !destination || !departure || !passengerCount) {
      return res.status(400).render('client/ClientSearch', {
        title: 'Client Search Flight Page',
        errorMessage: 'All fields are required.'
      });
    }

    // normalize inputs
    origin = String(origin).trim();
    destination = String(destination).trim();
    passengerCount = parseInt(passengerCount, 10);

    if (origin === destination) {
      return res.status(400).render('client/ClientSearch', {
        title: 'Client Search Flight Page',
        errorMessage: 'Origin and destination must be different.'
      });
    }

    if (Number.isNaN(passengerCount) || passengerCount < 1) {
      return res.status(400).render('client/ClientSearch', {
        title: 'Client Search Flight Page',
        errorMessage: 'Invalid passenger count.'
      });
    }

    // Build a case-insensitive match for origin/destination to avoid capitalization issues
    const originRegex = new RegExp('^' + origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
    const destRegex   = new RegExp('^' + destination.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');

    // Make a date range for the whole local day.
    const dayStart = new Date(departure);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    console.log('Searching flights for:', { origin, destination, dayStart: dayStart.toISOString(), dayEnd: dayEnd.toISOString(), passengerCount });

    // Find candidate flights 
    const candidates = await Flight.find({
      origin: originRegex,
      destination: destRegex,
      departure: { $gte: dayStart, $lt: dayEnd }
    }).lean();

    console.log(`Found ${candidates.length} candidate(s) from DB.`);

    // Filter
    const flights = candidates
      .map(f => {
        const seatCap = Number(f.seatCap || 0);
        const booked  = Number(f.passengerCount || 0);
        const available = seatCap - booked;
        return { ...f, available };
      })
      .filter(f => {
        console.log(`Flight ${f.flightNum} — seatCap: ${f.seatCap}, booked: ${f.passengerCount}, available: ${f.available}`);
        return (f.available - passengerCount) >= 0;
      });

    console.log(`After availability filter: ${flights.length} flight(s) will be returned.`);

    return res.render('client/ClientSearch', {
      title: 'Client Search Flight Page',
      flights,
      search: { origin, destination, departure, passengerCount },
      message: flights.length ? null : 'No flights found matching your criteria.'
    });

  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).render('client/ClientSearch', {
      title: 'Client Search Flight Page',
      errorMessage: 'Server error, please try again later.'
    });
  }
});

module.exports = router;


