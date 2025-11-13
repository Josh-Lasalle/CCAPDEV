const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Flight = require('../models/flight.model');
const User = require('../models/user.model');
const Passenger  = require('../models/passenger.model');
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
router.get('/profile', (req, res) => {
  if (!req.session.userId) {
      return res.redirect('/users/login');
  }
  User.findById(req.session.userId).lean()
    .then(user => {
      if (!user) {
        return res.redirect('/users/login');
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
      if (req.query.error === '3') {
        errorMessage = 'Username must be at least 3 characters';
      }
      if (req.query.error === '4') {
        errorMessage = 'Password must be at least 8 characters';
      }
      if (req.query.error === '5') {
        errorMessage = 'Email is invalid';
      }
      res.render('client/ClientProfile', {
        title: 'Client Profile Page',
        user: user,
        successMsg: successMessage,
        errorMsg: errorMessage
      });
    })
    .catch(err => {
      console.error(err);
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

router.post('/submitReservation', async (req, res) => {
  try {
    const userId = req.session.userId; // get user from session
    if (!userId) return res.status(401).send('User not logged in');

    const { fullName, email, passportID, flightNum, meal, baggage, seatSelection } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    // Fetch flight to get base price
    const flight = await Flight.findOne({ flightNum });
    if (!flight) return res.status(404).send('Flight not found');

    // Compute meal charge
    let mealCharge = 0;
    if (meal !== 'No Meal') {
      mealCharge = 300;
    }

    // Compute baggage charge
    let baggageCharge = 0;
    switch (baggage) {
      case '20 kg': baggageCharge = 500; break;
      case '24 kg': baggageCharge = 750; break;
      case '28 kg': baggageCharge = 1000; break;
      case '32 kg': baggageCharge = 1250; break;
      default: baggageCharge = 0; // No Baggage
    }

    // Total price
    const totalPrice = flight.price + mealCharge + baggageCharge;

    // Generate unique reference number
    const passengerCount = await Passenger.countDocuments();
    const referenceNum = `X${passengerCount + 1}`;

    // Create passenger
    const newPassenger = new Passenger({
      fullName,
      email,
      passportID,
      flightNum,
      meal,
      baggage,
      seat: seatSelection,
      referenceNum,
      price: totalPrice,
    });
    await newPassenger.save();

    // Add reference number to user
    if (!user.referenceNums) user.referenceNums = [];
    user.referenceNums.push(referenceNum);
    await user.save();

    // Mark seat as occupied and increment passenger count
    await Flight.updateOne(
      { flightNum, 'seats.seatNumber': seatSelection },
      { 
        $set: { 'seats.$.isVacant': false },
        $inc: { passengerCount: 1 }
      }
    );

    res.redirect('/client/success');

  } catch (err) {
    console.error('Error creating passenger:', err);
    res.status(400).send('Error creating passenger: ' + err.message);
  }
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

// Reservations
router.get('/reservations', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/users/login');

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).send('User not found');

    // Get all passengers booked by this user
    const passengers = await Passenger.find({ referenceNum: { $in: user.referenceNums } }).lean();

    // Prepare reservation data with flight info
    const reservations = [];
    for (const p of passengers) {
      const flight = await Flight.findOne({ flightNum: p.flightNum }).lean();
      if (flight) {
        reservations.push({
          referenceNum: p.referenceNum,
          flightNum: p.flightNum,
          origin: flight.origin,
          destination: flight.destination,
          departureDate: flight.departureDate, // Pass as-is
          departureTime: flight.departureTime,
          arrivalDate: flight.arrivalDate, // Pass as-is
          arrivalTime: flight.arrivalTime,
          seat: p.seat,
          fullName: p.fullName
        });
      }
    }

    res.render('client/ClientReservations', {
      title: 'My Reservations',
      username: user.username,
      reservations
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/ClientDetails/:referenceNum', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/users/login');

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).send('User not found');

    const referenceNum = req.params.referenceNum;

    // Find all passengers with this reference number
    const passengers = await Passenger.find({ referenceNum }).lean();
    if (!passengers || passengers.length === 0) {
      return res.status(404).send('No passengers found for this booking');
    }

    
    const flightNum = passengers[0].flightNum;

    // Get flight details
    const flight = await Flight.findOne({ flightNum }).lean();
    if (!flight) return res.status(404).send('Flight not found');

    res.render('client/ClientDetails', {
      title: 'Reservation Details',
      flight,
      passengers,
      referenceNum
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/ClientEditPassenger/:id', async (req, res) => {
  try {
    const passenger = await Passenger.findById(req.params.id).lean();
    if (!passenger) return res.status(404).send('Passenger not found');

    const flight = await Flight.findOne({ flightNum: passenger.flightNum }).lean();
    if (!flight) return res.status(404).send('Flight not found');

    // Prepare seatsByRow structure
    const rows = ['A','B','C','D','E','F','G','H','I','J'];
    const seatsByRow = {};

    rows.forEach(row => {
  const rowSeats = flight.seats
    .map(seat => {
      if (seat.seatNumber.startsWith(row)) {
        // Mark the passenger's current seat as checked
        return {
          ...seat,
          checked: seat.seatNumber === passenger.seat,
          isVacant: seat.isVacant || seat.seatNumber === passenger.seat // treat current seat as selectable
        };
      }
      return null;
    })
    .filter(s => s !== null);

  seatsByRow[row] = {
    left: rowSeats.slice(0,3),
    right: rowSeats.slice(3,6)
      };
    });

    res.render('client/ClientEditPassenger', {
      passenger,
      flight,
      seatsByRow
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/editPassenger/:passengerId', async (req, res) => {
  try {
    const { fullName, email, passportID, meal, baggage, seatSelection } = req.body;
    const passenger = await Passenger.findById(req.params.passengerId);
    if (!passenger) return res.status(404).send('Passenger not found');

    const flight = await Flight.findOne({ flightNum: passenger.flightNum });
    if (!flight) return res.status(404).send('Flight not found');

    // Update passenger info
    passenger.fullName = fullName;
    passenger.email = email;
    passenger.passportID = passportID;
    passenger.meal = meal;
    passenger.baggage = baggage;

    // Recalculate price using same logic as add
    let mealCharge = 0;
    if (meal !== 'No Meal') mealCharge = 300;

    let baggageCharge = 0;
    switch (baggage) {
      case '20 kg': baggageCharge = 500; break;
      case '24 kg': baggageCharge = 750; break;
      case '28 kg': baggageCharge = 1000; break;
      case '32 kg': baggageCharge = 1250; break;
      default: baggageCharge = 0;
    }

    passenger.price = flight.price + mealCharge + baggageCharge;

    // Update seat if changed
    if (passenger.seat !== seatSelection) {
      // Free previous seat
      const prevSeat = flight.seats.find(s => s.seatNumber === passenger.seat);
      if (prevSeat) prevSeat.isVacant = true;

      // Occupy new seat
      const newSeat = flight.seats.find(s => s.seatNumber === seatSelection);
      if (newSeat) newSeat.isVacant = false;

      passenger.seat = seatSelection;
      await flight.save();
    }

    await passenger.save();
    res.redirect(`/client/ClientDetails/${passenger.referenceNum}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE passenger
router.post('/deletePassenger/:passengerId', async (req, res) => {
  try {
    const passenger = await Passenger.findById(req.params.passengerId);
    if (!passenger) return res.status(404).send('Passenger not found');

    // Free the seat and decrement passengerCount in the flight
    await Flight.updateOne(
      { flightNum: passenger.flightNum, 'seats.seatNumber': passenger.seat },
      {
        $set: { 'seats.$.isVacant': true },
        $inc: { passengerCount: -1 }
      }
    );

    // Remove reference number from user
    const user = await User.findOne({ referenceNums: passenger.referenceNum });
    if (user) {
      user.referenceNums = user.referenceNums.filter(ref => ref !== passenger.referenceNum);
      await user.save();
    }

    // Delete passenger document
    await Passenger.findByIdAndDelete(passenger._id);

    res.redirect(`/client/reservations`);
  } catch (err) {
    console.error('Error deleting passenger:', err);
    res.status(500).send('Server error');
  }
});

// Client Success
router.get('/success', (req, res) => {
  res.render('client/ClientSuccess', { 
    title: 'Client Success Page', 
  });
});

module.exports = router;

