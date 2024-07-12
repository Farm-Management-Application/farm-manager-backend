const express = require('express');
const chickenRoutes = require('./chickenRoutes');
const fishRoutes = require('./fishRoutes')
const pigRoutes = require('./pigRoutes')

const router = express.Router();

router.use('/chickens', chickenRoutes);
router.use('/pigs', pigRoutes);
router.use('/fishes', fishRoutes);

module.exports = router;