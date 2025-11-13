const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.get('/getUserData/:id', verifyToken, userController.getUserData);
router.get('/getAllUsers', verifyToken, userController.getAllUsers);
router.post('/updateUser', verifyToken, userController.updateUser);
router.delete('/deleteUser/:id', verifyToken, userController.deleteUser);


module.exports = router;