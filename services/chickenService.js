const moment = require('moment');
const Chicken = require('../models/chicken');
const { 
  eggPerWeek,
  eggPerTray, 
  pricePerTray, 
  minAgeforLay, 
  sackConsumptionPerDay,
  standardHenNumber, 
  pricePersack 
} = require('../data/chickenData');

// Set the locale to French
moment.locale('fr');

const calculateEggProduction = (group, timeFrame, value, startDate, endDate) => {
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

  // Calculate the age of the chicken group in weeks
  const chickenAgeWeeks = moment.duration(moment().diff(group.birthDate)).asWeeks();

  // Check if the group is eligible (age >= 17 weeks)
  if (chickenAgeWeeks < minAgeforLay) {
    return { 
      eggProduction: 0, 
      totalSales: 0, 
      trays: 0, 
      totalConsumption: 0, 
      profit: 0, 
      duration: duration.humanize(), 
      chickenAge: chickenAgeWeeks 
    };
  }

  // Calculate the egg production
  const eggProduction = Math.floor(duration.asDays() * group.totalCount);
  const trays = Math.floor(eggProduction / eggPerTray);

  // Calculate daily consumption per hen
  const dailyConsumptionPerHen = sackConsumptionPerDay / standardHenNumber;

  // Calculate total food consumption
  const totalConsumption = Math.floor(dailyConsumptionPerHen * group.totalCount * duration.asDays() * pricePersack);

  const totalSales = trays * pricePerTray;

  const profit = totalSales - totalConsumption;

  return { 
    eggProduction, 
    totalSales, 
    trays, 
    totalConsumption, 
    profit, 
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

  // Calculate daily consumption per hen
  const dailyConsumptionPerHen = sackConsumptionPerDay / standardHenNumber;

  // Calculate total food consumption cost
  const totalFoodConsumptionCost = eligibleChickens.reduce((total, chicken) => {
    return total + (dailyConsumptionPerHen * chicken.totalCount * duration.asDays() * pricePersack);
  }, 0);

  const profit = totalSales - totalFoodConsumptionCost;

  return {
    duration: duration.humanize(),
    eggProduction,
    totalEggTrays,
    totalSales,
    totalFoodConsumptionCost,
    profit
  };
};

module.exports = {
  calculateEggProduction,
  calculateEggProductionForAll
};