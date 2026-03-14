import express from "express";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import roleChecker from "../utility/role_checker.js";
import HTTPStatus from "../enums/httpCodeEnum.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import models from "../models/index.js";
import isExist from "../dao/servicesDAO/isExist.js";
import addService from "../dao/servicesDAO/addService.js";
import {USER_ROLE} from '../enums/userInfoEnum.js'
import generateGoogleMapLink from '../utility/generateGoogleMapLink.js'
const router = express.Router();

/**
 * To do in the feature the provider name will be another table so we wil edit this endpoint
 */
router.get('/:serviceId',async(req,res)=>{
  try{

    const {serviceId} = req.params;

    const service =  await models.service.findByPk(serviceId);

      if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }


    const googleMapLink = generateGoogleMapLink(service.latitude,service.longitude)

    const serviceData = service.toJSON();

serviceData.googleMapLink = googleMapLink;

if (req.role === USER_ROLE.ADMIN) {
  res.json(serviceData);
} else {
  delete serviceData.latitude;
  delete serviceData.longitude;
  res.json(serviceData);
}




  }catch(err){
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });

  }

})
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
        HTTPStatus.NOT_FOUND,
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



export default router;
