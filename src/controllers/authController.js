const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email ID' });
        }
        let passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        let refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        user.refreshToken = refreshToken;
        await user.save();
        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({ message: 'Login successful', token, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.changePassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}