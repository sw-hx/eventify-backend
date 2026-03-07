const helperFunctions = {
  //first helper
  verifyEmptyData(fields, sendStatus) {
    for (const [fieldName, value] of Object.entries(fields)) {
      if (!value) {
        throw {
          status: 400,
          message: `${fieldName} field is required`,
        };
      }
    }
  },

  //second helper
  verifyEmailPattern(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw {
        status: 400,
        message: "Invalid email format",
      };
    }
  },
  //3 helper
  verifyPasswordPattern(password) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      throw {
        status: 400,
        message:
          "Password must contain 8 characters, uppercase, lowercase, number and special character",
      };
    }
  },
};
export default helperFunctions;
