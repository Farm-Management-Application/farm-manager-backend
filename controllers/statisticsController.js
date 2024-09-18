const { getTotalLivestockCount, getAverageSalary, getIllnessImpact } = require('../services/statisticsService');

// Get total livestock count
exports.getTotalLivestockCount = async (req, res) => {
  try {
    const count = await getTotalLivestockCount();
    res.status(200).json({ totalCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get average salary
exports.getAverageSalary = async (req, res) => {
  try {
    const salary = await getAverageSalary();
    res.status(200).json({ averageSalary: salary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get illness impact
exports.getIllnessImpact = async (req, res) => {
  try {
    const impact = await getIllnessImpact();
    res.status(200).json({ impact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};