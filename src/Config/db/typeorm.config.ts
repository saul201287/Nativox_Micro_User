import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities:
    process.env.NODE_ENV === "production"
      ? ["dist/db/entities/**/*.js"]
      : ["src/db/entities/**/*.ts"],
  migrations:
    process.env.NODE_ENV === "production"
      ? ["dist/migrations/**/*.js"]
      : ["src/migrations/**/*.ts"],
  subscribers:
    process.env.NODE_ENV === "production"
      ? ["dist/subscribers/**/*.js"]
      : ["src/subscribers/**/*.ts"],
});
