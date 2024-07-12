const moment = require('moment');
const Fish = require('../models/fish');
const { fishTypes } = require('../data/fishData');

// Set the locale to French
moment.locale('fr');

// Créer un groupe de poissons
const createFishGroup = async (req, res) => {
  const { name, totalCount, type, foodConsumption, birthDate } = req.body;

  try {
    if (!fishTypes[type]) {
      return res.status(400).json({ message: 'Invalid fish type' });
    }

    const newFishGroup = new Fish({
      name,
      totalCount,
      type,
      foodConsumption,
      birthDate
    });
    await newFishGroup.save();
    res.status(201).json(newFishGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un groupe de poissons
const updateFishGroup = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body, modifiedAt: Date.now() };

  try {
    const updatedFishGroup = await Fish.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedFishGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(updatedFishGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTotalFishCount = async (req, res) => {
  try {
    const allFishGroups = await Fish.find();
    const totalFishCount = allFishGroups.reduce((total, fishGroup) => total + fishGroup.totalCount, 0);
    res.status(200).json({ totalFishCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtenir tous les groupes de poissons
const getAllFishGroups = async (req, res) => {
  try {
    const fishGroups = await Fish.find();
    res.status(200).json(fishGroups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtenir un groupe de poissons spécifique
const getFishGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    const fishGroup = await Fish.findById(id);
    if (!fishGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(fishGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Estimer le prix de vente pour un groupe spécifique de poissons
const estimatePriceForFishGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const fishGroup = await Fish.findById(id);
    if (!fishGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const fishTypeData = fishTypes[fishGroup.type];
    const fishAge = Math.floor(moment.duration(moment().diff(fishGroup.birthDate)).asMonths());

    if (fishAge < fishTypeData.sellAgeMonths) {
      return res.status(400).json({ message: 'Fish group not yet ready for sale' });
    }

    const totalPrice = Math.floor(fishGroup.totalCount * fishTypeData.unitPrice);
    const weeksInAge = moment.duration(moment().diff(fishGroup.createdAt)).asWeeks();
    const foodConsumptintotal = Math.floor(fishGroup.foodConsumption.sacks * fishGroup.foodConsumption.pricePerSack * weeksInAge);
    const profit = totalPrice - foodConsumptintotal;

    res.status(200).json({ totalPrice, foodConsumptintotal, profit, 'fishAge' : moment.duration(fishAge, 'weeks').humanize() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Estimer le prix de vente pour tous les poissons éligibles à la vente
const estimatePriceForAllFishGroups = async (req, res) => {
  try {
    const allFishGroups = await Fish.find();

    if (!allFishGroups.length) {
      return res.status(404).json({ message: 'No fish groups found' });
    }

    const oldestGroupCreationDate = allFishGroups.reduce((oldest, fishGroup) => {
      return moment(fishGroup.birthDate).isBefore(oldest) ? fishGroup.birthDate : oldest;
    }, allFishGroups[0].birthDate);

    const eligibleFishGroups = allFishGroups.filter(fishGroup => {
      const fishTypeData = fishTypes[fishGroup.type];
      const fishAge = moment.duration(moment().diff(fishGroup.birthDate)).asMonths();
      return fishAge >= fishTypeData.sellAgeMonths;
    });

    const totalEligibleFish = eligibleFishGroups.reduce((total, fishGroup) => {
      return total + fishGroup.totalCount;
    }, 0);

    const totalPrice = Math.floor(eligibleFishGroups.reduce((total, fishGroup) => {
      const fishTypeData = fishTypes[fishGroup.type];
      return total + (fishGroup.totalCount * fishTypeData.unitPrice);
    }, 0));

    const weeksInAge = moment.duration(moment().diff(oldestGroupCreationDate)).asWeeks();
    const totalFoodConsumptionCost = Math.floor(eligibleFishGroups.reduce((total, fishGroup) => {
      return total + (fishGroup.foodConsumption.sacks * fishGroup.foodConsumption.pricePerSack * weeksInAge);
    }, 0));

    const profit = totalPrice - totalFoodConsumptionCost;

    res.status(200).json({ 
      totalEligibleFish, 
      weeksInAge: moment.duration(weeksInAge, 'weeks').humanize(), // humanize weeksInAge
      oldestGroupCreationDate: moment(oldestGroupCreationDate).fromNow(),
      totalPrice, 
      totalFoodConsumptionCost, 
      profit 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFishGroup,
  updateFishGroup,
  getAllFishGroups,
  getFishGroupById,
  getTotalFishCount,
  estimatePriceForFishGroup,
  estimatePriceForAllFishGroups
};