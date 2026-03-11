import models from "../../models/index.js";
import errorFormatter from "../../utility/errorFormatterHelperFunction.js";

const isExist = {
  name: async (name) => {
    try {
      const Category = models.category;

      const category_name = await Category.findOne({
        attributes: ["category_name"],
        where: { category_name: name },
      });

      return category_name ? true : false;
    } catch (exception) {
      const message = `Error cannot fetch category_name: ${name}`;
      errorFormatter.printError(exception, message);
      errorFormatter.throwError(500);
    }
  },
};
export default isExist;
