const express = require('express');
const chickenRoutes = require('./chickenRoutes');
const fishRoutes = require('./fishRoutes')
const pigRoutes = require('./pigRoutes')
const workerRoutes = require('./workerRoutes')
const illnessRoutes = require('./illnessRoutes')

const router = express.Router();

router.use('/chickens', chickenRoutes);
router.use('/pigs', pigRoutes);
router.use('/fishes', fishRoutes);
router.use('/workers', workerRoutes);
router.use('/illness', illnessRoutes);

module.exports = router;