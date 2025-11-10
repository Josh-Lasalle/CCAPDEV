const express = require('express');
const router = express.Router();

const Flight = require('../models/flight.model');

router.get('/add', (req, res) => {
  res.render('flights/add', {
    layout: 'AdminMain',
    flight: {
      airline: 'Bing Bong Airlines',
      aircraftType: 'Bing Bong Air Carrier',
      seatCap:'60'
    }
  });
});

// error handling
router.post('/add', async (req, res) => {
  const {
    flightNum,
    airline,
    aircraftType,
    origin,
    destination,
    departure,
    arrival,
    seatCap,
    price
  } = req.body;

  let errors = {};

  if (!flightNum || flightNum.length !== 5) {
    errors.flightNum = 'Flight number must be exactly 5 characters long.';
  }

  if (origin === destination) {
      errors.destination = 'Origin and destination cannot be the same.';
    }

  const departureDate = new Date(departure);
  const arrivalDate = new Date(arrival);

  if (arrivalDate < departureDate) {
    errors.arrival = 'Arrival time cannot be earlier than departure time.';
  }

  if (price < 0) {
    errors.price = 'Price cannot be negative.';
  }

  if (seatCap < 0) {
    errors.seatCap = 'Seat capacity cannot be negative.';
  }

  if (Object.keys(errors).length > 0) {
    return res.render('flights/add', {
      layout: 'AdminMain',
      errors,
      flight: {
        flightNum,
        airline,
        aircraftType,
        origin,
        destination,
        departure,
        arrival,
        seatCap,
        price
      }
    });
  }

  try {
    const newFlight = new Flight({
      flightNum,
      airline,
      aircraftType,
      origin,
      destination,
      departure,
      arrival,
      seatCap,
      price
    });

    if (!newFlight.seats || newFlight.seats.length === 0) {
      const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
      for (let i = 1; i <= 10; i++) {
        for (const row of rows) {
          newFlight.seats.push({ seatNumber: `${row}${i}`, isVacant: true });
        }
      }
    }

    await newFlight.save();
    res.redirect('/flights');
  } catch (err) {
    if (err.name === 'ValidationError') {
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
    }

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      errors[duplicateField] = `${duplicateField} already exists.`;
    }

    res.render('flights/add', {
      layout: 'AdminMain',
      errors,
      flight: {
        flightNum,
        airline,
        aircraftType,
        origin,
        destination,
        departure,
        arrival,
        seatCap,
        price
      }
    });
  }
});

//index
router.get('/', (req, res) => {
  Flight.find().lean()
    .then(data => {
      res.render('flights/index', { layout: 'AdminMain', flight: data });
    })
    .catch(err => {
      console.log('Error during fetching operation:\n', err);
    });
});

//edit
router.get('/edit/:id', (req, res) => {
  Flight.findById(req.params.id).lean()
    .then(data => res.render('flights/edit', { layout: 'AdminMain', flight: data }))
    .catch(err => console.log('Error while retrieving the record:\n', err));
});

router.post('/edit/:id', async (req, res) => {
  const {
    flightNum,
    airline,
    aircraftType,
    origin,
    destination,
    departure,
    arrival,
    seatCap,
    price
  } = req.body;

  let errors = {};

  // validation
  if (!flightNum || flightNum.length !== 5) {
    errors.flightNum = 'Flight number must be exactly 5 characters long.';
  }

  if (origin === destination) {
    errors.destination = 'Origin and destination cannot be the same.';
  }

  const departureDate = new Date(departure);
  const arrivalDate = new Date(arrival);

  if (arrivalDate < departureDate) {
    errors.arrival = 'Arrival time cannot be earlier than departure time.';
  }

  if (price < 0) {
    errors.price = 'Price cannot be negative.';
  }

  if (seatCap < 0) {
    errors.seatCap = 'Seat capacity cannot be negative.';
  }

  if (Object.keys(errors).length > 0) {
    return res.render('flights/edit', {
      layout: 'AdminMain',
      errors,
      flight: {
        _id: req.params.id,
        flightNum,
        airline,
        aircraftType,
        origin,
        destination,
        departure,
        arrival,
        seatCap,
        price
      }
    });
  }

  // update
  try {
    await Flight.findByIdAndUpdate(req.params.id, {
      flightNum,
      airline,
      aircraftType,
      origin,
      destination,
      departure,
      arrival,
      seatCap,
      price
    });

    res.redirect('/flights');
  } catch (err) {
    if (err.name === 'ValidationError') {
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
    }

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      errors[duplicateField] = `${duplicateField} already exists.`;
    }

    res.render('flights/edit', {
      layout: 'AdminMain',
      errors,
      flight: {
        _id: req.params.id,
        flightNum,
        airline,
        aircraftType,
        origin,
        destination,
        departure,
        arrival,
        seatCap,
        price
      }
    });
  }
});

//delete
router.post('/delete/:id', (req, res) => {
  Flight.findByIdAndDelete(req.params.id)
    .then(() => res.redirect('/flights'))
    .catch(err => console.log('error during deletion:\n', err))
})

module.exports = router;