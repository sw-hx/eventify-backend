const price = (booked_service) => {
  const price_per_hour_at_booking = booked_service.price_at_booking;

  const booked_duration = booked_service.duration_hours;

  const based_price =
    booked_service.price_at_booking * booked_service.duration_hours;

  const commission_percentage_at_booking = booked_service.commission_at_booking;

  const commission_amount = booked_service.commission_at_booking * based_price;

  const fixed_fee_amount_at_booking = booked_service.fixed_fee_at_booking;

  const totalPrice =
    based_price + commission_amount + fixed_fee_amount_at_booking;

  //now add them to object
  return {
    price_per_hour_at_booking,
    booked_duration,
    based_price,
    commission_percentage_at_booking,
    commission_amount,
    fixed_fee_amount_at_booking,
    totalPrice,
  };
};

export default price;
