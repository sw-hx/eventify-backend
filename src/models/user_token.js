import { DataTypes } from "sequelize";
export default function (sequelize, DataTypes) {
  return sequelize.define(
    "user_token",
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
      token_type: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      token_hash: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE(3),
        allowNull: false,
      },
      used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "user_tokens",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "idx_user_tokens_user_id",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "idx_user_tokens_token_hash",
          using: "BTREE",
          fields: [{ name: "token_hash" }],
        },
        {
          name: "idx_user_tokens_expires_at",
          using: "BTREE",
          fields: [{ name: "expires_at" }],
        },
      ],
    },
  );
}
