const Chicken = require('../models/chicken');
const { calculateEggProductionForAll, calculateEggProduction } = require('../services/chickenService');

const createChicken = async (req, res) => {
  try {
    console.log(req.body)
    const chicken = new Chicken(req.body);
    console.log(chicken)
    await chicken.save();
    res.status(201).send(chicken);
  } catch (error) {
    res.status(400).send(error);
  }
};

const updateChicken = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, totalCount, birthDate } = req.body;

    const updatedGroup = await Chicken.findByIdAndUpdate(
      id,
      { name, totalCount, birthDate, modifiedAt: Date.now() },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ message: 'Chicken group not found' });
    }

    res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getChickenGroups = async (req, res) => {
  try {
    const chickenGroups = await Chicken.find();
    res.status(200).send(chickenGroups);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getChickenGroup = async (req, res) => {
  try {
    const chickenGroup = await Chicken.findById(req.params.id);
    if (!chickenGroup) {
      return res.status(404).send({ message: 'Chicken group not found' });
    }
    res.status(200).send(chickenGroup);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getTotalChickens = async (req, res) => {
  try {
    const chickenGroups = await Chicken.find();
    const totalChickens = chickenGroups.reduce((acc, group) => acc + group.totalCount, 0);
    res.status(200).send({ totalChickens });
  } catch (error) {
    res.status(400).send(error);
  }
};

const estimateEggProductionForGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { timeFrame, value, startDate, endDate } = req.body;

    const group = await Chicken.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Chicken group not found' });
    }

    const eggProduction = calculateEggProduction(group, timeFrame, value, startDate, endDate);

    res.json({ eggProduction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const estimateEggProductionForAll = async (req, res) => {
    const { timeFrame, value, startDate, endDate } = req.body;
  
    try {
      const result = await calculateEggProductionForAll(timeFrame, value, startDate, endDate);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

module.exports = {
  createChicken,
  updateChicken,
  getChickenGroups,
  getChickenGroup,
  getTotalChickens,
  estimateEggProductionForGroup,
  estimateEggProductionForAll
};