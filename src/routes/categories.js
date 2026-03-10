import express from "express";
import patternChecker from "../utility/patternCheckerHelperFunction.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // verify empty fields
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      category_name: req.body.category_name,
      image: req.body.image,
      commission: req.body.commission,
      fixed_fee: req.body.fixed_fee,
    });

    //verify user is admin to add category

    // verify the category name is not exists
    const { category_name, image, commission, fixed_fee } = req.body;

    //add the category to database

    //seed success message to user
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

export default router;
