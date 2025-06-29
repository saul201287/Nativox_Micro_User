import { exec } from "child_process";
import { promisify } from "util";
import { Signale } from "signale";

const execAsync = promisify(exec);
const signale = new Signale();

async function createMigration() {
  const migrationName = process.argv[2];

  if (!migrationName) {
    signale.error("Por favor proporciona un nombre para la migración");
    signale.info("Uso: npm run migration:create <nombre>");
    process.exit(1);
  }

  try {
    signale.info(`Creando migración vacía: ${migrationName}`);

    const command = `npx typeorm-ts-node-commonjs migration:create src/migrations/${migrationName}`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      signale.warn("Advertencias:", stderr);
    }

    signale.success("Migración creada exitosamente");
    console.log(stdout);
  } catch (error) {
    signale.error("Error creando migración:", error);
    process.exit(1);
  }
}

createMigration();
