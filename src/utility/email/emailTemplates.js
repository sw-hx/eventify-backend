const emailTemplates = {
  verificationLink(fullName, verificationLink) {
    return `<p>Hi ${fullName},</p>
     <p>Click the link below to verify your email:</p>
     <a href="${verificationLink}">${verificationLink}</a>`;
  },
  restPassword(email, resetPasswordLink) {
    return `<p>Hi ${email},</p>
         <p>Click the link below to Reset your password:</p>
         <a href="${resetPasswordLink}">${resetPasswordLink}</a>`;
  },
  userBookedService(fullName, serviceName, pricing) {
    return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Hi ${fullName},</p>

      <p>
        You have successfully booked the service:
        <strong>${serviceName}</strong>
      </p>

      <h2 style="color: #2c3e50;">Booking Price Details</h2>

      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            Duration (hours)
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${pricing.booked_duration}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Price per hour</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            $${pricing.price_per_hour_at_booking}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Base price</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            $${pricing.based_price}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Commission (%)</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${pricing.commission_percentage_at_booking}%
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            Commission amount
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            $${pricing.commission_amount}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Fixed fee</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            $${pricing.fixed_fee_amount_at_booking}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Total price</strong>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>$${pricing.totalPrice}</strong>
          </td>
        </tr>
      </table>

      <p style="margin-top: 20px;">Thank you for choosing our service!</p>
    </div>`;
  },
  serviceOwnerBookedNotification(fullName, serviceName, pricing, clientEmail) {
    return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Hi ${fullName},</p>

      <p>
        Your service ${serviceName} has been booked successfully by:
        <strong>${clientEmail}</strong>
      </p>

      <h2 style="color: #2c3e50;">Booking Price Details</h2>

      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            Duration (hours)
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${pricing.booked_duration}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Price per hour</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            $${pricing.price_per_hour_at_booking}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Base price</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            $${pricing.based_price}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Commission (%)</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${pricing.commission_percentage_at_booking}%
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            Commission amount
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            $${pricing.commission_amount}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Fixed fee</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            $${pricing.fixed_fee_amount_at_booking}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Total price</strong>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>$${pricing.totalPrice}</strong>
          </td>
        </tr>
      </table>

      <p style="margin-top: 20px;">Thank you for choosing our service!</p>
    </div>`;
  },
};

export default emailTemplates;
