import sequelize from "../../config/database.js";
const successfulConnectMessage = () => {
  console.log("\n................ DataBase Is connected ................\n");
};

const filedConnectMessage = (err) => {
  console.log("DataBase Is NOT connected ......ERROR");
  console.log(err);
  console.log(
    "\n .............END DATABASE CONNECT TEST ERROR..................... \n ",
  );
};

const connectToDatabaseTest = async () => {
  try {
    await sequelize.authenticate();
    successfulConnectMessage();
  } catch (ex) {
    filedConnectMessage(ex);
  }
};

export default connectToDatabaseTest;
