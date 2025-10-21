// Simple migración: agrega la columna 'precio' a 'vehiculos' si no existe
import pool from "../config/db.js";

async function columnExists(database, table, column) {
  const [rows] = await pool.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [database, table, column]
  );
  return rows.length > 0;
}

async function addPrecioColumnIfMissing() {
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    console.error("DB_NAME no definido en .env");
    process.exit(1);
  }
  const exists = await columnExists(dbName, "vehiculos", "precio");
  if (exists) {
    console.log("Columna 'precio' ya existe en 'vehiculos'. Nada para hacer.");
    return;
  }
  await pool.query(`ALTER TABLE vehiculos ADD COLUMN precio DECIMAL(10,2) NULL`);
  console.log("Columna 'precio' agregada a 'vehiculos'.");
}

async function addReservaTotalsIfMissing() {
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    console.error("DB_NAME no definido en .env");
    process.exit(1);
  }
  const hasPrecioDiario = await columnExists(dbName, "reservas", "precio_diario");
  if (!hasPrecioDiario) {
    await pool.query(`ALTER TABLE reservas ADD COLUMN precio_diario DECIMAL(10,2) NULL`);
    console.log("Columna 'precio_diario' agregada a 'reservas'.");
  }
  const hasTotal = await columnExists(dbName, "reservas", "total");
  if (!hasTotal) {
    await pool.query(`ALTER TABLE reservas ADD COLUMN total DECIMAL(10,2) NULL`);
    console.log("Columna 'total' agregada a 'reservas'.");
  }
}

async function main() {
  try {
    await addPrecioColumnIfMissing();
    await addReservaTotalsIfMissing();
  } catch (e) {
    console.error("Error en migración:", e?.message || e);
    process.exit(1);
  } finally {
    try { await pool.end(); } catch {}
  }
}

main();


