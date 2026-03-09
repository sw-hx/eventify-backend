import models from "../models/index.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import argon2 from "argon2";

const getUserByEmail = async (email, password) => {
  try {
    // const user = await models.user.findOne({ where: { email } });
      const User = models.user;

      const userEmail = await User.findOne({
        where: { email },
      });



    if (!userEmail) {
      console.log(userEmail)
      errorFormatter.throwError(404, 'Invalid email or password 1');
    }

    const match = await argon2.verify(userEmail.password_hash, password);
    if (!match) {
      errorFormatter.throwError(404, 'Invalid email or password 2');
    }

    if(!userEmail.email_verified){
         errorFormatter.throwError(404, 'Your email is not varified');
    }

    return userEmail;
  } catch (err) {
    errorFormatter.printError(err, 'Error cannot fetch email');
    errorFormatter.throwError(500,err);
  }
};

export default getUserByEmail;