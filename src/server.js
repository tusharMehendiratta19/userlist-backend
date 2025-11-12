const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Mount them properly
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
