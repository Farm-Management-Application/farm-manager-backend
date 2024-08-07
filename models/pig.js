// models/Pig.js
const mongoose = require('mongoose');

const PigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['petit', 'moyen', 'grand'], // Available types
  },
  birthDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Pig', PigSchema);