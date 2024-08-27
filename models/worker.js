const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  salary: { type: Number, required: true },
  date_of_joining: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },
  updatedAt: { type: Date, default: Date.now }
});

WorkerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Worker || mongoose.model('Worker', WorkerSchema);