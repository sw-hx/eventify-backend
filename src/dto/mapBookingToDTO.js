import priceObjectGenerator from "../dao/book-service/price_object_generator.js";

const mapBookingToDTO = (booking) => {
  return {
    id: booking.id,
    scheduled_date: booking.service_scheduled_date,
    duration_hours: booking.duration_hours,
    created_at: booking.created_at,
    price: priceObjectGenerator(booking),
    user: {
      email: booking.user.email,
      full_name: booking.user.full_name,
      profile_image: booking.user.profile_image,
    },
    service: {
      id: booking.service.id,
      name: booking.service.service_name,
      provider: booking.service.provider_name,
      price_per_hour: Number(booking.service.price_per_hour),
      location: {
        country: booking.service.country,
        city: booking.service.city,
      },

      images: {
        main: booking.service.main_image,
      },
    },
  };
};

export default mapBookingToDTO;
