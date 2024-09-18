// routes/illnessRoutes.js
const express = require('express');
const router = express.Router();
const illnessController = require('../controllers/illnessController');

router.post('/', illnessController.createIllness);

router.get('/', illnessController.getAllIllnesses);

router.get('/:id', illnessController.getIllnessById);

router.put('/:id', illnessController.updateIllness);

router.delete('/:id', illnessController.deleteIllness);

module.exports = router;