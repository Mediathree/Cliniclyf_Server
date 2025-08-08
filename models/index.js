const { v4: uuidv4 } = require("uuid");

const sequelize = require("../config/db.js");
const setupAssociations = require("./association.js");
const Role = require("./role.js");
// const Role = require("./role");

const startAndSyncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync({ force: false });
    setupAssociations();
    // const roles = [
    //   { id: uuidv4(), name: 'ADMIN' },
    //   { id: uuidv4(), name: 'DOCTOR' },
    //   { id: uuidv4(), name: 'CLINIC' },
    //   { id: uuidv4(), name: 'PATIENT' },
    // ];

    // for (const role of roles) {
    //   await Role.findOrCreate({
    //     where: { name: role.name },
    //     defaults: role,
    //   });
    // }
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = startAndSyncDB;
