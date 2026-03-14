import express from "express";
import roleChecker from "../utility/role_checker.js";
import models from "../models/index.js";
import hashPassword from "../utility/hashPassword.js";
import { ACCOUNT_STATUS, USER_ROLE } from "../enums/userInfoEnum.js";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import HTTPStatus from "../enums/httpCodeEnum.js";
import isExist from "../dao/users/isExist.js";
import { Op } from "sequelize";
import buildPaginationMeta from "../utility/buildPaginationMeta.js";

const router = express.Router();

router.patch("/users/:userId", async (req, res) => {
  try {
    patternChecker.verifyEmptyData({ body: req.body });

    roleChecker.isAdmin(req.role);

    const {
      username,
      fullName,
      profile_image,
      password,
      email_verified,
      user_role,
      account_status,
    } = req.body;

    const userId = req.params.userId;

    const User = models.user;

    const user = await User.findByPk(userId);

    // check if user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (username !== undefined && username !== "null") {
      if (user.username === username) {
        errorFormatter.throwError(
          HTTPStatus.CONFLICT,
          `Username already in use.`,
        );
      }
      if (await isExist.username(username)) {
        errorFormatter.throwError(
          HTTPStatus.CONFLICT,
          `there is already username with the same name: ${username}`,
        );
      }

      patternChecker.verifyUsernamePattern(username);

      user.username = username;
    }
    if (fullName !== undefined) {
      patternChecker.verifyUsernamePattern(fullName, "full name");
      user.full_name = fullName;
    }

    if (profile_image !== undefined) {
      if (profile_image !== "null") {
        patternChecker.verifyUrlPattern(profile_image, "profile_image");
        user.profile_image = profile_image;
      } else {
        user.profile_image = null;
      }
    }

    if (email_verified !== undefined) {
      user.email_verified = Boolean(email_verified);
    }

    if (user_role !== undefined) {
      if (!Object.values(USER_ROLE).includes(user_role)) {
        errorFormatter.throwError(400, "Invalid user role");
      }
      user.user_role = user_role;
    }

    if (account_status !== undefined) {
      if (!Object.values(ACCOUNT_STATUS).includes(account_status)) {
        errorFormatter.throwError(400, "Invalid account status");
      }
      user.account_status = account_status;
    }

    if (password !== undefined) {
      const hashedPassword = await hashPassword(password);
      user.password_hash = hashedPassword;
    }
    // save changes
    await user.save();

    const message = "User updated successfully!";

    return res.json({
      message,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

router.get("/users", async (req, res) => {
  try {
    roleChecker.isAdmin(req.role);

    let {
      role,
      created_at,
      order_by,
      email_verified,
      account_status,
      page = 1,
      page_size = 10,
    } = req.query;

    const User = models.user;
    const where = {};

    if (role !== undefined) {
      if (!Object.values(USER_ROLE).includes(role)) {
        errorFormatter.throwError(400, "Invalid user role");
      }
      where.user_role = role;
    }

    if (created_at !== undefined) {
      where.created_at = { [Op.gt]: new Date(created_at) };
    }

    if (email_verified !== undefined) {
      const verified = parseInt(email_verified, 10);
      if (verified !== 0 && verified !== 1) {
        errorFormatter.throwError(400, "email_verified must be 0 or 1");
      }
      where.email_verified = verified;
    }

    if (account_status !== undefined) {
      if (!Object.values(ACCOUNT_STATUS).includes(account_status)) {
        errorFormatter.throwError(400, "Invalid account status");
      }
      where.account_status = account_status;
    }

    const order = [];
    if (order_by !== undefined) {
      if (!["ASC", "DESC"].includes(order_by.toUpperCase())) {
        errorFormatter.throwError(400, "order_by must be ASC or DESC");
      }
      order.push(["created_at", order_by.toUpperCase()]);
    }
    page = Number(page);
    const limit = Number(page_size);

    patternChecker.verifyGTZero(limit, "page size");
    patternChecker.verifyGTZero(page, "page number");

    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    res.status(200).json(buildPaginationMeta(count, limit, page, rows));
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

export default router;
