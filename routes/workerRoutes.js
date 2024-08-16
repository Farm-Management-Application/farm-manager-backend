// routes/workerRoutes.js
const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');

// Create a new worker
router.post('/', workerController.createWorker);

// Get all workers
router.get('/', workerController.getAllWorkers);

// Get a worker by ID
router.get('/:id', workerController.getWorkerById);

// Update a worker by ID
router.put('/:id', workerController.updateWorker);

// Delete a worker by ID
router.put('/deactivate/:id', workerController.deactivateWorker);

router.put('/activate/:id', workerController.ativateWorker);

module.exports = router;
