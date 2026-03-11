import express from "express";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import roleChecker from "../utility/role_checker.js";
import isExist from "../dao/categories/isExist.js";
import addCategory from "../dao/categories/addCategory.js";
import HTTPStatus from "../enums/httpCodeEnum.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    //verify user is admin to add category
    roleChecker.isAdmin(req.role);

    // verify empty fields
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      category_name: req.body.category_name,
      commission: req.body.commission,
      fixed_fee: req.body.fixed_fee,
    });

    //verify the input formate
    const category_name = req.body.category_name;
    const commission = Number(req.body.commission);
    const fixed_fee = Number(req.body.fixed_fee);

    patternChecker.verifyUsernamePattern(category_name, "category name");
    patternChecker.verifyPrice(commission, "commission");
    patternChecker.verifyPrice(fixed_fee, "fixed_fee");

    /**
     * Database logic
     */

    // verify the { category name } is not exists
    if (isExist.name(category_name))
      errorFormatter.throwError(
        HTTPStatus.CONFLICT,
        `there is already category with the same name: ${category_name}`,
      );

    //add the category to database
    const category = addCategory(category_name, commission, fixed_fee);

    //send final response
    res.status(HTTPStatus.CREATED).json(category);
    //seed success message to user
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

export default router;
