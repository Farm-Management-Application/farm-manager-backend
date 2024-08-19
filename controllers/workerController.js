// controllers/workerController.js
const Worker = require('../models/worker');

// Create a new worker
exports.createWorker = async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.status(201).json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all workers
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find();
    res.status(200).json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a worker by ID
exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.status(200).json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a worker by ID
exports.updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.status(200).json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change worker status to inactive by ID
exports.deactivateWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    worker.status = 'inactive';
    await worker.save();

    res.status(200).json({ message: 'Worker status changed to inactive successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change worker status to inactive by ID
exports.activateWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    worker.status = 'active';
    await worker.save();

    res.status(200).json({ message: 'Worker status changed to active successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};