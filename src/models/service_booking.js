import { DataTypes } from "sequelize";
export default function (sequelize, DataTypes) {
  return sequelize.define(
    "service_booking",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      service_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "services",
          key: "id",
        },
      },
      service_scheduled_date: {
        type: DataTypes.DATE(3),
        allowNull: false,
      },
      duration_hours: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
      },
      price_at_booking: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      commission_at_booking: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      fixed_fee_at_booking: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "service_bookings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "uq_user_service_start",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "user_id" },
            { name: "service_id" },
            { name: "start_time" },
          ],
        },
        {
          name: "idx_booking_service_time",
          using: "BTREE",
          fields: [{ name: "service_id" }, { name: "start_time" }],
        },
        {
          name: "idx_booking_user",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
      ],
    },
  );
}
