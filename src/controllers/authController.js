// const User = require('../models/User');
const AppDataSource = require("../db");
const userRepo = AppDataSource.getRepository("User");
const passwordHistoryRepo = AppDataSource.getRepository("UserPasswordHistory");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userRepo.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid email ID" });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { userId: user.id, email: user.email },
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

        return res.status(200).json({
            message: "Login successful",
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.changePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check current password
        if (await bcrypt.compare(newPassword, user.password)) {
            return res.status(400).json({ message: "Cannot reuse old password" });
        }

        // Fetch last 3 passwords from history
        const history = await passwordHistoryRepo.find({
            where: { user: { id: user.id } },
            order: { createdAt: "DESC" },
            take: 3
        });

        // Check against all 3 old stored passwords
        for (const entry of history) {
            if (await bcrypt.compare(newPassword, entry.password)) {
                return res.status(400).json({ message: "Cannot reuse old password" });
            }
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Save the current password into history BEFORE updating
        if (user.password) {
            const historyEntry = passwordHistoryRepo.create({
                user: user,
                password: user.password
            });
            await passwordHistoryRepo.save(historyEntry);
        }

        // Update user password
        user.password = hashedPassword;
        await userRepo.save(user);

        // Keep only last 3 entries
        const updatedHistory = await passwordHistoryRepo.find({
            where: { user: { id: user.id } },
            order: { createdAt: "DESC" }
        });

        if (updatedHistory.length > 3) {
            const extra = updatedHistory.slice(3); // older ones
            for (const entry of extra) {
                await passwordHistoryRepo.delete(entry.id);
            }
        }

        return res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


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
