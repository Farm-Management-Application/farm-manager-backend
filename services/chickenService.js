const moment = require('moment');
const Chicken = require('../models/chicken');
const { eggPerWeek, eggPerTray, pricePerTray, minAgeforLay } = require('../data/chickenData');

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

  // Calculate the age of the chicken group in months
  const chickenAge = moment.duration(moment().diff(group.birthDate)).asMonths();

  // Check if the group is eligible (age >= 5 months)
  if (chickenAge < minAgeforLay) {
    return { 'eggProduction' : 0, totalSales: 0, trays : 0, totalConsumption : 0, profit : 0, duration: duration.humanize(), chickenAge };
  }

  // Calculate the egg production in packs
  const eggProduction = Math.floor(duration.asWeeks() * group.totalCount * eggPerWeek);
  const trays = Math.floor(eggProduction / eggPerTray);

  const totalConsumption = Math.floor(group.foodConsumption.sacks * group.foodConsumption.pricePerSack * duration.asWeeks()); 

  const totalSales = trays * pricePerTray;

  const profit = totalSales - totalConsumption;

  return { 'eggProduction' : eggProduction, totalSales, trays, totalConsumption, profit, duration: duration.humanize(), 'chickenAge' : moment.duration(chickenAge, 'weeks').humanize() };
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
    const chickenAge = moment.duration(moment().diff(chicken.birthDate)).asMonths();
    return chickenAge >= minAgeforLay;
  });

  const eggProduction = Math.floor(eligibleChickens.reduce((total, chicken) => {
    return total + (duration.asWeeks() * chicken.totalCount * eggPerWeek);
  }, 0));

  const totalEggTrays = Math.floor(eggProduction / eggPerTray);
  const totalSales = totalEggTrays * pricePerTray;

  const totalFoodConsumptionCost = eligibleChickens.reduce((total, chicken) => {
    return total + (chicken.foodConsumption.sacks * chicken.foodConsumption.pricePerSack * duration.asWeeks());
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