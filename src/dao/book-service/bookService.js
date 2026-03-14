import models from "../../models/index.js";
import errorFormatter from "../../utility/errorFormatterHelperFunction.js";
import priceForBookedService from "./price_object_generator.js";
const bookService = async (
  user_id,
  service,
  category,
  service_scheduled_date,
  duration_hours,
) => {
  let transaction;
  try {
    transaction = await models.user.sequelize.transaction();
    const service_id = service.id;
    const price_per_hour = service.price_per_hour;
    const { commission, fixed_fee } = category;
    //now start the transaction process
    const service_booked = await models.service_booking.create(
      {
        user_id,
        service_id,
        service_scheduled_date,
        duration_hours,
        price_at_booking: price_per_hour,
        commission_at_booking: commission,
        fixed_fee_at_booking: fixed_fee,
      },
      { transaction: transaction },
    );
    //update the  service
    service.availability_count = service.availability_count - duration_hours;
    await service.save({ transaction });

    await transaction.commit();

    /**
     *
     * now the report for the user
     *
     */

    // Total price calculation
    const pricing = priceForBookedService(service_booked);
    return {
      booking: service_booked.toJSON(),
      service: {
        id: service.id,
        name: service.service_name,
        provider: service.provider_name,
        remaining_availability: service.availability_count,
      },
      pricing: pricing,
    };
  } catch (exception) {
    if (transaction) await transaction.rollback();
    const message = `Error cannot book service : ${service.service_name}`;
    errorFormatter.printError(exception, message);
    errorFormatter.throwError(500, message);
  }
};
export default bookService;
