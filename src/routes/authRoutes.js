import express from "express";
import verifyAccountStatusMiddleware from "../middleware/accountStatusMiddleware.js";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import hashPassword from "../utility/hashPassword.js";
import isExist from "../dao/users/isExist.js";
import loginUser from "../dao/users/loginUser.js";
import { generateToken } from "../security/jwt.js";
import registerUser from "../dao/users/registerUser.js";
import models from "../models/index.js";
import TokenUtility from "../security/generateToken.js";
import HTTPStatus from "../enums/httpCodeEnum.js";
import { ACCOUNT_STATUS } from "../enums/userInfoEnum.js";
import token_type from "../enums/token_types.js";
import getUserInfo from "../dao/users/getUserInfo.js";
import emailSender from "../utility/email/emailSender.js";
import emailTemplates from "../utility/email/emailTemplates.js";
//this mapped to /api/auth
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    // 1 verify empty fields
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      email: req.body.email,
      password: req.body.password,
      username: req.body.username,
      fullName: req.body.fullName,
    });

    //2 now extract user data
    const { email, password, username, fullName } = req.body;

    //3 now verify the input format
    patternChecker.verifyEmailPattern(email);
    patternChecker.verifyPasswordPattern(password);
    patternChecker.verifyUsernamePattern(username);

    //4 verify there is no user with this email or username
    if (await isExist.Email(email))
      errorFormatter.throwError(409, `your email is already exist `);

    if (await isExist.username(username))
      errorFormatter.throwError(409, `your username is already exist `);

    //5 hash the password
    const hashedPassword = await hashPassword(password);

    //6 generate token for the user
    const generatedToken = TokenUtility.generate();
    const hashedToken = TokenUtility.hashToken(generatedToken);

    //7 generate the verification link
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${generatedToken}`;

    //8 send email
    //NOTE i remove await here because sending email use external api so i do not want to make my api slow down
    emailSender(
      email,
      "Verify your email",
      emailTemplates.verificationLink(fullName, verificationLink),
    );

    //9 now save the user info to database
    await registerUser(username, fullName, email, hashedPassword, hashedToken);

    //10 send final response
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

    const user = await loginUser(email, password);

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

router.post("/reset-password", async (req, res) => {
  let transaction;

  try {
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      email: req.body.email,
    });
    const { email } = req.body;

    if (!isExist.Email(email)) {
      errorFormatter.throwError(HTTPStatus.NOT_FOUND, "User not found");
    }
    const generatedToken = TokenUtility.generate();
    const hashedToken = TokenUtility.hashToken(generatedToken);

    console.log("email sending .....");

    const resetPasswordLink = `${process.env.BASE_URL}/api/auth/update-password?token=${generatedToken}`;

    emailSender(
      email,
      "Reset your password link",
      emailTemplates.restPassword(email, resetPasswordLink),
    );

    transaction = await models.user.sequelize.transaction();

    const user = await getUserInfo(email);

    const expires_at = new Date(Date.now() + 30 * 60 * 1000);

    const user_token = await models.user_token.create(
      {
        token_type: token_type.PASSWORD_RESET,
        token_hash: hashedToken,
        expires_at,
        user_id: user.id,
      },
      { transaction: transaction },
    );

    const message = `The reset password link has sent to your email : ${email} `;

    await transaction.commit();

    return res.json({
      message,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

router.post("/update-password", async (req, res) => {
  let transaction;
  try {
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      new_password: req.body.new_password,
    });

    const { token } = req.query;
    const { new_password } = req.body;

    if (!token) {
      errorFormatter.throwError(HTTPStatus.BAD_REQUEST, "Token is required");
    }

    patternChecker.verifyPasswordPattern(new_password);

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

    const user = user_token.user;

    if (!user) {
      errorFormatter.throwError(HTTPStatus.NOT_FOUND, "User not found");
    }
    if (!user.email_verified) {
      errorFormatter.throwError(HTTPStatus.NOT_FOUND, "User not verified");
    }

    transaction = await models.user.sequelize.transaction();

    const newHashedPassword = await hashPassword(new_password);

    await user.update({ password_hash: newHashedPassword }, { transaction });

    await user_token.update({ used: true }, { transaction });

    await transaction.commit();

    const message = "The password successfully changed";

    return res.json({
      message,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

export default router;
