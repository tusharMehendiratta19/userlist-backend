const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const StateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cities: [CitySchema]
});

const LocationSchema = new mongoose.Schema({
  country: { type: String, required: true },
  states: [StateSchema]
});

module.exports = mongoose.model('locations', LocationSchema);
