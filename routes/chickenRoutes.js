const express = require('express');
const {
  createChicken,
  updateChicken,
  getChickenGroups,
  getChickenGroup,
  getTotalChickens,
  estimateEggProductionForGroup,
  estimateEggProductionForAll
} = require('../controllers/chickenController');

const router = express.Router();

router.post('/', createChicken);
router.put('/:id', updateChicken);
router.get('/total', getTotalChickens);
router.get('/', getChickenGroups);
router.get('/:id', getChickenGroup);
router.post('/:groupId/egg-production', estimateEggProductionForGroup);
router.post('/egg-production', estimateEggProductionForAll);

module.exports = router;