const mongoose = require('mongoose');

const {PassengerSchema} = require('./passenger.model');
const {SeatSchema} = require('./seat.model');


const FlightSchema = new mongoose.Schema({
  flightNum: {
    type: String,
    required: true,
    unique: true,
    length: 5,
    uppercase: true
  },
  airline: {
    type: String,
    required: true,
    default: 'Bing Bong Airlines',
    trim: true
  },
  aircraftType: {
    type: String,
    required: true,
    default: 'Bing Bong Air Carrier',
    trim: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  departureDate:{
    type: Date, 
    required: true
  },
  departureTime:{
    type: String, 
    required: true
  },
  arrivalDate: {
    type: Date,
    required: true
  },
  arrivalTime:{
    type: String, 
    required: true
  },
  passengerCount: {
    type: Number,
    default: 0
  },
  seatCap: {
  type: Number,
  required: true,
  min: 0,
  default: 60
  },
  price: {
    type: Number, 
    required: true,
    min: 0,
    default: 0
  },
  
  passengers: {
    type: [PassengerSchema],
    default: []
},

  seats: {
  type: [SeatSchema],
  default: []
}
});

module.exports = mongoose.model('Flight', FlightSchema)
