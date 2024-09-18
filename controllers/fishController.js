const moment = require('moment');
const Fish = require('../models/Fish');
const { fishTypes } = require('../data/fishData');
const WorkerService = require('../services/workerService');
const IllnessService = require('../services/illnessService');

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

const estimatePriceForFishGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const fishGroup = await Fish.findById(id);
    if (!fishGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const fishTypeData = fishTypes[fishGroup.type];
    const fishAgeMonths = Math.floor(moment.duration(moment().diff(fishGroup.birthDate)).asMonths());

    if (fishAgeMonths < fishTypeData.sellAgeMonths) {
      return res.status(400).json({ message: 'Fish group not yet ready for sale' });
    }

    const totalWeightKg = fishGroup.totalCount * 1; // 1kg per fish
    const totalPrice = totalWeightKg * fishTypeData.unitPrice;

    const weeksInAge = Math.floor(moment.duration(moment().diff(fishGroup.birthDate)).asWeeks());

    // Calculate total food consumption cost
    let foodConsumptionTotal = 0;
    if (fishTypeData.pricePerSack > 0) {
      const feedPeriods = Math.ceil((weeksInAge * 7) / fishTypeData.feedPeriodDays);
      foodConsumptionTotal = feedPeriods * fishTypeData.pricePerSack;
    }

    // Integrate worker salary cost
    const workerSalaryCost = await WorkerService.calculateTotalWorkerSalaryCost({
      startDate: fishGroup.birthDate,
      endDate: new Date(),
      value: fishAgeMonths,
      period: 'months',
    });

    // Integrate illness cost for the fish group
    const illnessCost = await IllnessService.calculateIllnessCostForLivestockGroup(
      fishGroup._id,
      { startDate: fishGroup.birthDate, endDate: new Date(), value: fishAgeMonths, period: 'months' }
    );

    const profit = totalPrice - foodConsumptionTotal - workerSalaryCost - illnessCost;
    const finalProfit = profit < 0 ? 0 : profit;

    res.status(200).json({
      totalPrice,
      foodConsumptionTotal: Math.floor(foodConsumptionTotal),
      workerSalaryCost: Math.floor(workerSalaryCost),
      illnessCost: Math.floor(illnessCost),
      profit: Math.floor(finalProfit),
      fishAge: moment.duration(fishAgeMonths, 'months').humanize(),
      totalWeightKg,
    });
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
      const fishTypeData = fishTypes[fishGroup.type];
      if (fishTypeData.pricePerSack > 0) {
        const feedPeriods = Math.ceil(weeksInAge / (fishTypeData.feedPeriodDays / 7));
        return total + (feedPeriods * fishTypeData.pricePerSack);
      }
      return total;
    }, 0));

    // Integrate worker salary cost
    const workerSalaryCost = await WorkerService.calculateTotalWorkerSalaryCost({
      startDate: oldestGroupCreationDate,
      endDate: new Date(),
      value: weeksInAge,
      period: 'weeks',
    });

    // Integrate illness cost for all eligible fish groups
    const illnessCost = await IllnessService.calculateIllnessCostForLivestockType('Fish', {
      startDate: oldestGroupCreationDate,
      endDate: new Date(),
      value: weeksInAge,
      period: 'weeks',
    });

    const profit = totalPrice - totalFoodConsumptionCost - workerSalaryCost - illnessCost;
    const finalProfit = profit < 0 ? 0 : profit;

    res.status(200).json({
      totalEligibleFish,
      weeksInAge: moment.duration(weeksInAge, 'weeks').humanize(),
      oldestGroupCreationDate: moment(oldestGroupCreationDate).fromNow(),
      totalPrice,
      totalFoodConsumptionCost,
      workerSalaryCost: Math.floor(workerSalaryCost),
      illnessCost: Math.floor(illnessCost),
      profit: Math.floor(finalProfit),
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