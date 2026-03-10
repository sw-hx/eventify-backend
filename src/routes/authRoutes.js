import express, { response } from "express";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import hashPassword from "../utility/hashPassword.js";
import isExist from "../dao/userHelperMethods.js";
import getUserByEmail from "../dao/getUserByEmail.js";
import { generateToken } from "../security/jwt.js";
import registerUser from "../dao/registerUser.js";
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

    /**
     *
     * to do create a token and send it as email to user to verify it,s email
     */

    //now save the user info to database
    await registerUser(username, fullName, email, hashedPassword);
    res.json(response);

    // handel exceptions
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

// login endpoint
router.post("/login", async (req, res) => {
  try {
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      email: req.body.email,
      password: req.body.password,
    });
    const { email, password } = req.body;

    patternChecker.verifyEmailPattern(email);

    const user = await getUserByEmail(email, password);

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.user_role,
    });

    const { id, userEmail, full_name, username, user_role } = user;
    const response = { id, userEmail, full_name, username, user_role, token };

    res.json(response);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

export default router;
