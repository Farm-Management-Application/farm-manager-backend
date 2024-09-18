const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/livestock-count', statisticsController.getTotalLivestockCount);
router.get('/average-salary', statisticsController.getAverageSalary);
router.get('/illness-impact', statisticsController.getIllnessImpact);

module.exports = router;