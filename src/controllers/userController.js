const AppDataSource = require("../db");
const userRepo = AppDataSource.getRepository("User");
const cityRepo = AppDataSource.getRepository("City")
const stateRepo = AppDataSource.getRepository("State")
const countryRepo = AppDataSource.getRepository("Country")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

exports.register = async (req, res) => {
    const {
        firstName,
        lastName,
        gender,
        email,
        password,
        city,
        state,
        country,
        zipcode,
        interest
    } = req.body;

    try {
        const requiredFields = {
            firstName, gender, email, password,
            city, state, country, zipcode, interest
        };

        for (const key in requiredFields) {
            if (!requiredFields[key]) {
                return res.status(400).json({ message: `${key} is required` });
            }
        }

        const existingUser = await userRepo.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // --- Fetch names using IDs ---
        const countryName = await countryRepo.findOne({ where: { id: country } });
        const stateName = await stateRepo.findOne({ where: { id: state } });
        const cityName = await cityRepo.findOne({ where: { id: city } });

        if (!countryName || !stateName || !cityName) {
            return res.status(400).json({ message: "Invalid country/state/city ID" });
        }

        // --- Handle profile image ---
        let profileImagePath = null;
        if (req.file) {
            profileImagePath = `/uploads/profileImages/${req.file.filename}`;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let interestArray = interest;
        if (typeof interest === "string") {
            interestArray = JSON.parse(interest);
        }

        // --- Store NAMES instead of IDs ---
        const newUser = userRepo.create({
            firstName,
            lastName,
            gender,
            email,
            password: hashedPassword,
            country: countryName.name,
            state: stateName.name,
            city: cityName.name,
            zipcode,
            interest: interestArray,
            profileImage: profileImagePath
        });

        await userRepo.save(newUser);

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: newUser.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

        newUser.refreshToken = refreshToken;
        await userRepo.save(newUser);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 3600000,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 3600000,
        });

        return res.status(201).json({
            message: "User registered successfully",
            userId: newUser.id,
            name: `${newUser.firstName} ${newUser.lastName || ""}`.trim(),
            profileImage: newUser.profileImage,
        });

    } catch (error) {
        console.error("Error in user registration:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.getUserData = async (req, res) => {
    try {
        const user = await userRepo.findOne({
            where: { id: req.params.id },
            select: [
                "id", "firstName", "lastName", "email", "gender",
                "city", "state", "zipcode", "country", "interest",
                "profileImage", "createdAt"
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // console.log(user.country)
        // console.log(user.state)
        // console.log(user.city)

        const countryId = await countryRepo.findOne({ where: { name: user.country } });
        const stateId = await stateRepo.findOne({ where: { name: user.state } });
        const cityId = await cityRepo.findOne({ where: { name: user.city } });

        // console.log(countryId.id)
        // console.log(stateId.id)
        // console.log(cityId.id)

        user.cityId = cityId.id
        user.stateId = stateId.id
        user.countryId = countryId.id

        res.status(200).json({ user });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

        const [users, total] = await userRepo.findAndCount({
            skip,
            take: limit,
            select: [
                "id", "firstName", "lastName", "email", "gender",
                "city", "state", "zipcode", "country", "interest",
                "profileImage", "createdAt"
            ]
        });

        res.status(200).json({ total, users });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const user = await userRepo.findOne({ where: { email: req.body.email } });

        if (!user) return res.status(404).json({ message: "User not found" });

        const updateData = {};
        const countryName = await countryRepo.findOne({ where: { id: req.body.country } });
        const stateName = await stateRepo.findOne({ where: { id: req.body.state } });
        const cityName = await cityRepo.findOne({ where: { id: req.body.city } });

        if (!countryName || !stateName || !cityName) {
            return res.status(400).json({ message: "Invalid country/state/city ID" });
        }

        if (req.body.firstName) updateData.firstName = req.body.firstName;
        if (req.body.lastName) updateData.lastName = req.body.lastName;
        if (req.body.gender) updateData.gender = req.body.gender;
        if (req.body.city) updateData.city = cityName.name;
        if (req.body.state) updateData.state = stateName.name;
        if (req.body.zipcode) updateData.zipcode = req.body.zipcode;
        if (req.body.country) updateData.country = countryName.name;

        if (req.body.interest) {
            updateData.interest = typeof req.body.interest === "string"
                ? JSON.parse(req.body.interest)
                : req.body.interest;
        }

        if (req.body.password) {
            updateData.password = await bcrypt.hash(req.body.password, 10);
        }

        await userRepo.update({ email: req.body.email }, updateData);

        const updatedUser = await userRepo.findOne({ where: { email: req.body.email } });

        res.status(200).json({ message: "User updated successfully", user: updatedUser });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const result = await userRepo.delete(req.params.id);

        if (result.affected === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.getLocations = async (req, res) => {
    try {
        const countries = await countryRepo.find({
            relations: {
                states: {
                    cities: true
                }
            },
            order: {
                name: "ASC",
                states: {
                    name: "ASC",
                    cities: {
                        name: "ASC"
                    }
                }
            }
        });

        return res.status(200).json({ countries });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


exports.addCountry = async (req, res) => {
    try {
        const { name } = req.body
        const country = countryRepo.create({ name });
        await countryRepo.save(country);
        return res.status(201).json({ message: "Country added", country });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.addStates = async (req, res) => {
    try {
        const { countryId, states } = req.body;

        if (!countryId || !Array.isArray(states) || states.length === 0) {
            return res.status(400).json({ message: "countryId and states[] are required" });
        }

        // Build array of state objects
        const stateEntities = states.map((stateName) =>
            stateRepo.create({
                name: stateName,
                country: { id: countryId }
            })
        );

        // Bulk insert
        const result = await stateRepo.save(stateEntities);

        return res.status(201).json({
            message: `${result.length} states added`,
            states: result
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.addCities = async (req, res) => {
    try {
        const { stateId, cities } = req.body;

        if (!stateId || !Array.isArray(cities) || cities.length === 0) {
            return res.status(400).json({ message: "stateId and cities[] are required" });
        }

        const cityEntities = cities.map(name =>
            cityRepo.create({ name, state: { id: stateId } })
        );

        await cityRepo.save(cityEntities);

        return res.status(201).json({
            message: "Cities added successfully",
            total: cityEntities.length,
            cities: cityEntities
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

