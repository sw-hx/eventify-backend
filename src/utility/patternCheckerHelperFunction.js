import errorFormatter from "./errorFormatterHelperFunction.js";

const patternChecker = {
  //first helper
  verifyEmptyData(fields, sendStatus) {
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
  verifyUsernamePattern(username) {
    username = username.toLowerCase();

    const usernameRegex = /^[a-z0-9_]{3,29}$/;

    if (!usernameRegex.test(username)) {
      errorFormatter.throwError(
        400,
        "Username must contain only lowercase letters, numbers, or underscores and be 3–29 characters long",
      );
    }

    return username;
  },
};
export default patternChecker;
