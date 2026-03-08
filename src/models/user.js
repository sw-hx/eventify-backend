import { DataTypes } from "sequelize";
export default function (sequelize, DataTypes) {
  return sequelize.define(
    "user",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: "uq_users_username",
      },
      full_name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "uq_users_email",
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      profile_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      user_role: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "client",
      },
      account_status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "inactive",
      },
    },
    {
      sequelize,
      tableName: "users",
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
          name: "uq_users_username",
          unique: true,
          using: "BTREE",
          fields: [{ name: "username" }],
        },
        {
          name: "uq_users_email",
          unique: true,
          using: "BTREE",
          fields: [{ name: "email" }],
        },
        {
          name: "idx_users_role",
          using: "BTREE",
          fields: [{ name: "user_role" }],
        },
        {
          name: "idx_users_created_at",
          using: "BTREE",
          fields: [{ name: "created_at" }],
        },
      ],
    },
  );
}
