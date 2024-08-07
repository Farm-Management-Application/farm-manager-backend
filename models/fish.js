const mongoose = require('mongoose');
const { fishTypes } = require('../data/fishData');

const FishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  totalCount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: Object.keys(fishTypes) // Utilise les types de poissons définis dans fishData.js
  },
  birthDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Fish', FishSchema);