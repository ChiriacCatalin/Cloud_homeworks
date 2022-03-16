const sequelize = require("./Database/database");
const { match } = require("path-to-regexp");
const User = require("./models/user");
const Car = require("./models/car");
const UserCars = require("./models/user_cars");

User.belongsToMany(Car, { through: UserCars });
Car.belongsToMany(User, { through: UserCars });

const getMethods = (req, res) => {
  const url = req.url;
  const urlComponents = url.split("/");
  //console.log(urlComponents);
  //console.log(UserCars.associations);
  if (url === "/test") {
    // getUserCars(res);
    console.log("Working on it");
    res.end();
  } else if (url === "/users") {
    getAllUsers(res, 0);
  } else if (urlComponents.length === 4 && urlComponents[1] === "users" && urlComponents[2] === "page") {
    const page = parseInt(urlComponents[3]);
    if (!isNaN(page) && urlComponents[3] === "" + page) {
      getAllUsers(res, page);
    } else notFound(res);
  } else if (url.startsWith("/users/") && urlComponents.length == 3) {
    const userId = getUserId(url);
    if (userId !== 0) getUserById(userId, res);
    else notFound(res);
  } else if (url === "/cars") {
    getAllCars(res);
  } else if (urlComponents.length === 3 && urlComponents[1] === "cars") {
    const carId = parseInt(urlComponents[2]);
    if (!isNaN(carId) && urlComponents[2] === "" + carId) {
      getCarById(carId, res);
    } else notFound(res);
  } else {
    notFound(res);
  }
};

async function getUserById(userID, res) {
  // return user by id
  const result = await User.findAll({
    where: { id: userID },
  });
  if (result.length > 0) {
    res.writeHeader(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(result));
    res.end();
  } else notFound(res);
}

async function getAllUsers(res, page) {
  // return all users
  const LIMIT = page === 0 ? 999999 : 10;
  const OFFSET = page === 0 ? 0 : LIMIT * (page - 1);
  const result = await User.findAll({
    limit: LIMIT,
    offset: OFFSET,
    where: {},
  });
  res.writeHeader(200, { "Content-Type": "application/json" });
  res.write(JSON.stringify(result));
  res.end();
}

function getUserId(url) {
  // parse the url and check the integrity and  return the value of the id if valid
  const idRegex = "[1-9][0-9]*$";
  const matcher = match(`/users/:id(${idRegex})`, {
    decode: decodeURIComponent,
  });
  const result = matcher(url);
  if (result) return result.params.id;
  return 0;
}

function notFound(res) {
  res.writeHeader(404, { "Content-Type": "application/json" });
  res.end();
}

async function getAllCars(res) {
  // return all cars
  const result = await Car.findAll({
    limit: 50,
    where: {},
  });
  res.writeHeader(200, { "Content-Type": "application/json" });
  res.write(JSON.stringify(result));
  res.end();
}

async function getCarById(carID, res) {
  // return car by id
  const result = await Car.findAll({
    where: { id: carID },
  });
  if (result.length > 0) {
    res.writeHeader(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(result));
    res.end();
  } else notFound(res);
}

async function getUserCars(res) {
  // return all cars
  const usersData = await User.findAll({
    where: { id: 1 },
  });
  const userCarsData = await usersData.getCars();
  res.writeHeader(200, { "Content-Type": "application/json" });
  res.write(JSON.stringify(userCarsData));
  res.end();
}

module.exports = {
  getResponse: getMethods,
};
