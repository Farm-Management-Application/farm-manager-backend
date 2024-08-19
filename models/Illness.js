const mongoose = require('mongoose');
const livestockEnum = require('../data/enum');

const IllnessSchema = new mongoose.Schema({
  livestockId: {
    type: String,
    required: true,
  },
  livestockType: {
    type: String,
    required: true,
    enum: livestockEnum, // Ensuring the type is one of the defined livestock types
  },
  illnessDescription: {
    type: String,
    required: true,
  },
  treatmentCost: {
    type: Number,
    required: true,
  },
  affectedCount: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

IllnessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Illness', IllnessSchema);