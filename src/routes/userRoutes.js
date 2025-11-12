const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.get('/getUserData/:id', userController.getUserData);
router.get('/getAllUsers', userController.getAllUsers);
router.post('/updateUser', userController.updateUser);
router.get('/deleteUser/:id', userController.deleteUser);


module.exports = router;