// src/routes/index.js

const express = require('express');
const router = express.Router();

// router.use('/auth', require('./routes/authRoutes'));
// router.use('/users', require('./routes/userRoutes'));

// 404 handler for unknown API routes
router.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

module.exports = router;