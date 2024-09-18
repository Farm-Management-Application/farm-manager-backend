const mongoose = require('mongoose');

const ChickenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
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
  }
});

ChickenSchema.pre('save', function(next) {
  this.modifiedAt = Date.now();
  next();
});

module.exports = mongoose.model('Chicken', ChickenSchema);