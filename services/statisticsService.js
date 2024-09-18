const Pig = require('../models/Pig'); // Your models
const Worker = require('../models/Worker');
const Illness = require('../models/Illness');
const { getAllIllnesses } = require('../controllers/illnessController');

async function getTotalLivestockCount() {
  const totalPigs = await Pig.aggregate([{ $group: { _id: null, totalCount: { $sum: "$totalCount" } } }]);
  return totalPigs[0]?.totalCount || 0;
}

async function getAverageSalary() {
  try {
    const result = await Worker.aggregate([
      {
        $group: {
          _id: null,
          avgSalary: { $avg: "$salary" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Extract average salary and number of workers
    const avgSalary = result[0]?.avgSalary || 0;
    const numberOfWorkers = result[0]?.count || 0;

    return {
      avgSalary,
      numberOfWorkers
    };
  } catch (error) {
    console.error('Error calculating average salary:', error);
    throw error;
  }
}

async function getIllnessImpact() {
  try {
    const illnesses = await Illness.find({ isDeleted: false });
    
    let totalAffected = 0;
    let totalCost = 0;

    illnesses.forEach(illness => {
      totalAffected += illness.affectedCount;
      totalCost += illness.treatmentCost;
    });

    console.log({ totalAffected, totalCost })

    return { totalAffected, totalCost };
  } catch (error) {
    console.error(`Error calculating illness impact: ${error.message}`);
    throw error;
  }
}

module.exports = { getTotalLivestockCount, getAverageSalary, getIllnessImpact };