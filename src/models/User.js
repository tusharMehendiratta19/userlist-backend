const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordArray: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: Number, required: true },
    country: { type: String, required: true },
    interest: { type: [String], default: [] },
    profileImage: { type: String, default: null },
    refreshToken: { type: String, default: '' }
})

module.exports = mongoose.model("User", userSchema)