const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://ambassiraambassira:LC6JitiRIWvP2CpM@farmmanagementcluster.gohxrrx.mongodb.net/farmDB');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Connection error', err);
    process.exit(1);
  }
};

module.exports = connectDB;