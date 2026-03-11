import models from "../../models/index.js";
import errorFormatter from "../../utility/errorFormatterHelperFunction.js";

const addService = async (
  created_by,
  category_id,
  provider_name,
  service_name,
  price_per_hour,
  serv_description,
  main_image,
  sub_image1,
  sub_image2,
  sub_image3,
  sub_image4,
  sub_image5,
  availability_count,
  country,
  city,
  latitude,
  longitude,
) => {
  let transaction;
  try {
    transaction = await models.user.sequelize.transaction();

    //now start the transaction process
    const service = await models.service.create(
      {
        created_by,
        category_id,
        provider_name,
        service_name,
        price_per_hour,
        serv_description,
        main_image,
        sub_image1,
        sub_image2,
        sub_image3,
        sub_image4,
        sub_image5,
        availability_count,
        country,
        city,
        latitude,
        longitude,
      },
      { transaction: transaction },
    );

    await transaction.commit();

    return service;
  } catch (exception) {
    if (transaction) await transaction.rollback();
    const message = `Error cannot add service: ${service_name}`;
    errorFormatter.printError(exception, message);
    errorFormatter.throwError(500, message);
  }
};
export default addService;
