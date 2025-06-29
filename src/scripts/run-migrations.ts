import { AppDataSource } from "../Config/db/typeorm.config";
import { Signale } from "signale";

const signale = new Signale();

async function runMigrations() {
  try {
    signale.info("Inicializando conexión a la base de datos...");
    await AppDataSource.initialize();

    signale.info("Ejecutando migraciones...");
    await AppDataSource.runMigrations();

    signale.success("Migraciones ejecutadas exitosamente");
    process.exit(0);
  } catch (error) {
    signale.error("Error ejecutando migraciones:", error);
    process.exit(1);
  }
}

runMigrations();
