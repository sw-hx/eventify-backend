import express from "express";
import roleChecker from "../utility/role_checker.js";
import { sequelize } from "../models/index.js";
import HTTPStatus from "../enums/httpCodeEnum.js";

const router = express.Router();

router.get("/booking-count-by-categories", async (req, res) => {
  try {
    //verify is admin
    roleChecker.isAdmin(req.role);

    //now we need to run a native query to get better performance
    const [result] = await sequelize.query(`
        SELECT 
            c.id,
            c.category_name,
            COUNT(b.id) AS booking_count
        FROM categories c
        LEFT JOIN services s ON s.category_id = c.id
        LEFT JOIN service_bookings b ON b.service_id = s.id
        GROUP BY c.id, c.category_name
        ORDER BY booking_count DESC
`);
    res.status(HTTPStatus.OK).send(result);
  } catch (exception) {
    return res.status(exception.status || 500).json({
      message: exception.message || "Internal server error",
    });
  }
});

router.get("/booking-revenue", async (req, res) => {
  try {
    //verify is admin
    roleChecker.isAdmin(req.role);

    //now we need to run a native query to get better performance
    const [result] = await sequelize.query(`
        SELECT 
            DATE_FORMAT(b.created_at, '%Y-%m') AS month,
            SUM(b.price_at_booking * b.commission_at_booking + b.fixed_fee_at_booking) AS revenue
        FROM service_bookings b
        GROUP BY DATE_FORMAT(b.created_at, '%Y-%m')
        ORDER BY month ASC;
`);
    res.status(HTTPStatus.OK).send(result);
  } catch (exception) {
    return res.status(exception.status || 500).json({
      message: exception.message || "Internal server error",
    });
  }
});

export default router;
