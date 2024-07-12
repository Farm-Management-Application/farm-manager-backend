// routes/pigRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPigGroup,
  updatePigGroup,
  getAllPigGroups,
  getPigGroupById,
  getTotalPigCount,
  estimatePriceForPigGroup,
  estimatePriceForAllPigGroups,
} = require('../controllers/pigController');

router.post('/', createPigGroup);
router.put('/:id', updatePigGroup);
router.get('/total', getTotalPigCount);
router.get('/', getAllPigGroups);
router.get('/:id', getPigGroupById);
router.post('/:id/estimate-price', estimatePriceForPigGroup);
router.post('/estimate-price', estimatePriceForAllPigGroups);

module.exports = router;