import { AppDataSource } from "../Config/db/typeorm.config";
import { Signale } from "signale";

const signale = new Signale();

async function revertMigration() {
  try {
    signale.info("Inicializando conexión a la base de datos...");
    await AppDataSource.initialize();

    signale.info("Revirtiendo última migración...");
    await AppDataSource.undoLastMigration();

    signale.success("Migración revertida exitosamente");
    process.exit(0);
  } catch (error) {
    signale.error("Error revirtiendo migración:", error);
    process.exit(1);
  }
}

revertMigration();
