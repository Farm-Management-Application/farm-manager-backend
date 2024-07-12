const express = require('express');
const connectDB = require('./config/db'); // Adjust the path as necessary
const farmRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

app.use(express.json());
app.use('/api/farm', farmRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});