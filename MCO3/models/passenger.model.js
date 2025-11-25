const mongoose = require('mongoose');

const PassengerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email is invalid'],
  },
  passportID: {
    type: String,
    required: [true, 'Passport ID is required'],
    match: [/^[A-Z]\d{7}$/i, 'Invalid passport format (e.g., A1234567)'],
    uppercase: true,
  },
  flightNum: {
    type: String,
    required: [true, 'Flight number is required'],
  },
  meal: {
    type: String,
    required: [true, 'Meal is required'],
  },
  seat: {
    type: String,
    required: [true, 'Seat number is required'],
  },
  baggage: {
    type: String,
    required: [true, 'Baggage selection is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  referenceNum: {
    type: String,
    required: [true, 'Reference number is required'],
  },
});

module.exports = mongoose.model('Passenger', PassengerSchema);
