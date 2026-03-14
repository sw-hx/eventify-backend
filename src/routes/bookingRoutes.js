import express from "express";
import roleChecker from "../utility/role_checker.js";
import models from "../models/index.js";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import HTTPStatus from "../enums/httpCodeEnum.js";
import { Op } from "sequelize";
import bookService from "../dao/book-service/bookService.js";
import buildPaginationMeta from "../utility/buildPaginationMeta.js";
import getUserInfo from "../dao/users/getUserInfo.js";
import nodemailer from "nodemailer";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    /**
     *
     * extracting user inputs from body
     *
     */
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      user_id: req.userId,
      service_id: req.body.service_id,
      service_scheduled_date: req.body.service_scheduled_date,
      duration_hours: req.body.duration_hours,
    });
    const { service_id, service_scheduled_date } = req.body;

    let duration_hours = req.body.duration_hours;
    duration_hours = Number(duration_hours);
    patternChecker.verifyGTZero(duration_hours, "duration hours");

    const user_id = req.userId;

    /**
     *
     * Now reading data form database
     *
     */
    const Service = models.service;
    const Category = models.category;

    const service = await Service.findByPk(service_id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!service)
      errorFormatter.throwError(
        HTTPStatus.NOT_FOUND,
        `we cannot find service with id : ${service_id}`,
      );

    /**
     *
     * Now validating the user inputs logically
     *
     */

    //if service count > 0 and service-duration must be less than the count of service
    if (service.availability_count <= 0)
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        "the service want to book is not available",
      );

    if (service.availability_count <= duration_hours)
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        `you cannot book ${service.service_name} for duration: ${duration_hours} , the only available duration for booking is ${service.availability_count}`,
      );

    //verify scheduled date
    patternChecker.verifyIsDate(
      service_scheduled_date,
      "service scheduled date ",
    );
    const scheduledDate = new Date(service_scheduled_date);
    const now = new Date();

    if (scheduledDate <= now) {
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        "Service scheduled date must be in the future",
      );
    }

    //verify there is no service user booked can conflict with the new booking service
    const conflictingBooking = await models.service_booking.findOne({
      where: {
        user_id,
        service_scheduled_date: {
          [Op.lt]: new Date(
            scheduledDate.getTime() + duration_hours * 60 * 60 * 1000,
          ),
        },
        [Op.and]: [
          {
            service_scheduled_date: {
              [Op.gt]: new Date(
                scheduledDate.getTime() - duration_hours * 60 * 60 * 1000,
              ),
            },
          },
        ],
      },
    });

    if (conflictingBooking) {
      errorFormatter.throwError(
        HTTPStatus.BAD_REQUEST,
        "You already have a conflicting booking for this service during this time",
      );
    }

    /*
     * now start the transaction and save information to database
     */
    const category = service.category;
    const response = await bookService(
      user_id,
      service,
      category,
      scheduledDate,
      duration_hours,
    );

    /**
     * now send email to user and admin
     */
    /////////////////////
    const user = await getUserInfo(req.email);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Eventify" <${process.env.EMAIL_USER}>`,
      to: req.email,
      subject: `Booking service confirmation ${service.service_name} `,
      html: `<p>Hi ${user.full_name},</p>
               <p>You have booked service name : ${service.service_name} \n
               the booking price details is : \n
               duration hours ${response.pricing.duration_hours}$ \n
               price per hour : ${response.pricing.price_per_hour}$ \n
               base price : ${response.pricing.base_price}$ \n
               commission percentage: ${response.pricing.commission_percentage}% \n
               commission amount: ${response.pricing.commission_amount}$ \n
               fixed_fee_amount: ${response.pricing.fixed_fee_amount}$ \n
               total_price : ${response.pricing.total_price}$ \n
               </p>`,
    });

    ////////////////////

    res.status(HTTPStatus.CREATED).json(response);
  } catch (exception) {
    res.status(exception.status || 500).json({
      message: exception.message || "Internal server error",
    });
  }
});

export default router;
