import { database } from "../Config/db/connect";
import * as fs from "fs";
import * as path from "path";

async function runFirebaseMigration() {
  try {
    console.log("🔄 Iniciando migración de Firebase...");
    
    // Conectar a la base de datos
    await database.connect();
    const dataSource = database.getDataSource();
    
    console.log("✅ Conexión a base de datos establecida");
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, "../Config/db/migrations/006_add_firebase_auth_fields.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");
    
    console.log("📄 Archivo de migración leído");
    
    // Ejecutar la migración
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Dividir el SQL en comandos individuales
    const commands = migrationSQL
      .split(";")
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith("--"));
    
    console.log(`🔧 Ejecutando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`  ${i + 1}/${commands.length}: ${command.substring(0, 50)}...`);
        await queryRunner.query(command);
      }
    }
    
    await queryRunner.release();
    
    console.log("✅ Migración de Firebase completada exitosamente");
    console.log("📋 Campos agregados:");
    console.log("  - firebase_uid (VARCHAR, UNIQUE)");
    console.log("  - firebase_display_name (VARCHAR)");
    console.log("  - firebase_phone_number (VARCHAR)");
    console.log("  - email_verificado (BOOLEAN)");
    console.log("  - ultimo_login (TIMESTAMP)");
    console.log("  - tipo_autenticacion (VARCHAR)");
    console.log("  - Índices creados para optimizar consultas");
    
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  } finally {
    await database.disconnect();
    console.log("🔌 Conexión a base de datos cerrada");
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runFirebaseMigration()
    .then(() => {
      console.log("🎉 Migración completada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

export { runFirebaseMigration }; 