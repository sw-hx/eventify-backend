import models from "../../models/index.js";
import errorFormatter from "../../utility/errorFormatterHelperFunction.js";

const addCategory = async (category_name, commission, fixed_fee) => {
  let transaction;
  try {
    transaction = await models.user.sequelize.transaction();

    //now start the transaction process
    const category = await models.category.create(
      {
        category_name,
        commission,
        fixed_fee,
      },
      { transaction: transaction },
    );

    await transaction.commit();

    return category;
  } catch (exception) {
    if (transaction) await transaction.rollback();
    const message = `Error cannot add category: ${category_name}`;
    errorFormatter.printError(exception, message);
    errorFormatter.throwError(500, message);
  }
};
export default addCategory;
