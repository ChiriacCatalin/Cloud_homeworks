const Sequelize = require("sequelize");

const sequelize = new Sequelize("cloud_tables", "root", "rootPass", {
    dialect: "mysql",
    host: "localhost",
});

module.exports = sequelize