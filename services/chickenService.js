const moment = require('moment');
const Chicken = require('../models/chicken');
const WorkerService = require('../services/workerService');
const IllnessService = require('../services/illnessService');
const { 
  eggPerWeek,
  eggPerTray, 
  pricePerTray, 
  minAgeforLay, 
  sackConsumptionPerDay,
  standardHenNumber, 
  pricePersack 
} = require('../data/chickenData');
const ObjectId = require('mongodb').ObjectId;

// Set the locale to French
moment.locale('fr');

const calculateEggProduction = async (group, timeFrame, value, startDate, endDate) => {
  const startDateMoment = moment(startDate);
  const endDateMoment = moment(endDate);

  let duration;
  if (timeFrame === 'month') {
    duration = moment.duration(value, 'months');
  } else if (timeFrame === 'week') {
    duration = moment.duration(value, 'weeks');
  } else if (timeFrame === 'custom') {
    duration = moment.duration(endDateMoment.diff(startDateMoment));
  } else {
    throw new Error('Invalid timeFrame');
  }

  const chickenAgeWeeks = moment.duration(moment().diff(group.birthDate)).asWeeks();

  const groupId = new ObjectId(group._id);
  const workerSalaryCost = await WorkerService.calculateTotalWorkerSalaryCost({ startDate, endDate, value, period: timeFrame });
  const illnessCost = await IllnessService.calculateIllnessCostForLivestockGroup(groupId, { startDate, endDate, value, period: timeFrame });

  if (chickenAgeWeeks < minAgeforLay) {
    return { 
      eggProduction: 0, 
      totalSales: 0, 
      trays: 0, 
      totalConsumption: 0, 
      profit: 0, 
      workerSalaryCost: Math.floor(workerSalaryCost),
      illnessCost: Math.floor(illnessCost),
      duration: duration.humanize(), 
      chickenAge:  moment.duration(chickenAgeWeeks, 'weeks').humanize()  
    };
  }

  const eggProduction = Math.floor(duration.asDays() * group.totalCount);
  const trays = Math.floor(eggProduction / eggPerTray);

  const dailyConsumptionPerHen = sackConsumptionPerDay / standardHenNumber;
  const totalConsumption = Math.floor(dailyConsumptionPerHen * group.totalCount * duration.asDays() * pricePersack);

  const totalSales = trays * pricePerTray;

  const profit = totalSales - totalConsumption - workerSalaryCost - illnessCost;
  // const profit = totalSales - totalConsumption;

  return { 
    eggProduction, 
    totalSales, 
    trays, 
    totalConsumption: Math.floor(totalConsumption), 
    profit: Math.floor(profit), 
    workerSalaryCost: Math.floor(workerSalaryCost),
    illnessCost: Math.floor(illnessCost),
    duration: duration.humanize(), 
    chickenAge: moment.duration(chickenAgeWeeks, 'weeks').humanize() 
  };
};

const calculateEggProductionForAll = async (timeFrame, value, startDate, endDate) => {
  const startDateMoment = moment(startDate);
  const endDateMoment = moment(endDate);

  let duration;
  if (timeFrame === 'month') {
    duration = moment.duration(value, 'months');
  } else if (timeFrame === 'week') {
    duration = moment.duration(value, 'weeks');
  } else if (timeFrame === 'custom') {
    duration = moment.duration(endDateMoment.diff(startDateMoment));
  } else {
    throw new Error('Invalid timeFrame');
  }

  const allChickens = await Chicken.find();

  const eligibleChickens = allChickens.filter(chicken => {
    const chickenAge = moment.duration(moment().diff(chicken.birthDate)).asWeeks();
    return chickenAge >= minAgeforLay;
  });

  const eggProduction = Math.floor(eligibleChickens.reduce((total, chicken) => {
    return total + (duration.asDays() * chicken.totalCount);
  }, 0));

  const totalEggTrays = Math.floor(eggProduction / eggPerTray);
  const totalSales = totalEggTrays * pricePerTray;

  const dailyConsumptionPerHen = sackConsumptionPerDay / standardHenNumber;
  const totalFoodConsumptionCost = eligibleChickens.reduce((total, chicken) => {
    return total + (dailyConsumptionPerHen * chicken.totalCount * duration.asDays() * pricePersack);
  }, 0);

  const workerSalaryCost = await WorkerService.calculateTotalWorkerSalaryCost({ startDate, endDate, value, period: timeFrame });
  const illnessCost = await IllnessService.calculateIllnessCostForLivestockType('Chicken', { startDate, endDate, value, period: timeFrame });

  const profit = totalSales - totalFoodConsumptionCost - workerSalaryCost - illnessCost;

  return {
    duration: duration.humanize(),
    eggProduction,
    totalEggTrays,
    totalSales,
    totalFoodConsumptionCost: Math.floor(totalFoodConsumptionCost), 
    workerSalaryCost: Math.floor(workerSalaryCost),
    illnessCost: Math.floor(illnessCost),
    profit: Math.floor(profit), 
  };
};

module.exports = {
  calculateEggProduction,
  calculateEggProductionForAll
};