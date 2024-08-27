const Illness = require('../models/Illness');
const calculateDuration = require('../utils/helper');

async function getAllIllnesses() {
    return await Illness.find(); // Fetch all illnesses
}

async function getIllnessById(illnessId) {
    try {
        const illness = await Illness.findById(illnessId); // Fetch an illness by ID

        if (!illness) {
            throw new Error('Illness not found');
        }

        return illness;
    } catch (error) {
        console.error(`Error fetching illness by ID: ${error.message}`);
        throw error;
    }
}

async function calculateIllnessCost(illnessId, { startDate, endDate, value, period }) {
    try {
        const illness = await getIllnessById(illnessId);

        if (!startDate && !endDate) {
            if (value && period) {
                const duration = calculateDuration(value, period);
                startDate = new Date(); // Default startDate to now if not provided
                endDate = new Date(startDate.getTime() + duration);
            } else {
                throw new Error('Either startDate and endDate or value and period must be provided.');
            }
        }

        return illness.treatmentCost;
    } catch (error) {
        console.error(`Error calculating illness cost: ${error.message}`);
        throw error;
    }
}

async function calculateTotalIllnessCost({ startDate, endDate, value, period }) {
    try {
        const illnesses = await getAllIllnesses();

        if (!startDate && !endDate) {
            if (value && period) {
                const duration = calculateDuration(value, period);
                startDate = new Date(); // Default startDate to now if not provided
                endDate = new Date(startDate.getTime() + duration);
            } else {
                throw new Error('Either startDate and endDate or value and period must be provided.');
            }
        }

        let totalIllnessCost = 0;

        illnesses.forEach(illness => {
            const illnessStartDate = new Date(illness.startDate);
            const illnessEndDate = new Date(illness.endDate);

            if (illnessEndDate >= startDate && illnessStartDate <= endDate) {
                totalIllnessCost += illness.treatmentCost;
            }
        });

        return totalIllnessCost;
    } catch (error) {
        console.error(`Error calculating total illness cost: ${error.message}`);
        throw error;
    }
}

async function calculateIllnessCostForLivestockType(livestockType, { startDate, endDate, value, period }) {
    try {
        const illnesses = await Illness.find({ livestockType });
        return calculateTotalIllnessCostForIllnesses(illnesses, { startDate, endDate, value, period });
    } catch (error) {
        console.error(`Error calculating illness cost for livestock type: ${error.message}`);
        throw error;
    }
}

async function calculateIllnessCostForLivestockGroup(livestockGroupId, { startDate, endDate, value, period }) {
    try {
        const illnesses = await Illness.find({ livestockGroupId });
        return calculateTotalIllnessCostForIllnesses(illnesses, { startDate, endDate, value, period });
    } catch (error) {
        console.error(`Error calculating illness cost for livestock group: ${error.message}`);
        throw error;
    }
}

async function calculateTotalIllnessCostForIllnesses(illnesses, { startDate, endDate, value, period }) {
    if (!startDate && !endDate) {
        if (value && period) {
            const duration = calculateDuration(value, period);
            startDate = new Date(); // Default startDate to now if not provided
            endDate = new Date(startDate.getTime() + duration);
        } else {
            throw new Error('Either startDate and endDate or value and period must be provided.');
        }
    }

    let totalIllnessCost = 0;

    illnesses.forEach(illness => {
        const illnessStartDate = new Date(illness.startDate);
        const illnessEndDate = new Date(illness.endDate);

        if (illnessEndDate >= startDate && illnessStartDate <= endDate) {
            console.log("here , ")
            totalIllnessCost += illness.treatmentCost;
        }
    });

    return totalIllnessCost;
}

module.exports = {
    getAllIllnesses,
    getIllnessById,
    calculateIllnessCost,
    calculateTotalIllnessCost,
    calculateIllnessCostForLivestockType,
    calculateIllnessCostForLivestockGroup,
    calculateTotalIllnessCostForIllnesses,
};