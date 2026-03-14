import errorFormatter from "./errorFormatterHelperFunction.js";
import HTTPStatus from "../enums/httpCodeEnum.js";
import { verify } from "crypto";

const patternChecker = {
  //first helper
  verifyEmptyData(fields) {
    for (const [fieldName, value] of Object.entries(fields)) {
      if (value === undefined || value === "") {
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
  verifyUsernamePattern(username, filedName) {
    username = username.toLowerCase();

    const usernameRegex = /^[a-z0-9_]{3,29}$/;

    if (!usernameRegex.test(username)) {
      errorFormatter.throwError(
        400,
        `${filedName || "username"} must contain only lowercase letters, numbers, or underscores and be 3–29 characters long`,
      );
    }

    return username;
  },

  verifyCountryPattern(country, fieldName) {
    const countryNameRegex = /^[a-zA-Z\s\-]+$/;

    if (!countryNameRegex.test(country)) {
      errorFormatter.throwError(
        400,
        `${fieldName || "Country"} must contain only letters, spaces, and hyphens.`,
      );
    }
  },

  verifyCityPattern(city, fieldName) {
    const cityNameRegex = /^[a-zA-Z\s'\-]+$/;

    if (!cityNameRegex.test(city)) {
      errorFormatter.throwError(
        400,
        `${fieldName || "City"} must contain only letters, spaces, apostrophes, and hyphens.`,
      );
    }
  },
  verifyStringLength(stringInput, fieldName, maxLengthInput) {
    const maxLength = maxLengthInput || 1000;

    if (stringInput.length > maxLength) {
      errorFormatter.throwError(
        400,
        `${fieldName || "Service description"} must not exceed ${maxLength} characters.`,
      );
    }
  },
  verifyNotNegative(num, filedName) {
    if (!Number.isFinite(num)) {
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        `${filedName || "mony"} should be a number `,
      );
    }

    if (num < 0)
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        `${filedName || "mony"} cannot have negative value `,
      );
  },
  verifyGTZero(num, filedName) {
    if (!Number.isFinite(num)) {
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        `${filedName || "mony"} should be a number `,
      );
    }

    if (num < 1)
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        `${filedName || "money"} cannot be  less than 1 `,
      );
  },
  verifyNumber(num, filedName) {
    if (!Number.isFinite(num)) {
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        `${filedName || "number"} cannot be ${num} it should has number formate `,
      );
    }
  },

  verifyUrlPattern(url, fieldName) {
    const urlRegex =
      /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-.~:?#[\]@!$&'()*+,;=]*)?$/;

    if (!urlRegex.test(url)) {
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        `${fieldName || "url"} must be a valid URL`,
      );
    }
  },
  verifyCoordinates(latitude, longitude) {
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      errorFormatter.throwError(
        400,
        "latitude must be a number between -90 and 90",
      );
    }

    if (Number.isNaN(lon) || lon < -180 || lon > 180) {
      errorFormatter.throwError(
        400,
        "longitude must be a number between -180 and 180",
      );
    }

    return { latitude: lat, longitude: lon };
  },
  verifyIsDate(inputDate, fieldName) {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z?$/;

    if (!isoRegex.test(inputDate)) {
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        `${fieldName || "input date "}  must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)`,
      );

      const date = new Date(inputDate);
      if (isNaN(date.getTime())) {
        errorFormatter.throwError(
          HTTPStatus.BAD_REQUEST,
          `${fieldName || "input date "} must be a valid date`,
        );
      }
    }
  },
};
export default patternChecker;
