import express from "express";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import roleChecker from "../utility/role_checker.js";
import isExist from "../dao/categories/isExist.js";
import addCategory from "../dao/categories/addCategory.js";
import HTTPStatus from "../enums/httpCodeEnum.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import models from "../models/index.js";
import buildPaginationMeta from "../utility/buildPaginationMeta.js";
import { Op } from "sequelize";

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
    patternChecker.verifyNotNegative(commission, "commission");
    patternChecker.verifyNotNegative(fixed_fee, "fixed_fee");

    /**
     * Database logic
     */

    // verify the { category name } is not exists
    if (await isExist.name(category_name))
      errorFormatter.throwError(
        HTTPStatus.CONFLICT,
        `there is already category with the same name: ${category_name}`,
      );

    //add the category to database
    const category = await addCategory(category_name, commission, fixed_fee);

    //send final response
    res.status(HTTPStatus.CREATED).json(category);
    //seed success message to user
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

router.patch("/:categoryId", async (req, res) => {
  try {
    // verify admin
    roleChecker.isAdmin(req.role);
    patternChecker.verifyEmptyData({ body: req.body });

    const { categoryId } = req.params;
    const { category_name, commission, fixed_fee, image } = req.body;

    const Category = models.category;

    // find category
    const category = await Category.findByPk(categoryId);

    if (!category) {
      errorFormatter.throwError(
        HTTPStatus.NOT_FOUND,
        `Category with id ${categoryId} not found`,
      );
    }

    // validate fields if provided
    if (category_name !== undefined) {
      patternChecker.verifyUsernamePattern(category_name, "category name");
      category.category_name = category_name;

      if (await isExist.name(category_name))
        errorFormatter.throwError(
          HTTPStatus.CONFLICT,
          `there is already category with the same name: ${category_name}`,
        );
    }

    if (commission !== undefined) {
      const commissionNumber = Number(commission);
      patternChecker.verifyNotNegative(commissionNumber, "commission");
      category.commission = commissionNumber;
    }

    if (image !== undefined) {
      if (image !== null) {
        patternChecker.verifyUrlPattern(image, "image_url");
        category.image = image;
      } else {
        category.image = null;
      }
    }
    if (fixed_fee !== undefined) {
      const fixedFeeNumber = Number(fixed_fee);
      patternChecker.verifyNotNegative(fixedFeeNumber, "fixed fee");
      category.fixed_fee = fixedFeeNumber;
    }

    // save changes
    await category.save();

    res.status(HTTPStatus.OK).json(category);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    let { page = 1, page_size = 10, search = "" } = req.query;

    page = Number(page);
    const limit = Number(page_size);
    patternChecker.verifyGTZero(limit, "page size");
    patternChecker.verifyGTZero(page, "page number");
    const offset = (page - 1) * limit;

    /**
     * Database
     */
    const Category = models.category;

    const where = {};

    if (search) {
      where.category_name = {
        [Op.like]: `${search}%`,
      };
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      limit,
      offset,
      attributes: ["id", "category_name", "image", "created_at"],
    });

    res
      .status(HTTPStatus.OK)
      .json(buildPaginationMeta(count, limit, page, rows));
  } catch (exception) {
    res.status(exception.status || 500).json({
      message: exception.message || "Internal server error",
    });
  }
});

export default router;
