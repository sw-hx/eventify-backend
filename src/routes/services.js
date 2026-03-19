import express from "express";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import roleChecker from "../utility/role_checker.js";
import HTTPStatus from "../enums/httpCodeEnum.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import models from "../models/index.js";
import isExist from "../dao/servicesDAO/isExist.js";
import addService from "../dao/servicesDAO/addService.js";
import { USER_ROLE } from "../enums/userInfoEnum.js";
import generateGoogleMapLink from "../utility/generateGoogleMapLink.js";
import { Op } from "sequelize";
import buildPaginationMeta from "../utility/buildPaginationMeta.js";

const router = express.Router();

/**
 * To do in the feature the provider name will be another table so we wil edit this endpoint
 */
router.get("/:serviceId", async (req, res) => {
  try {
    let { serviceId } = req.params;

    serviceId = Number(serviceId);

    patternChecker.verifyGTZero(serviceId, "service id");

    const service = await models.service.findByPk(serviceId);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const googleMapLink = generateGoogleMapLink(
      service.latitude,
      service.longitude,
    );

    const serviceData = service.toJSON();

    serviceData.googleMapLink = googleMapLink;

    if (req.role === USER_ROLE.ADMIN) {
      res.json(serviceData);
    } else {
      delete serviceData.latitude;
      delete serviceData.longitude;
      res.json(serviceData);
    }
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});
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
    patternChecker.verifyNotNegative(category_id, "category_ID");
    patternChecker.verifyNotNegative(availability_count, "availability_count");
    patternChecker.verifyNotNegative(price_per_hour, "price_per_hour");
    patternChecker.verifyCoordinates(latitude, longitude);
    // url values
    if (main_image !== null)
      patternChecker.verifyUrlPattern(main_image, "main_image");

    if (sub_image1 !== null)
      patternChecker.verifyUrlPattern(sub_image1, "sub_image1");

    if (sub_image2 !== null)
      patternChecker.verifyUrlPattern(sub_image2, "sub_image2");

    if (sub_image3 !== null)
      patternChecker.verifyUrlPattern(sub_image3, "sub_image3");

    if (sub_image4 !== null)
      patternChecker.verifyUrlPattern(sub_image4, "sub_image4");

    if (sub_image5 !== null)
      patternChecker.verifyUrlPattern(sub_image5, "sub_image5");
    //verify string values
    patternChecker.verifyUsernamePattern(provider_name, "provider_name");
    patternChecker.verifyUsernamePattern(service_name, "service_name");
    patternChecker.verifyCityPattern(country);
    patternChecker.verifyCityPattern(city);
    patternChecker.verifyStringLength(
      serv_description,
      "serv_description",
      1500,
    );

    /**
     * Database logic
     */

    //check if categoryId is in database
    const category = await models.category.findByPk(category_id);
    if (!category)
      errorFormatter.throwError(
        HTTPStatus.NOT_FOUND,
        `we cannot find category with this id:${category_id}`,
      );

    //check if the user cannot create 2 services with the same name
    const existingService = await models.service.findOne({
      where: { created_by: req.userId, service_name },
    });

    if (existingService) {
      // Throw a custom error before saving
      errorFormatter.throwError(
        HTTPStatus.CONFLICT,
        `Service '${service_name}' already exists for the this user.`,
      );
    }

    //save service to database
    const service = await addService(
      req.userId,
      category_id,
      provider_name,
      service_name,
      price_per_hour,
      serv_description,
      main_image,
      sub_image1,
      sub_image2,
      sub_image3,
      sub_image4,
      sub_image5,
      availability_count,
      country,
      city,
      latitude,
      longitude,
    );

    //send final response
    res.status(HTTPStatus.CREATED).json(service);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});
router.patch("/:serviceId", async (req, res) => {
  try {
    roleChecker.isAdmin(req.role);

    patternChecker.verifyEmptyData({ body: req.body });

    let { serviceId } = req.params;

    serviceId = Number(serviceId);

    patternChecker.verifyGTZero(serviceId, "service id");

    const service = await models.service.findByPk(serviceId);

    if (!service) {
      errorFormatter.throwError(
        HTTPStatus.NOT_FOUND,
        `service with id ${serviceId} not found`,
      );
    }

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

    const category_id =
      req.body.category_id !== undefined
        ? Number(req.body.category_id)
        : undefined;

    const availability_count =
      req.body.availability_count !== undefined
        ? Number(req.body.availability_count)
        : undefined;

    const price_per_hour =
      req.body.price_per_hour !== undefined
        ? Number(req.body.price_per_hour)
        : undefined;

    const latitude =
      req.body.latitude !== undefined ? Number(req.body.latitude) : undefined;

    const longitude =
      req.body.longitude !== undefined ? Number(req.body.longitude) : undefined;

    if (category_id !== undefined) {
      patternChecker.verifyNotNegative(category_id, "category_ID");

      const category = await models.category.findByPk(category_id);
      if (!category)
        errorFormatter.throwError(
          HTTPStatus.NOT_FOUND,
          `we cannot find category`,
        );

      service.category_id = category_id;
    }

    if (availability_count !== undefined) {
      patternChecker.verifyNotNegative(
        availability_count,
        "availability_count",
      );
      service.availability_count = availability_count;
    }

    if (price_per_hour !== undefined) {
      patternChecker.verifyNotNegative(price_per_hour, "price_per_hour");
      service.price_per_hour = price_per_hour;
    }

    if (latitude !== undefined && longitude !== undefined) {
      patternChecker.verifyCoordinates(latitude, longitude);
      service.latitude = latitude;
      service.longitude = longitude;
    }

    if (provider_name !== undefined) {
      patternChecker.verifyUsernamePattern(provider_name, "provider_name");
      service.provider_name = provider_name;
    }

    if (service_name !== undefined) {
      patternChecker.verifyUsernamePattern(service_name, "service_name");

      const existingService = await models.service.findOne({
        where: { created_by: service.created_by, service_name },
      });

      if (existingService && existingService.id !== service.id) {
        errorFormatter.throwError(
          HTTPStatus.CONFLICT,
          `Service '${service_name}' already exists for this user.`,
        );
      }

      service.service_name = service_name;
    }

    if (serv_description !== undefined) {
      patternChecker.verifyStringLength(
        serv_description,
        "serv_description",
        1500,
      );
      service.serv_description = serv_description;
    }

    if (country !== undefined) {
      patternChecker.verifyCityPattern(country);
      service.country = country;
    }

    if (city !== undefined) {
      patternChecker.verifyCityPattern(city);
      service.city = city;
    }

    if (main_image !== undefined) {
      if (main_image !== null)
        patternChecker.verifyUrlPattern(main_image, "main_image");
      service.main_image = main_image;
    }

    if (sub_image1 !== undefined) {
      if (sub_image1 !== null)
        patternChecker.verifyUrlPattern(sub_image1, "sub_image1");
      service.sub_image1 = sub_image1;
    }

    if (sub_image2 !== undefined) {
      if (sub_image2 !== null)
        patternChecker.verifyUrlPattern(sub_image2, "sub_image2");
      service.sub_image2 = sub_image2;
    }

    if (sub_image3 !== undefined) {
      if (sub_image3 !== null)
        patternChecker.verifyUrlPattern(sub_image3, "sub_image3");
      service.sub_image3 = sub_image3;
    }

    if (sub_image4 !== undefined) {
      if (sub_image4 !== null)
        patternChecker.verifyUrlPattern(sub_image4, "sub_image4");
      service.sub_image4 = sub_image4;
    }

    if (sub_image5 !== undefined) {
      if (sub_image5 !== null)
        patternChecker.verifyUrlPattern(sub_image5, "sub_image5");
      service.sub_image5 = sub_image5;
    }

    await service.save();

    res.status(HTTPStatus.OK).json(service);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});
router.get("/", async (req, res) => {
  try {
    let {
      category_id,
      city,
      country,
      min_price,
      max_price,
      price_sort,
      search,
      page = 1,
      page_size = 10,
    } = req.query;

    const Service = models.service;
    const where = {};

    if (category_id !== undefined) {
      const catId = Number(category_id);
      patternChecker.verifyGTZero(catId, "category_id");
      where.category_id = catId;
    }

    if (city !== undefined) {
      patternChecker.verifyCityPattern(city);
      where.city = city;
    }

    if (country !== undefined) {
      patternChecker.verifyCityPattern(country);
      where.country = country;
    }

    if (min_price !== undefined || max_price !== undefined) {
      where.price_per_hour = {};
      if (min_price !== undefined) {
        const min = Number(min_price);
        patternChecker.verifyNotNegative(min, "min_price");
        where.price_per_hour[Op.gte] = min;
      }
      if (max_price !== undefined) {
        const max = Number(max_price);
        patternChecker.verifyNotNegative(max, "max_price");
        where.price_per_hour[Op.lte] = max;
      }
    }

    if (search !== undefined) {
      where.service_name = { [Op.like]: `${search}%` };
    }

    const order = [];
    if (price_sort !== undefined) {
      if (!["ASC", "DESC"].includes(price_sort.toUpperCase())) {
        errorFormatter.throwError(400, "price_sort must be ASC or DESC");
      }
      order.push(["price_per_hour", price_sort.toUpperCase()]);
    }

    page = Number(page);
    const limit = Number(page_size);
    patternChecker.verifyGTZero(limit, "page size");
    patternChecker.verifyPageSizeLimit(limit);
    patternChecker.verifyGTZero(page, "page number");
    const offset = (page - 1) * limit;

    const { count, rows } = await Service.findAndCountAll({
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
