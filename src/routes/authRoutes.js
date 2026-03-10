import express from "express";
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import hashPassword from "../utility/hashPassword.js";
import isExist from "../dao/userHelperMethods.js";
import getUserByEmail from "../dao/getUserByEmail.js";
import {generateToken} from "../security/jwt.js"
import registerUser from "../dao/registerUser.js";
import admin from '../config/firebase.js'
import nodemailer from "nodemailer";
import models from "../models/index.js";
//this mapped to /api/auth
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    // verify empty fields
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      email: req.body.email,
      password: req.body.password,
      username: req.body.username,
      fullName: req.body.fullName,
    });

    //now extract user data
    const { email, password, username, fullName } = req.body;

    //now verify the input format
    patternChecker.verifyEmailPattern(email);
    patternChecker.verifyPasswordPattern(password);
    patternChecker.verifyUsernamePattern(username);

    /**
     *
     * now database logic
     *
     */

    //verify there is no user with this email or username
    if (await isExist.Email(email))
      errorFormatter.throwError(409, `your email is already exist `);

    if (await isExist.username(username))
      errorFormatter.throwError(409, `your username is already exist `);

    //now saving the user information to database
    //hash the password
    const hashedPassword = await hashPassword(password);

    // sending the final response if no exception happens
  

    /**
     *
     * to do create a token and send it as email to user to verify it,s email
     */
     
const userRecord = await admin.auth().createUser({
  email,
  password,
});


const verificationLink = await admin
  .auth()
  .generateEmailVerificationLink(email, {
    url: `${process.env.BASE_URL}/api/auth/verify-email?uid=${userRecord.uid}`,
  });




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
  from: `"Eventify" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Verify your email",
  html: `<p>Hi ${fullName},</p>
         <p>Click the link below to verify your email:</p>
         <a href="${verificationLink}">${verificationLink}</a>`,
});


    //now save the user info to database
    await registerUser(username, fullName, email, hashedPassword,userRecord.uid);

    const response = {
      message: `you need to verify your email please check your email: ${email} inbox for verification link `,
    };
    res.json(response);

    // handel exceptions
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});

router.post('/login',async(req,res)=>{

  try{
    patternChecker.verifyEmptyData({ body: req.body });
    patternChecker.verifyEmptyData({
      email: req.body.email,
      password: req.body.password,
    });
     const { email, password} = req.body;

      patternChecker.verifyEmailPattern(email);

      const user = await getUserByEmail(email,password);

      const token = generateToken({ 
        id: user.id,
         email: user.email ,
          role : user.user_role
        });

     const { id, userEmail, full_name ,username , user_role} = user;
     const response = { id, userEmail, full_name, username, user_role, token};

    res.json(response);



    

  }catch(err){

    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }





});


router.get("/verify-email", async (req, res) => {
  try {
    const { uid } = req.query;

    
    const user = await models.user.findOne({ where: { firebase_uid: uid } });

    if (!user) {
      return res.status(404).send("❌ User not found.");
    }

    user.email_verified = true;
    await user.save();

    res.send("✅ Your email has been successfully verified! You can now log in.");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ An error occurred while verifying your email.");
  }
});

export default router;
