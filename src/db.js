const { DataSource } = require("typeorm");

const User = require("./entities/User");
const UserPasswordHistory = require("./entities/UserPasswordHistory");
const Country = require("./entities/Country");
const State = require("./entities/State");
const City = require("./entities/City");

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,     // only during development!!
  logging: false,
  entities: [
    User,
    UserPasswordHistory,
    Country,
    State,
    City
  ]
});

module.exports = AppDataSource;
