const Worker = require('../models/Worker');
const calculateDuration = require('../utils/helper');

async function getAllWorkers() {
    return await Worker.find();  // Fetch all workers
}

async function getWorkerById(workerId) {
    try {
        const worker = await Worker.findById(workerId);  // Fetch a worker by ID

        if (!worker) {
            throw new Error('Worker not found');
        }

        return worker;
    } catch (error) {
        console.error(`Error fetching worker by ID: ${error.message}`);
        throw error;
    }
}

async function calculateWorkerSalary(workerId, { startDate, endDate, value, period }) {
    try {
        const worker = await getWorkerById(workerId);
        
        if (!startDate && !endDate) {
            if (value && period) {
                const duration = calculateDuration(value, period);
                startDate = new Date(); // Default startDate to now if not provided
                endDate = new Date(startDate.getTime() + duration);
            } else {
                throw new Error('Either startDate and endDate or value and period must be provided.');
            }
        }

        const monthlySalary = worker.salary;
        const daysWorked = (endDate - startDate) / (1000 * 60 * 60 * 24);
        const monthsWorked = daysWorked / 30;

        return monthlySalary * monthsWorked;
    } catch (error) {
        console.error(`Error calculating salary: ${error.message}`);
        throw error;
    }
}

async function calculateTotalWorkerSalaryCost({ startDate, endDate, value, period }) {
    try {
        const workers = await getAllWorkers();

        if (period != 'custom') {
            if (value && period) {
                const duration = calculateDuration(value, period);
                startDate = new Date(); // Default startDate to now if not provided
                endDate = new Date(startDate.getTime() + duration);
            } else {
                throw new Error('Either startDate and endDate or value and period must be provided.');
            }
        } else {            
            startDate = new Date(startDate)
            endDate = new Date(endDate)
        }

        let totalSalary = 0;

        workers.forEach(worker => {
            const monthlySalary = worker.salary;
            const daysWorked = (endDate - startDate) / (1000 * 60 * 60 * 24);
            const monthsWorked = daysWorked / 30;

            totalSalary += monthlySalary * monthsWorked;
        });

        return totalSalary;
    } catch (error) {
        console.error(`Error calculating total salary cost: ${error.message}`);
        throw error;
    }
}

module.exports = {
    getAllWorkers,
    getWorkerById,
    calculateWorkerSalary,
    calculateTotalWorkerSalaryCost,
};