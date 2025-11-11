require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

// Validate environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env');
  process.exit(1);
}

// const routes = require('./index'); // <-- Updated path

const PORT = process.env.PORT || 5000;

// Global middlewares
app.use(cors());
app.use(helmet()); // Security headers
app.use(express.json());

// Mount routes
// app.use('/v1', routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

console.log("db url: ", process.env.MONGO_URI)
// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});