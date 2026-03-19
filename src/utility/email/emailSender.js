import axios, { HttpStatusCode } from "axios";
import errorFormatter from "../errorFormatterHelperFunction.js";
import HTTPStatus from "../../enums/httpCodeEnum.js";
const emailSender = async (email, subject, message) => {
  const request = { email, subject, message };
  //start sending the email
  try {
    const response = await axios.post(
      process.env.N8N_WEB_HOCK_EMAIL_SENDER,
      request,
      { timeout: 5000 },
    );
    console.log(
      `
        ########################################################
        ############# EMAIL SENDER SERVICE RESPONSE ############
        ########################################################
        `,
      response.data,
    );
  } catch (exceptions) {
    errorFormatter.printError(
      exceptions,
      `error when sending email to ${email}`,
    );
    throw errorFormatter.throwError(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      `sorry ${email} we can not send email at the moment , please try again later`,
    );
  }
};

export default emailSender;
