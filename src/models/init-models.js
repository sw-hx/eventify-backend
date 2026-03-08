import { DataTypes } from "sequelize";
import _category from "./category.js";
import _service_booking from "./service_booking.js";
import _service from "./service.js";
import _user_token from "./user_token.js";
import _user from "./user.js";

function initModels(sequelize) {
  var category = _category(sequelize, DataTypes);
  var service_booking = _service_booking(sequelize, DataTypes);
  var service = _service(sequelize, DataTypes);
  var user_token = _user_token(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  service.belongsTo(category, { as: "category", foreignKey: "category_id" });
  category.hasMany(service, { as: "services", foreignKey: "category_id" });
  service_booking.belongsTo(service, {
    as: "service",
    foreignKey: "service_id",
  });
  service.hasMany(service_booking, {
    as: "service_bookings",
    foreignKey: "service_id",
  });
  service_booking.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(service_booking, {
    as: "service_bookings",
    foreignKey: "user_id",
  });
  service.belongsTo(user, { as: "created_by_user", foreignKey: "created_by" });
  user.hasMany(service, { as: "services", foreignKey: "created_by" });
  user_token.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(user_token, { as: "user_tokens", foreignKey: "user_id" });

  return {
    category,
    service_booking,
    service,
    user_token,
    user,
  };
}
export default initModels;
