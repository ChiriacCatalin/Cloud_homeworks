const sequelize = require("./Database/database");
const { match } = require("path-to-regexp");
const User = require("./models/user");
const Car = require("./models/car");

// var UserCars = sequelize.define("user_cars", {}, { timestamps: false });
// User.belongsToMany(Car, { through: UserCars });
// Car.belongsToMany(User, { through: UserCars });

const NOT_FOUND = 404;
const CREATED = 201;
const CONFLICT = 409;

const postMethods = (req, res) => {
  const url = req.url;
  const urlComponents = url.split("/");
  //console.log(urlComponents);
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const dataJson = JSON.parse(body);
    if (validateData(dataJson)) {
      // check if the body corresponds to the database format and restrictions
      if (urlComponents.length === 3 && urlComponents[1] === "users" && dataJson.length === 1) {
        const userId = parseInt(urlComponents[2]);
        if (!isNaN(userId) && urlComponents[2] === "" + userId) {
          createUserById(userId, dataJson, res);
        } else responseStatus(NOT_FOUND, res);
      }
      else if(urlComponents.length === 2 && urlComponents[1] === "users" && dataJson.length > 0){
        createMultipleUsers(dataJson, res);
      }
      else {
        responseStatus(NOT_FOUND, res);
      }
    } else responseStatus(CONFLICT, res);
  });
};

function validateData(dataJson) {
  for (let i = 0; i < dataJson.length; i++) {
    var borFld = Object.keys(dataJson[i]);
    if (
      borFld.length !== 3 ||
      borFld[0] !== "name" ||
      borFld[1] !== "gender" ||
      borFld[2] !== "country"
    )
      return false;
    else if (
      (dataJson[i].name === null || dataJson[i].name.length < 4 ) ||
      !(dataJson[i].gender === "Male" || dataJson[i].gender === "Female") ||
      (dataJson[i].country === null  || dataJson[i].country.length < 3)
    )
      return false;
  }
  return true;
}

async function createUserById(userId, content, res) {
  if (!(await userIdUnique(userId))) {
    const addedUser = await User.create({
      id: userId,
      name: content[0].name,
      gender: content[0].gender,
      country: content[0].country,
    });
    res.writeHeader(CREATED, { "Content-Type": "application/json" , location:`http://localhost:3000/users/${userId}`});
    res.end();
    //console.log(addedUser.toJSON());
  } else responseStatus(CONFLICT, res);
}

async function createMultipleUsers(content, res){
  for(let i=0; i< content.length; i++){
    await User.create({ 
      name: content[i].name, 
      gender: content[i].gender,
      country: content[i].country,
    });
  }
  responseStatus(CREATED, res);

}

function responseStatus(status, res) {
  res.writeHeader(status, { "Content-Type": "application/json" });
  res.end();
}

const userIdUnique = (id) =>
  User.findOne({ where: { id: id } })
    .then((token) => token !== null)
    .then((isUnique) => isUnique);

module.exports = {
  postResponse: postMethods,
};
