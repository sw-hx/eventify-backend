import { USER_ROLE } from "../enums/userInfoEnum.js";
import errorFormatter from "./errorFormatterHelperFunction.js";
import HTTPStatus from "../enums/httpCodeEnum.js";

const roleChecker = {
  isAdmin: (role) => {
    const message = "you do not have the permission to access this endpoint ";
    if (role !== USER_ROLE.ADMIN)
      errorFormatter.throwError(HTTPStatus.UNAUTHORIZED, message);
  },
};

export default roleChecker;
