import models from "../models/index.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";

const isExist = {
  Email: async (email) => {
    try {
      const User = models.user;

      const userEmail = await User.findOne({
        attributes: ["email"],
        where: { email },
      });

      return userEmail ? true : false;
    } catch (exception) {
      const message = `Error cannot fetch email: ${email}`;
      errorFormatter(exception, message);
      errorFormatter.throwError(500);
    }
  },
  //2
  username: async (username) => {
    try {
      const User = models.user;

      const user_username = await User.findOne({
        attributes: ["username"],
        where: { username: username },
      });

      return user_username ? true : false;
    } catch (exception) {
      const message = `Error cannot fetch username: ${username}`;
      errorFormatter(exception, message);
      errorFormatter.throwError(500);
    }
  },
};
export default isExist;


