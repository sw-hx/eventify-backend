import express, { response } from "express";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import hashPassword from "../utility/hashPassword.js";
import isExist from "../dao/userHelperMethods.js";
//this mapped to /api/auth
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    // verify empty fields
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      email: req.body.email,
      password: req.body.password,
      username: req.body.username,
      fullName: req.body.fullName,
    });

    //now extract user data
    const { email, password, username, fullName } = req.body;

    //now verify the input format
    patternChecker.verifyEmailPattern(email);
    patternChecker.verifyPasswordPattern(password);
    patternChecker.verifyUsernamePattern(username);

    /**
     *
     * now database logic
     *
     */

    //verify there is no user with this email or username
    if (await isExist.Email(email))
      errorFormatter.throwError(409, `your email is already exist `);

    if (await isExist.username(username))
      errorFormatter.throwError(409, `your username is already exist `);

    //now saving the user information to database
    //hash the password
    const hashedPassword = await hashPassword(password);

    // sending the final response if no exception happens
    const response = {
      message: `you need to verify your email please check your email: ${email} inbox for verification link `,
    };
    res.json(response);

    // handel exceptions
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

export default router;
