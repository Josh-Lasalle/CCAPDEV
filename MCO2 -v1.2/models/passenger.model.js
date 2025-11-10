const mongoose = require('mongoose');

const PassengerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  passportID: String,
  flightNum: String,
  meal: String,
  seat: String,
  baggage: String,
  referenceNum: String,
});

const Passenger = mongoose.model('Passenger', PassengerSchema);

module.exports = { Passenger, PassengerSchema };