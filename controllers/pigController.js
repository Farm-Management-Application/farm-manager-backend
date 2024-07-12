const Pig = require('../models/pig');
const { pigTypes } = require('../data/pigData');
const moment = require('moment');

// Set the locale to French
moment.locale('fr');

const determinePigType = (birthDate) => {
  const ageMonths = moment.duration(moment().diff(birthDate)).asMonths();

  if (ageMonths >= 12) {
    return 'grand';
  } else if (ageMonths >= 6) {
    return 'moyen';
  } else {
    return 'petit';
  }
};

// Create a pig group
const createPigGroup = async (req, res) => {
  const { name, totalCount, foodConsumption, birthDate } = req.body;

  try {
    const type = determinePigType(birthDate);

    const newPigGroup = new Pig({
      name,
      totalCount,
      type,
      foodConsumption,
      birthDate,
    });
    await newPigGroup.save();
    res.status(201).json(newPigGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a pig group
const updatePigGroup = async (req, res) => {
  const { id } = req.params;
  const { name, totalCount, foodConsumption, birthDate } = req.body;

  try {
    const type = determinePigType(birthDate);
    const updateData = { name, totalCount, type, foodConsumption, birthDate, modifiedAt: Date.now() };

    const updatedPigGroup = await Pig.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPigGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(updatedPigGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all pig groups
const getAllPigGroups = async (req, res) => {
  try {
    const pigGroups = await Pig.find();
    res.status(200).json(pigGroups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific pig group
const getPigGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    const pigGroup = await Pig.findById(id);
    if (!pigGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(pigGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get total pig count
const getTotalPigCount = async (req, res) => {
  try {
    const allPigGroups = await Pig.find();
    const totalPigCount = allPigGroups.reduce((total, pigGroup) => total + pigGroup.totalCount, 0);
    res.status(200).json({ totalPigCount });
  } catch (error) {
    res.status (500).json({ error: error.message });
  }
};

// Estimate the price for a specific pig group
const estimatePriceForPigGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const pigGroup = await Pig.findById(id);
    if (!pigGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const pigTypeData = pigTypes[pigGroup.type];
    const pigAge = moment.duration(moment().diff(pigGroup.birthDate)).asMonths();

    if (pigGroup.type !== 'grand' || pigAge < pigTypeData.sellAgeMonths) {
      return res.status(400).json({ message: 'Pig group not yet ready for sale' });
    }

    const totalPrice = pigGroup.totalCount * pigTypeData.unitPrice;
    const weeksInAge = moment.duration(moment().diff(pigGroup.createdAt)).asWeeks();
    const foodConsumptionTotal = Math.floor(pigGroup.foodConsumption.sacks * pigGroup.foodConsumption.pricePerSack * weeksInAge);
    const profit = totalPrice - foodConsumptionTotal;

    res.status(200).json({ totalPrice, foodConsumptionTotal, profit, 'pigAge' : moment.duration(pigAge, 'weeks').humanize() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Estimate the price for all eligible pig groups
const estimatePriceForAllPigGroups = async (req, res) => {
  try {
    const allPigGroups = await Pig.find();

    if (!allPigGroups.length) {
      return res.status(404).json({ message: 'No pig groups found' });
    }

    const oldestGroupCreationDate = allPigGroups.reduce((oldest, pigGroup) => {
      return moment(pigGroup.birthDate).isBefore(oldest) ? pigGroup.birthDate : oldest;
    }, allPigGroups[0].birthDate);

    const eligiblePigGroups = allPigGroups.filter(pigGroup => {
      const pigTypeData = pigTypes[pigGroup.type];
      const pigAge = moment.duration(moment().diff(pigGroup.birthDate)).asMonths();
      return pigGroup.type === 'grand' && pigAge >= pigTypeData.sellAgeMonths;
    });

    const totalEligiblePigCount = eligiblePigGroups.reduce((total, pigGroup) => total + pigGroup.totalCount, 0);
    const totalPrice = Math.floor(eligiblePigGroups.reduce((total, pigGroup) => {
      const pigTypeData = pigTypes[pigGroup.type];
      return total + (pigGroup.totalCount * pigTypeData.unitPrice);
    }, 0));

    const weeksInAge = moment.duration(moment().diff(oldestGroupCreationDate)).asWeeks();
    const totalFoodConsumption = Math.floor(eligiblePigGroups.reduce((total, pigGroup) => {
      return total + (pigGroup.foodConsumption.sacks * pigGroup.foodConsumption.pricePerSack * weeksInAge);
    }, 0));

    const totalProfit = totalPrice - totalFoodConsumption;

    res.status(200).json({
      totalEligiblePigCount,
      weeksInAge: moment.duration(weeksInAge, 'weeks').humanize(), // humanize weeksInAge
      oldestGroupCreationDate: moment(oldestGroupCreationDate).fromNow(), // humanize oldestGroupCreationDate
      totalPrice,
      totalFoodConsumption,
      totalProfit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPigGroup,
  updatePigGroup,
  getAllPigGroups,
  getPigGroupById,
  getTotalPigCount,
  estimatePriceForPigGroup,
  estimatePriceForAllPigGroups,
};