import models from "../models/index.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import argon2 from "argon2";

const getUserByEmail = async (email, password) => {
  try {
    const user = await models.user.findOne({ where: { email } });

    if (!user) {
      errorFormatter.throwError(404, 'Invalid email or password');
    }

    const match = await argon2.verify(user.password_hash, password);
    if (!match) {
      errorFormatter.throwError(404, 'Invalid email or password');
    }

    if(!user.email_verified){
         errorFormatter.throwError(404, 'Your email is not varified');
    }

    return user;
  } catch (err) {
    errorFormatter(err, 'Error cannot fetch email');
    errorFormatter.throwError(500);
  }
};

export default getUserByEmail;