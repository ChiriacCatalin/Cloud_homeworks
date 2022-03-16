const Sequelize = require("sequelize");
const sequelize = require("../Database/database");

const Car = sequelize.define(
  "car",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    car_model: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    car_model_year: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Car;
