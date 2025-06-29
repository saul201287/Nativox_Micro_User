import { exec } from "child_process";
import { promisify } from "util";
import { Signale } from "signale";

const execAsync = promisify(exec);
const signale = new Signale();

async function generateMigration() {
  const migrationName = process.argv[2];

  if (!migrationName) {
    signale.error("Por favor proporciona un nombre para la migración");
    signale.info("Uso: npm run migration:generate <nombre>");
    process.exit(1);
  }

  try {
    signale.info(`Generando migración: ${migrationName}`);

    const command = `npx typeorm-ts-node-commonjs migration:generate src/migrations/${migrationName} -d src/config/typeorm.config.ts`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      signale.warn("Advertencias:", stderr);
    }

    signale.success("Migración generada exitosamente");
    console.log(stdout);
  } catch (error) {
    signale.error("Error generando migración:", error);
    process.exit(1);
  }
}

generateMigration();