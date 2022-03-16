const Sequelize = require("sequelize");
const sequelize = require("../Database/database");
const User = require("./user");
const Car = require("./car");

const UserCars = sequelize.define(
  "user_car",
  {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      foreignKey: true,
    },
    carId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
      },
  },
  {
    timestamps: false,
  }
);

User.belongsToMany(Car, { through: UserCars });
Car.belongsToMany(User, { through: UserCars });

module.exports = UserCars;
