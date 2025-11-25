const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  seatNumber: {
    type: String, required: true },
  isVacant: {
    type: Boolean, default: true },
});

const Seat = mongoose.model('Seat', SeatSchema);

module.exports = { Seat, SeatSchema };