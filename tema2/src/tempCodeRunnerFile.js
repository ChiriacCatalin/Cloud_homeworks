const sequelize = require("./Database/database");
const { pathToRegexp, match, parse, compile } = require("path-to-regexp");
const User = require("./models/user");
const Car = require("./models/car");