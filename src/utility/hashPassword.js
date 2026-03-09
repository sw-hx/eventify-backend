import argon2 from "argon2";
import errorFormatter from "./errorFormatterHelperFunction.js";

const hashPassword = async (password) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 4096,
      timeCost: 3,
      parallelism: 1,
    });
    return hash;
  } catch (error) {
    errorFormatter.printError(error, "Password hashing failed");
    errorFormatter.throwError();
  }
};

export default hashPassword;
