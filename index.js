require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const AppDataSource = require('./src/db');
const routes = require('./src/server');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.cors_origin,
  credentials: true,
}));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/v1', routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Initialize PostgreSQL + TypeORM
AppDataSource.initialize()
  .then(() => {
    console.log('✔ PostgreSQL connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err);
    process.exit(1);
  });
