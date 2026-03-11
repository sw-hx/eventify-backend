import express from "express";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import hashPassword from "../utility/hashPassword.js";
import isExist from "../dao/users/isExist.js";
import getUserByEmail from "../dao/users/getUserByEmail.js";
import { generateToken } from "../security/jwt.js";
import registerUser from "../dao/users/registerUser.js";
import nodemailer from "nodemailer";
import models from "../models/index.js";
import TokenUtility from "../security/generateToken.js";
import { Resend } from "resend";
import HTTPStatus from "../enums/httpCodeEnum.js";
import { ACCOUNT_STATUS } from "../enums/userInfoEnum.js";

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

    /**
     *
     * to do create a token and send it as email to user to verify it,s email
     */

    //generate token for the user
    const generatedToken = TokenUtility.generate();
    const hashedToken = TokenUtility.hashToken(generatedToken);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("email sending .....");

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${generatedToken}`;

    const resend = new Resend(process.env.RESEND_API_KEY);

    resend.emails.send({
      from: "eventify@gojordan.me",
      to: "mohammadramadan.app@gmail.com",
      subject: "Verify your email",
      html: `<p>Hi ${fullName},</p>
         <p>Click the link below to verify your email:</p>
         <a href="${verificationLink}">${verificationLink}</a>`,
    });
    console.log(`
      
     ##############################################
     # 
     #  the verification link is 
     #  ${verificationLink}
     #############################################
      
      `);
    console.log("email sended");

    //now save the user info to database
    await registerUser(username, fullName, email, hashedPassword, hashedToken);

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

router.get("/verify-email", async (req, res) => {
  let transaction;
  try {
    const { token } = req.query;

    if (!token) {
      errorFormatter.throwError(HTTPStatus.BAD_REQUEST, "Token is required");
    }

    // hash the token
    const token_hash = TokenUtility.hashToken(token);

    // find token in DB
    const user_token = await models.user_token.findOne({
      where: { token_hash },
      include: [{ model: models.user, as: "user" }],
    });

    if (!user_token) {
      errorFormatter.throwError(HTTPStatus.BAD_REQUEST, "Invalid token");
    }

    if (user_token.used) {
      errorFormatter.throwError(HTTPStatus.BAD_REQUEST, "Token already used");
    }

    const now = new Date();
    if (user_token.expires_at < now) {
      errorFormatter.throwError(HTTPStatus.BAD_REQUEST, "Token expired");
    }

    // Everything is valid — verify the user
    const user = user_token.user;

    if (!user) {
      errorFormatter.throwError(HTTPStatus.NOT_FOUND, "User not found");
    }

    // Start a transaction to safely update both user and token
    transaction = await models.user.sequelize.transaction();
    await user.update(
      { email_verified: true, account_status: ACCOUNT_STATUS.ACTIVE },
      { transaction },
    );

    await user_token.update({ used: true }, { transaction });

    await transaction.commit();

    return res.json({ message: "Email verified successfully!" });
  } catch (err) {
    if (transaction) await transaction.rollback();
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

export default router;
