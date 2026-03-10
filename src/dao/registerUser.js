import models from "../models/index.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import sequelize from "../models/index.js";
import { ACCOUNT_STATUS } from "../enums.js";

const registerUser = async (username, full_name, email, password_hash ,firebase_uid) => {
  let transaction ;
  try {
    transaction = await models.user.sequelize.transaction();
    const user = await models.user.create(
      {
        firebase_uid,
        username,
        full_name,
        email,
        password_hash,
        isVerified: false,
        account_status: ACCOUNT_STATUS.ACTIVE,
      },
      { transaction: transaction },
    );
    await transaction.commit();

    //  Generate verification token
    // const token = generateVerificationToken();

    // Save token to DB
    // await models.verificationToken.create({
    //   userId: user.id,
    //   token,
    //   expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
    // });

    // Send verification email
    // await sendVerificationEmail(user.email, token);

    // Return user (or safe info)
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      message: "User registered successfully. Check your email to verify.",
    };
  } catch (exception) {
    transaction.rollback();
    const message = `Error cannot register user: ${email || username}`;
    errorFormatter.printError(exception, message);
    errorFormatter.throwError(500, message);
  }
};
export default registerUser;
