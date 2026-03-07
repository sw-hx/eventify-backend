import express, { response } from "express";
import helperFunctions from "../utility/helperFunctions.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

//this mapped to /api/auth
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    // verify empty fields
    helperFunctions.verifyEmptyData({ body: req.body });
    helperFunctions.verifyEmptyData({
      email: req.body.email,
      password: req.body.password,
    });

    //now extract user data
    const { email, password } = req.body;

    //now verify the input format
    helperFunctions.verifyEmailPattern(email);
    helperFunctions.verifyPasswordPattern(password);

    /*
     * to do:
     * now do the logic
     */

    // sending the final response if no exception happens
    const response = { email, password };
    res.json(response);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

export default router;
