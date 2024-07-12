const express = require('express');
const router = express.Router();
const {
  createFishGroup,
  updateFishGroup,
  getAllFishGroups,
  getFishGroupById,
  getTotalFishCount,
  estimatePriceForFishGroup,
  estimatePriceForAllFishGroups
} = require('../controllers/fishController');

router.post('/', createFishGroup);
router.put('/:id', updateFishGroup);
router.get('/total', getTotalFishCount);
router.get('/', getAllFishGroups);
router.get('/:id', getFishGroupById);
router.post('/:id/estimate-price', estimatePriceForFishGroup);
router.post('/estimate-price', estimatePriceForAllFishGroups);

module.exports = router;
