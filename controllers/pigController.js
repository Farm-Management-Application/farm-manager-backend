const Pig = require('../models/Pig');
const { 
  freqConsumption,
  sackConsumption,
  pricePerSack, 
  pigTypes,
  standardPigNumber
} = require('../data/pigData');
const moment = require('moment');
const WorkerService = require('../services/workerService');
const IllnessService = require('../services/illnessService');

// Set the locale to French
moment.locale('fr');

const determinePigType = (birthDate) => {
  const ageMonths = Math.floor(moment.duration(moment().diff(birthDate)).asMonths());

  console.log(ageMonths)

  if (ageMonths >= 12) {
    return 'grand';
  } else if (ageMonths >= 5 && ageMonths <= 11) {
    return 'moyen';
  } else if (ageMonths <= 4) {
    return 'petit';
  }
};

// Create a pig group
const createPigGroup = async (req, res) => {
  const { name, totalCount, birthDate } = req.body;

  try {
    const type = determinePigType(birthDate);

    const newPigGroup = new Pig({
      name,
      totalCount,
      type,
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
  const { name, totalCount, birthDate } = req.body;

  try {
    const type = determinePigType(birthDate);
    const updateData = { name, totalCount, type, birthDate, modifiedAt: Date.now() };

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
    const pigAgeMonths = Math.floor(moment.duration(moment().diff(pigGroup.birthDate)).asMonths());

    if (pigGroup.type === 'moyen') {
      return res.status(400).json({ message: 'Pig group not yet ready for sale' });
    }

    const totalPrice = pigGroup.totalCount * pigTypeData.unitPrice;
    const weeksInAge = Math.floor(moment.duration(moment().diff(pigGroup.birthDate)).asWeeks());

    // Calculate total food consumption cost
    const feedPeriods = weeksInAge;
    const foodConsumptionTotal = Math.floor(feedPeriods * (sackConsumption / standardPigNumber) * pricePerSack);

    // Integrate worker salary cost
    const workerSalaryCost = await WorkerService.calculateTotalWorkerSalaryCost({
      startDate: pigGroup.birthDate,
      endDate: new Date(),
      value: pigAgeMonths,
      period: 'months',
    });

    // Integrate illness cost for the pig group
    const illnessCost = await IllnessService.calculateIllnessCostForLivestockGroup(
      pigGroup._id,
      { startDate: pigGroup.birthDate, endDate: new Date(), value: pigAgeMonths, period: 'months' }
    );

    const profit = totalPrice - foodConsumptionTotal - workerSalaryCost - illnessCost;
    const finalProfit = profit < 0 ? 0 : profit;

    res.status(200).json({
      totalPrice,
      foodConsumptionTotal: Math.floor(foodConsumptionTotal),
      workerSalaryCost: Math.floor(workerSalaryCost),
      illnessCost: Math.floor(illnessCost),
      profit: Math.floor(finalProfit),
      pigAge: moment.duration(pigAgeMonths, 'months').humanize(),
    });
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
      return pigGroup.type === 'grand' || pigGroup.type === 'petit';
    });

    const totalEligiblePigCount = eligiblePigGroups.reduce((total, pigGroup) => total + pigGroup.totalCount, 0);
    const totalPrice = eligiblePigGroups.reduce((total, pigGroup) => {
      const pigTypeData = pigTypes[pigGroup.type];
      return total + (pigGroup.totalCount * pigTypeData.unitPrice);
    }, 0);

    const weeksInAge = moment.duration(moment().diff(oldestGroupCreationDate)).asWeeks();

    const totalFoodConsumption = Math.floor(eligiblePigGroups.reduce((total, pigGroup) => {
      const feedPeriods = weeksInAge;
      return total + (feedPeriods * (sackConsumption / standardPigNumber) * pricePerSack);
    }, 0));

    // Integrate worker salary cost
    const workerSalaryCost = await WorkerService.calculateTotalWorkerSalaryCost({
      startDate: oldestGroupCreationDate,
      endDate: new Date(),
      value: weeksInAge,
      period: 'weeks',
    });

    // Integrate illness cost for all eligible pig groups
    const illnessCost = await IllnessService.calculateIllnessCostForLivestockType('Pig', {
      startDate: oldestGroupCreationDate,
      endDate: new Date(),
      value: weeksInAge,
      period: 'weeks',
    });

    const totalProfit = totalPrice - totalFoodConsumption - workerSalaryCost - illnessCost;
    const finalProfit = totalProfit < 0 ? 0 : totalProfit;

    res.status(200).json({
      totalEligiblePigCount,
      weeksInAge: moment.duration(weeksInAge, 'weeks').humanize(),
      oldestGroupCreationDate: moment(oldestGroupCreationDate).fromNow(),
      totalPrice,
      totalFoodConsumption: Math.floor(totalFoodConsumption),
      workerSalaryCost: Math.floor(workerSalaryCost),
      illnessCost: Math.floor(illnessCost),
      totalProfit: Math.floor(finalProfit),
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