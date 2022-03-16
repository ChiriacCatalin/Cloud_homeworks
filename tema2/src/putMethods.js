const sequelize = require("./Database/database");
const User = require("./models/user");
const Car = require("./models/car");

const NOT_FOUND = 404;
const OK = 200;

const putMethods = (req, res) => {
  const url = req.url;
  const urlComponents = url.split("/");
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const dataJson = JSON.parse(body);
    if (urlComponents.length === 3 && urlComponents[1] === "users" && dataJson.length === 1) {
      const userId = parseInt(urlComponents[2]);
      if (!isNaN(userId) && urlComponents[2] === "" + userId && validateSingleUserData(dataJson)) {
          updateUserById(userId, dataJson, res);
      } else responseStatus(NOT_FOUND, res);
    }
    else if(urlComponents.length === 2 && urlComponents[1] === "users" && dataJson.length > 0){
        validateData(dataJson).then(result => {
            if(result === true)
              updateMultipleUsers(dataJson, res);
            else
              responseStatus(NOT_FOUND, res);
        })
    }
    else { 
      responseStatus(NOT_FOUND, res);
    }
  });
};

function validateSingleUserData(dataJson) {
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
        (dataJson[i].name === null || dataJson[i].name.length < 4) ||
        !(dataJson[i].gender === "Male" || dataJson[i].gender === "Female") ||
        dataJson[i].country === null || dataJson[i].country.length < 3
      ) {
        return false;
      }
    }
    return true;
    
}

  async function updateUserById(userId, content, res) {
    if ((await userIdUnique(userId))) {
      const updateUser = await User.update({
        name: content[0].name,
        gender: content[0].gender,
        country: content[0].country},
        {where: {id: userId}
      });
      responseStatus(OK, res);
    } else responseStatus(NOT_FOUND, res);
  }



  async function updateMultipleUsers(content, res){
    for(let i=0; i< content.length; i++){
        await User.update({
            name: content[i].name,
            gender: content[i].gender,
            country: content[i].country},
            {where: {id: parseInt(content[i].id)}
          });
    }
    responseStatus(OK, res);
  
  }



async function validateData(dataJson) {
  for (let i = 0; i < dataJson.length; i++) {
    var borFld = Object.keys(dataJson[i]);
    
    if (
      borFld.length !== 4 ||
      borFld[0] !== "id" ||
      borFld[1] !== "name" ||
      borFld[2] !== "gender" ||
      borFld[3] !== "country"
    ){
      return false;
    }
    else if (
      dataJson[i].name === null ||
      dataJson[i].name.length < 4 ||
      !(dataJson[i].gender === "Male" || dataJson[i].gender === "Female") ||
      dataJson[i].country === null ||
      dataJson[i].country.length < 3
    ) {
      return false;
    }
    const userId = parseInt(dataJson[i].id);
    if (!(!isNaN(userId) && dataJson[i].id == userId) || userId < 0) {
      // make sure that the id is valid
      return false;
    }
    if (!(await userIdUnique(userId))) return false; // if the id is not present in table yet
    
  }
  return true;
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
  putResponse: putMethods,
};
