import models from "../../models/index.js";
import errorFormatter from "../../utility/errorFormatterHelperFunction.js";

const getUserInfo =  async(email)=>{
try{
    const User = models.user;

    const userEmail = await User.findOne({
      where: { email },
    });

    if (!userEmail) {
      console.log(userEmail);
      errorFormatter.throwError(404, "Email is not exist");
    }
    return userEmail;

}catch(err){
    errorFormatter.printError(err, "Error cannot fetch email");
    errorFormatter.throwError(500, err);
}


}

export default getUserInfo;