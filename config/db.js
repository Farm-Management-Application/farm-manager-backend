const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // await mongoose.connect('mongodb+srv://ambassiraambassira:LC6JitiRIWvP2CpM@farmmanagementcluster.gohxrrx.mongodb.net/farmDB');
    await mongoose.connect('mongodb://127.0.0.1:27017/farmDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Connection error', err);
    process.exit(1);
  }
};

module.exports = connectDB;