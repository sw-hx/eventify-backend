import express from 'express'
import patternChecker from "../utility/patternCheckerHelperFunction.js";
import getUserInfo from '../dao/users/getUserInfo.js';
import isExist from '../dao/users/isExist.js'
import errorFormatter from "../utility/errorFormatterHelperFunction.js";
import HTTPStatus from "../enums/httpCodeEnum.js";



const router = express.Router();


router.patch('/user-profile', async (req, res) => {
  try {
    patternChecker.verifyEmptyData({ body: req.body });

    const { fullName, image , username } = req.body;
    const email = req.email;

    const user = await getUserInfo(email);

   
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    console.log(username)
    console.log(user.username)



    if (username !== undefined && username !== "null") {
      if(user.username === username){
        errorFormatter.throwError(
          HTTPStatus.CONFLICT,
          `Username already in use.`,
        );
    }
    if(await isExist.username(username)){
        errorFormatter.throwError(
          HTTPStatus.CONFLICT,
          `there is already username with the same name: ${username}`,
        );
    }

    patternChecker.verifyUsernamePattern(username);
    
    user.username =username;

    }


    

    if (image !== undefined && image !== "null") {
      patternChecker.verifyUrlPattern(image, "image_url");
      user.image = image;
    }

    if (fullName !== undefined && fullName !== null) {
      user.full_name = fullName;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      
    });

  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
});
export default router;