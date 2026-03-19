import HTTPStatus from "../enums/httpCodeEnum.js";
import { ACCOUNT_STATUS } from "../enums/userInfoEnum.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import models from "../models/index.js";

const verifyAccountStatus = async (req, res, next) => {
  try {
    const userId = req.userId; // comes from auth middleware (JWT)

    if (!userId) {
      return res.status(HTTPStatus.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    }

    const user = await models.user.findByPk(userId, {
      attributes: ["id", "email", "account_status"],
    });

    if (!user) {
      return res.status(HTTPStatus.NOT_FOUND).json({
        message: "User not found",
      });
    }

    /**
     * Account status checks
     */

    switch (user.account_status) {
      case ACCOUNT_STATUS.ACTIVE:
        //i need to refactoring the code to remove unnecessary user fetch
        req.user = user; // added at the end (good since we will not need to get the user in feature requests)
        return next();

      case ACCOUNT_STATUS.PENDING:
        return res.status(HTTPStatus.FORBIDDEN).json({
          message: "Account not verified yet",
        });

      case ACCOUNT_STATUS.SUSPENDED:
        return res.status(HTTPStatus.FORBIDDEN).json({
          message: "Account is suspended",
        });

      case ACCOUNT_STATUS.BANNED:
        return res.status(HTTPStatus.FORBIDDEN).json({
          message: "Account is banned",
        });

      default:
        return res.status(HTTPStatus.FORBIDDEN).json({
          message: "Invalid account status",
        });
    }
  } catch (error) {
    errorFormatter.printError(error, "account status middleware");
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default verifyAccountStatus;
