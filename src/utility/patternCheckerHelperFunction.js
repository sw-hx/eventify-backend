import errorFormatter from "./errorFormatterHelperFunction.js";
import HTTPStatus from "../enums/httpCodeEnum.js";

const patternChecker = {
  //first helper
  verifyEmptyData(fields) {
    for (const [fieldName, value] of Object.entries(fields)) {
      if (!value) {
        errorFormatter.throwError(400, `${fieldName} field is required`);
      }
    }
  },

  //second helper
  verifyEmailPattern(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      errorFormatter.throwError(
        400,
        `Invalid email format for email: ${email}`,
      );
    }
  },
  //3 helper
  verifyPasswordPattern(password) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;
    if (!passwordRegex.test(password)) {
      errorFormatter.throwError(
        400,
        "Password must contain 8 characters, uppercase, lowercase, number and special character",
      );
    }
  },
  verifyUsernamePattern(username, filedName) {
    username = username.toLowerCase();

    const usernameRegex = /^[a-z0-9_]{3,29}$/;

    if (!usernameRegex.test(username)) {
      errorFormatter.throwError(
        400,
        `${filedName || "username"} must contain only lowercase letters, numbers, or underscores and be 3–29 characters long`,
      );
    }

    return username;
  },
  verifyPrice(price, filedName) {
    if (!Number.isFinite(price)) {
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        `${filedName || "mony"} should be a number `,
      );
    }

    if (price < 0)
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        `${filedName || "mony"} cannot have negative value `,
      );
  },
};
export default patternChecker;
