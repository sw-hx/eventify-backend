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
import mapBookingToDTO from "../dto/mapBookingToDTO.js";

const router = express.Router();

router.get("/user-bookings", async (req, res) => {
  try {
    let {
      service_id,
      category_id,
      service_scheduled_date,
      duration_hours,
      price_at_booking,
      commission_at_booking,
      fixed_fee_at_booking,
      input_price_sort,
      search = "",
      page = 1,
      page_size = 10,
    } = req.query;

    const ServiceBooking = models.service_booking;
    const where = {};
    const include = [];
    let order = [];

    /**
     * setup the pagination
     */
    page = Number(page);
    const limit = Number(page_size);
    patternChecker.verifyGTZero(limit, "page size");
    patternChecker.verifyGTZero(page, "page number");
    const offset = (page - 1) * limit;

    /**
     *
     * now extracting the data
     *
     */
    where.user_id = req.userId;

    if (service_id) {
      const serviceId = Number(service_id);
      patternChecker.verifyGTZero(serviceId, "service id");
      where.service_id = serviceId;
    }

    if (category_id) {
      const categoryId = Number(category_id);
      patternChecker.verifyGTZero(categoryId, "category id");
      include.push({
        model: models.service,
        as: "service",
        required: true, // for join
        where: {
          category_id: categoryId,
        },
      });
    }

    if (duration_hours) {
      const duration = Number(duration_hours);
      patternChecker.verifyGTZero(duration, "duration hours");
      where.duration_hours = duration;
    }

    if (price_at_booking) {
      const priceAtBooking = Number(price_at_booking);
      patternChecker.verifyNotNegative(priceAtBooking, "price at booking ");
      where.price_at_booking = priceAtBooking;
    }

    if (commission_at_booking) {
      const commissionAtBooking = Number(commission_at_booking);
      patternChecker.verifyNotNegative(
        commissionAtBooking,
        "commission at booking ",
      );
      where.commission_at_booking = commissionAtBooking;
    }

    if (fixed_fee_at_booking) {
      const fixedFeeAtBooking = Number(fixed_fee_at_booking);
      patternChecker.verifyNotNegative(
        fixedFeeAtBooking,
        "fixed fee at booking ",
      );
      where.fixed_fee_at_booking = fixedFeeAtBooking;
    }

    if (service_scheduled_date) {
      const date = new Date(service_scheduled_date);

      patternChecker.verifyIsDate(date);
      where.service_scheduled_date = {
        [Op.gt]: date,
      };
    }

    /**
     * for sorting
     */

    if (input_price_sort === "price_asc") {
      order = [["price_at_booking", "ASC"]];
    } else if (input_price_sort === "price_desc") {
      order = [["price_at_booking", "DESC"]];
    } else {
      order = [["created_at", "DESC"]];
    }

    /**
     *
     * for searching
     */
    if (search && search.trim() !== "") {
      const trimmedSearch = search.trim();
      include.push({
        model: models.service,
        as: "service",
        required: true,
        where: {
          service_name: {
            [Op.like]: `${trimmedSearch}%`,
          },
        },
      });
    } else {
      include.push({
        model: models.service,
        as: "service",
      });
    }
    include.push({
      model: models.user,
      as: "user",
    });
    /**
     *
     * Now the query
     */

    const { count, rows } = await ServiceBooking.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
      distinct: true,
    });

    const mappedRows = rows.map(mapBookingToDTO);
    res
      .status(HTTPStatus.OK)
      .json(buildPaginationMeta(count, limit, page, mappedRows));
  } catch (exception) {
    res.status(exception.status || 500).json({
      message: exception.message || "Internal server error",
    });
  }
});

// for user to get his only booked services details
router.get("/user/:id", async (req, res) => {
  try {
    //now get the id from url
    const id = Number(req.params.id);
    patternChecker.verifyGTZero(id, "booked id ");

    //now fetch the booking information for the database
    const Service = await models.service;
    const user = await models.user;
    const booked_service = await models.service_booking.findOne({
      include: [
        {
          model: Service,
          as: "service",
        },
        {
          model: user,
          as: "user",
        },
      ],
      where: {
        id,
        user_id: req.userId,
      },
    });

    if (!booked_service)
      errorFormatter.throwError(
        HTTPStatus.NOT_FOUND,
        `booked service with id:${id} cannot found `,
      );

    /**
     *
     * Now building the response
     *
     */

    res.status(HTTPStatus.OK).send(mapBookingToDTO(booked_service));
  } catch (exception) {
    res.status(exception.status || 500).json({
      message: exception.message || "Internal server error",
    });
  }
});

// for admin only search and filter
router.get("/", async (req, res) => {
  try {
    //check admin
    roleChecker.isAdmin(req.role);
    let {
      service_id,
      category_id,
      user_id,
      service_scheduled_date,
      duration_hours,
      price_at_booking,
      commission_at_booking,
      fixed_fee_at_booking,
      input_price_sort,
      search = "",
      page = 1,
      page_size = 10,
    } = req.query;

    const ServiceBooking = models.service_booking;
    const where = {};
    const include = [];
    let order = [];

    include.push({
      model: models.user,
      as: "user",
    });

    /**
     * setup the pagination
     */
    page = Number(page);
    const limit = Number(page_size);
    patternChecker.verifyGTZero(limit, "page size");
    patternChecker.verifyGTZero(page, "page number");
    const offset = (page - 1) * limit;

    /**
     *
     * now extracting the data
     *
     */

    if (service_id) {
      const serviceId = Number(service_id);
      patternChecker.verifyGTZero(serviceId, "service id");
      where.service_id = serviceId;
    }

    if (user_id) {
      const userId = Number(user_id);
      patternChecker.verifyGTZero(userId, "user id");
      where.user_id = userId;
    }

    if (category_id) {
      const categoryId = Number(category_id);
      patternChecker.verifyGTZero(categoryId, "category id");
      include.push({
        model: models.service,
        as: "service",
        required: true, // for join
        where: {
          category_id: categoryId,
        },
      });
    }

    if (duration_hours) {
      const duration = Number(duration_hours);
      patternChecker.verifyGTZero(duration, "duration hours");
      where.duration_hours = duration;
    }

    if (price_at_booking) {
      const priceAtBooking = Number(price_at_booking);
      patternChecker.verifyNotNegative(priceAtBooking, "price at booking ");
      where.price_at_booking = priceAtBooking;
    }

    if (commission_at_booking) {
      const commissionAtBooking = Number(commission_at_booking);
      patternChecker.verifyNotNegative(
        commissionAtBooking,
        "commission at booking ",
      );
      where.commission_at_booking = commissionAtBooking;
    }

    if (fixed_fee_at_booking) {
      const fixedFeeAtBooking = Number(fixed_fee_at_booking);
      patternChecker.verifyNotNegative(
        fixedFeeAtBooking,
        "fixed fee at booking ",
      );
      where.fixed_fee_at_booking = fixedFeeAtBooking;
    }

    if (service_scheduled_date) {
      const date = new Date(service_scheduled_date);

      patternChecker.verifyIsDate(date);
      where.service_scheduled_date = {
        [Op.gt]: date,
      };
    }

    /**
     * for sorting
     */

    if (input_price_sort === "price_asc") {
      order = [["price_at_booking", "ASC"]];
    } else if (input_price_sort === "price_desc") {
      order = [["price_at_booking", "DESC"]];
    } else {
      order = [["created_at", "DESC"]];
    }

    /**
     *
     * for searching
     */
    if (search && search.trim() !== "") {
      const trimmedSearch = search.trim();
      include.push({
        model: models.service,
        as: "service",
        required: true,
        where: {
          service_name: {
            [Op.like]: `${trimmedSearch}%`,
          },
        },
      });
    } else {
      include.push({
        model: models.service,
        as: "service",
      });
    }

    /**
     *
     * Now the query
     */

    const { count, rows } = await ServiceBooking.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
      distinct: true,
    });

    const mappedRows = rows.map(mapBookingToDTO);
    res
      .status(HTTPStatus.OK)
      .json(buildPaginationMeta(count, limit, page, mappedRows));
  } catch (exception) {
    res.status(exception.status || 500).json({
      message: exception.message || "Internal server error",
    });
  }
});

// client user can only see his bookings
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
               <p>You have booked service name : ${service.service_name}
               the booking price details is :
               duration hours ${response.pricing.duration_hours}$ 
               price per hour : ${response.pricing.price_per_hour}$
               base price : ${response.pricing.base_price}$ 
               commission percentage: ${response.pricing.commission_percentage}%
               commission amount: ${response.pricing.commission_amount}$ 
               fixed_fee_amount: ${response.pricing.fixed_fee_amount}$ 
               total_price : ${response.pricing.total_price}$ 
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

//only for admin (get booking details )
router.get("/:id", async (req, res) => {
  try {
    //check admin
    roleChecker.isAdmin(req.role);

    //now get the id from url
    const id = Number(req.params.id);
    patternChecker.verifyGTZero(id, "booked id ");

    //now fetch the booking information for the database
    const Service = await models.service;
    const user = await models.user;
    const booked_service = await models.service_booking.findByPk(id, {
      include: [
        {
          model: Service,
          as: "service",
        },
        {
          model: user,
          as: "user",
        },
      ],
    });

    if (!booked_service)
      errorFormatter.throwError(
        HTTPStatus.NOT_FOUND,
        `booked service with id:${id} cannot found `,
      );

    /**
     *
     * Now building the response
     *
     */

    res.status(HTTPStatus.OK).send(mapBookingToDTO(booked_service));
  } catch (exception) {
    res.status(exception.status || 500).json({
      message: exception.message || "Internal server error",
    });
  }
});

export default router;
