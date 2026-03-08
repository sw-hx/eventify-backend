import { DataTypes } from "sequelize";
export default function (sequelize, DataTypes) {
  return sequelize.define(
    "category",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      category_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: "uq_categories_name",
      },
      image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      commission: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      fixed_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      tableName: "categories",
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
          name: "uq_categories_name",
          unique: true,
          using: "BTREE",
          fields: [{ name: "category_name" }],
        },
        {
          name: "idx_categories_created_at",
          using: "BTREE",
          fields: [{ name: "created_at" }],
        },
      ],
    },
  );
}
