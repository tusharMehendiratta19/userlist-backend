const User = require('../models/User');
const Location = require('../models/Location');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.register = async (req, res) => {
    const { firstName, lastName, gender, email, password, city, state, zipcode, country, interest } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        if (!firstName || !gender || !email || !password || !city || !state || !zipcode || !country || !interest) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        let hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ firstName, lastName, gender, email, password: hashedPassword, city, state, zipcode, country, interest });
        let result = await newUser.save();
        if (!result) {
            return res.status(500).json({ message: 'Failed to register user' });
        } else {
            console.log("New user registered: ", result);
            let token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            let refreshToken = jwt.sign({ id: newUser._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
            newUser.refreshToken = refreshToken;
            await newUser.save();

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 60 * 60 * 1000,
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.cookie('custId', newUser._id.toString(), {
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.setHeader('Authorization', `Bearer ${token}`);
            res.status(201).json({ message: 'User registered successfully', userId: newUser._id, name: `${newUser.firstName} ${newUser.lastName}`, token, refreshToken });
        }
    } catch (error) {
        console.error("Error in user registration: ", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.getUserData = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findOne({ _id: id }, '-password -refreshToken');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        let skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        let limit = req.query.limit ? parseInt(req.query.limit, 10) : 0;
        const users = await User.find({}, '-password -refreshToken')
            .skip(skip)
            .limit(limit);
        const total = await User.countDocuments();
        res.status(200).json({ total, users });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.updateUser = async (req, res) => {
    const { firstName, lastName, gender, email, password, city, state, zipcode, country, interest } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (gender) user.gender = gender;
        if (password) {
            let hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        if (city) user.city = city;
        if (state) user.state = state;
        if (zipcode) user.zipcode = zipcode;
        if (country) user.country = country;
        if (interest) user.interest = interest;
        let result = await user.save();
        if (!result) {
            return res.status(500).json({ message: 'Failed to update user' });
        } else {
            res.status(200).json({ message: 'User updated successfully', user: result });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await User.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.find({}).lean();
        console.log("Fetched locations: ", locations);
        res.status(200).json({ locations });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}