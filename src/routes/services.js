import express from "express";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import roleChecker from "../utility/role_checker.js";
import HTTPStatus from "../enums/httpCodeEnum.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import models from "../models/index.js";
const router = express.Router();

/**
 * To do in the feature the provider name will be another table so we wil edit this endpoint
 */
router.post("/", async (req, res) => {
  try {
    //verify user is admin to add category
    roleChecker.isAdmin(req.role);

    // verify empty fields
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      category_id: req.body.category_id,
      provider_name: req.body.provider_name,
      service_name: req.body.service_name,
      price_per_hour: req.body.price_per_hour,
      serv_description: req.body.serv_description,
      main_image: req.body.main_image,
      sub_image1: req.body.sub_image1,
      sub_image2: req.body.sub_image2,
      sub_image3: req.body.sub_image3,
      sub_image4: req.body.sub_image4,
      sub_image5: req.body.sub_image5,
      availability_count: req.body.availability_count,
      country: req.body.country,
      city: req.body.city,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });

    //verify the input format
    const {
      provider_name,
      service_name,
      serv_description,
      main_image,
      sub_image1,
      sub_image2,
      sub_image3,
      sub_image4,
      sub_image5,
      country,
      city,
    } = req.body;
    const category_id = Number(req.body.category_id);
    const availability_count = Number(req.body.availability_count);
    const price_per_hour = Number(req.body.price_per_hour);
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);

    //now verify the input formate
    //numeric values
    patternChecker.verifyPriceOrId(category_id, "category_ID");
    patternChecker.verifyPriceOrId(availability_count, "availability_count");
    patternChecker.verifyPriceOrId(price_per_hour, "price_per_hour");
    patternChecker.verifyPriceOrId(latitude, "latitude");
    patternChecker.verifyPriceOrId(longitude, "longitude");
    //url values
    patternChecker.verifyUrlPattern(main_image, "main_image");
    patternChecker.verifyUrlPattern(sub_image1, "sub_image1");
    patternChecker.verifyUrlPattern(sub_image2, "sub_image2");
    patternChecker.verifyUrlPattern(sub_image3, "sub_image3");
    patternChecker.verifyUrlPattern(sub_image4, "sub_image4");
    patternChecker.verifyUrlPattern(sub_image5, "sub_image5");
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

export default router;
