const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require("../middleware/upload");

router.post('/register', upload.single('profileImage'), userController.register);
router.get('/getUserData/:id', verifyToken, userController.getUserData);
router.get('/getAllUsers', verifyToken, userController.getAllUsers);
router.post('/updateUser', verifyToken, userController.updateUser);
router.delete('/deleteUser/:id', verifyToken, userController.deleteUser);
router.get('/locations', userController.getLocations);


module.exports = router;