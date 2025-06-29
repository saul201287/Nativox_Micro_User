import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Signale } from "signale";

dotenv.config();
const signale = new Signale();

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV === "development" ? true : false,
  logging: process.env.NODE_ENV === "development",
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

class Database {
  private static instance: Database;
  private dataSource: DataSource;

  private constructor() {
    this.dataSource = AppDataSource;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
        signale.success("Conexión exitosa a la base de datos");

        if (
          process.env.NODE_ENV === "production" &&
          process.env.AUTO_RUN_MIGRATIONS === "true"
        ) {
          signale.info("Ejecutando migraciones automáticamente...");
          await this.dataSource.runMigrations();
          signale.success("Migraciones ejecutadas");
        }
      }
    } catch (error) {
      signale.error("Error al conectar con la base de datos:", error);
      throw error;
    }
  }

  public async runMigrations(): Promise<void> {
    try {
      await this.dataSource.runMigrations();
      signale.success("Migraciones ejecutadas exitosamente");
    } catch (error) {
      signale.error("Error ejecutando migraciones:", error);
      throw error;
    }
  }

  public async revertLastMigration(): Promise<void> {
    try {
      await this.dataSource.undoLastMigration();
      signale.success("Migración revertida exitosamente");
    } catch (error) {
      signale.error("Error revirtiendo migración:", error);
      throw error;
    }
  }

  public getDataSource(): DataSource {
    return this.dataSource;
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        signale.info("Conexión a la base de datos cerrada");
      }
    } catch (error) {
      signale.error("Error cerrando conexión:", error);
      throw error;
    }
  }
}

export const database = Database.getInstance();
