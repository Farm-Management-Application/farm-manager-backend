// data/pigData.js
const freqConsumption = 7; // 1 week
const sackConsumption = 6; // for every 
const pricePerSack = 12000;
const standardPigNumber = 42;

module.exports = {
  freqConsumption,
  sackConsumption,
  pricePerSack,
  standardPigNumber,

    pigTypes: {
      petit: {
        sellAgeMonths: 4,
        unitPrice: 35000,
      },
      moyen: {
        sellAgeMonths: 0,
        unitPrice: 0,
      },
      grand: {
        sellAgeMonths: 12,
        unitPrice: 300000,
      },
    },
  };  