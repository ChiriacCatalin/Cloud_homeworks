const sequelize = require("./Database/database");
const User = require("./models/user");
const Car = require("./models/car");

const NOT_FOUND = 404;
const OK = 200;
const NO_CONTENT = 204;

const deleteMethods = (req, res) => {
  const url = req.url;
  const urlComponents = url.split("/");
  if (urlComponents.length === 3 && urlComponents[1] === "users") {
    const userId = parseInt(urlComponents[2]);
    if (!isNaN(userId) && urlComponents[2] === "" + userId) {
      deleteUserById(userId, res);
    } else responseStatus(NOT_FOUND, res);
  } else if (urlComponents.length === 2 && urlComponents[1] === "users") {
    deleteAllUsers(res);
  } else {
    responseStatus(NOT_FOUND, res);
  }
};

async function deleteAllUsers(res) {
  User.findAll().then((result) => {
    if (result.length !== 0) {
      User.destroy({ where: {} }).then((empty) => {
        responseStatus(OK, res);
      });
    } else {
      responseStatus(NO_CONTENT, res);
    }
  });
}

async function deleteUserById(userId, res) {
  if (await userIdUnique(userId)) {
    await User.destroy({ where: { id: userId } });
    responseStatus(OK, res);
  } else responseStatus(NOT_FOUND, res);
}

const userIdUnique = (id) =>
  User.findOne({ where: { id: id } })
    .then((token) => token !== null)
    .then((isUnique) => isUnique);

function responseStatus(status, res) {
  res.writeHeader(status, { "Content-Type": "application/json" });
  res.end();
}

module.exports = {
  deleteResponse: deleteMethods,
};
