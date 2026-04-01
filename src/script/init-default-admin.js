import hashPassword from "../utility/hashPassword.js";
import { ACCOUNT_STATUS, USER_ROLE } from "../enums/userInfoEnum.js";
import models from "../models/index.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";

const initApp = async () => {
  const User = models.user;
  let transaction;
  try {
    transaction = await User.sequelize.transaction();
    const existingAdmin = await User.findOne({
      where: { user_role: USER_ROLE.ADMIN },
    });

    console.log(`
        ############################################
        ############### FIRST INIT #################
        ############################################
        `);

    if (!existingAdmin) {
      await User.create(
        {
          username: "admin",
          full_name: "default admin",
          email: process.env.DEFAULT_ADMIN_EMAIL,
          email_verified: true,
          password_hash: await hashPassword(process.env.DEFAULT_ADMIN_PASSWORD),
          user_role: USER_ROLE.ADMIN,
          account_status: ACCOUNT_STATUS.ACTIVE,
        },
        { transaction },
      );
      transaction.commit();
    }
  } catch (err) {
    if (transaction) await transaction.rollback();
    errorFormatter.printError(
      err,
      "error happened when creating the default admin",
    );
  }
};

export default initApp;
