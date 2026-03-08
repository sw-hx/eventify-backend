import { DataTypes } from "sequelize";
export default function (sequelize, DataTypes) {
  return sequelize.define(
    "service",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      category_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
      },
      provider_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      service_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      price_per_hour: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      serv_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      main_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      sub_image1: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      sub_image2: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      sub_image3: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      sub_image4: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      sub_image5: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      availability_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "services",
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
          name: "uq_user_service",
          unique: true,
          using: "BTREE",
          fields: [{ name: "created_by" }, { name: "service_name" }],
        },
        {
          name: "idx_services_category",
          using: "BTREE",
          fields: [{ name: "category_id" }],
        },
        {
          name: "idx_services_user",
          using: "BTREE",
          fields: [{ name: "created_by" }],
        },
        {
          name: "idx_services_location",
          using: "BTREE",
          fields: [{ name: "latitude" }, { name: "longitude" }],
        },
      ],
    },
  );
}
