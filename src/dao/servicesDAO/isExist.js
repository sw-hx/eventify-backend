import models from "../../models/index.js";
import errorFormatter from "../../utility/errorFormatterHelperFunction.js";

const isExist = {
  name: async (name) => {
    try {
      const Service = models.service;

      const service_name = await Service.findOne({
        attributes: ["service_name"],
        where: { service_name: name },
      });

      return service_name ? true : false;
    } catch (exception) {
      const message = `Error cannot fetch service_name: ${name}`;
      errorFormatter.printError(exception, message);
      errorFormatter.throwError(500);
    }
  },
};
export default isExist;
