const Illness = require('../models/Illness');
const Chicken = require('../models/Chicken');
const Fish = require('../models/Fish');
const Pig = require('../models/Pig');
const livestockEnum = require('../data/enum');

// Utility function to check if livestock exists based on type and id
const checkLivestockExists = async (livestockType, livestockId) => {
  let livestockModel;
  switch (livestockType) {
    case 'Chicken':
      livestockModel = Chicken;
      break;
    case 'Fish':
      livestockModel = Fish;
      break;
    case 'Pig':
      livestockModel = Pig;
      break;
    default:
      throw new Error('Invalid livestock type');
  }

  const livestock = await livestockModel.findById(livestockId);
  console.log(livestock)
  if (!livestock) {
    throw new Error(`${livestockType} with ID ${livestockId} not found`);
  }
  return livestock;
};

// Create a new illness record
exports.createIllness = async (req, res) => {
  try {
    const { livestockType, livestockId, affectedCount } = req.body;

    console.log(req.body);

    if (!livestockEnum.includes(livestockType)) {
      return res.status(400).json({ error: 'Invalid livestock type' });
    }

    await checkLivestockExists(livestockType, livestockId);

    console.log(req.body);

    const illness = new Illness(req.body);

    console.log(illness);

    await illness.save();
    res.status(201).json(illness);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

// Get all illness records
exports.getAllIllnesses = async (req, res) => {
  try {
    const illnesses = await Illness.find({ isDeleted: false });
    res.status(200).json(illnesses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get illness record by ID
exports.getIllnessById = async (req, res) => {
  try {
    const illness = await Illness.findById(req.params.id);
    if (!illness || illness.isDeleted) {
      return res.status(404).json({ error: 'Illness not found' });
    }
    res.status(200).json(illness);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update illness record by ID
exports.updateIllness = async (req, res) => {
  try {
    const illness = await Illness.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!illness || illness.isDeleted) {
      return res.status(404).json({ error: 'Illness not found' });
    }
    res.status(200).json(illness);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete illness record by ID (soft delete)
exports.deleteIllness = async (req, res) => {
  try {
    const illness = await Illness.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!illness) {
      return res.status(404).json({ error: 'Illness not found' });
    }
    res.status(200).json({ message: 'Illness deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};