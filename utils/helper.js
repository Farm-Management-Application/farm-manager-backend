// utils/helper.js
function calculateDuration(value, period) {
    switch (period.toLowerCase()) {
        case 'day':
            return value * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        case 'week':
            return value * 7 * 24 * 60 * 60 * 1000; // Convert weeks to milliseconds
        case 'month':
            return value * 30 * 24 * 60 * 60 * 1000; // Approximate months to milliseconds
        default:
            throw new Error('Invalid period');
    }
}

module.exports = calculateDuration;