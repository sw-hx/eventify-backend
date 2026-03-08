import { Sequelize } from "sequelize";
const options = {
  dialect: "mysql",
  log: true,
};

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  options,
);
export default sequelize;
