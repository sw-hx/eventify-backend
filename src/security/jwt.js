import jwt from "jsonwebtoken";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";

const generateToken = (payload, expiresIn = "24h") => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  } catch (err) {
    errorFormatter.printError(err, "Failed to generate JWT");
    errorFormatter.throwError();
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    errorFormatter.printError(err, "Invalid or expired token");
    errorFormatter.throwError(401, "Invalid or expired token");
  }
};

export { generateToken, verifyToken };
