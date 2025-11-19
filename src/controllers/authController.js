const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email ID' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        // user.refreshToken = refreshToken;
        // await user.save();

        res.status(200).json({ message: 'Login successful', userId: user._id, userName: user.firstName + ' ' + user.lastName });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.changePassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.passwordArray = user.passwordArray || [];

        for (const oldHashed of user.passwordArray) {
            if (await bcrypt.compare(newPassword, oldHashed)) {
                return res.status(400).json({ message: 'Cannot reuse old password' });
            }
        }

        if (user.password && await bcrypt.compare(newPassword, user.password)) {
            return res.status(400).json({ message: 'Cannot reuse old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (user.password) {
            user.passwordArray.push(user.password);
        }

        if (user.passwordArray.length > 3) {
            user.passwordArray = user.passwordArray.slice(-3);
        }

        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.logout = (req, res) => {
    // Clear cookies by setting them with expired dates
    res.clearCookie("token", { httpOnly: true, sameSite: "Strict", secure: false });
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "Strict", secure: false });
    res.clearCookie("custId", { sameSite: "Strict", secure: false });

    return res.status(200).json({ message: "Logged out successfully" });
};

exports.getLoggedInUser = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Not logged in' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId)
            .select("firstName lastName _id");


        if (!user) return res.status(401).json({ message: "Invalid token" });

        res.status(200).json({
            userId: user._id,
            name: user.firstName + " " + user.lastName
        });
    } catch (error) {
        return res.status(401).json({ message: "Session expired" });
    }
};
