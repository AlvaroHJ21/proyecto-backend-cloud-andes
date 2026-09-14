const mysql = require("mysql2/promise");
const env = require("../config/env");

let pool;

class DatabaseUnavailableError extends Error {
  constructor(cause) {
    super("No fue posible conectar con la base de datos MySQL.");
    this.name = "DatabaseUnavailableError";
    this.code = "DATABASE_UNAVAILABLE";
    this.status = 500;
    this.expose = true;
    this.cause = cause;
  }
}

function isDatabaseConfigured() {
  const { host, name, user, password } = env.database;
  return Boolean(host && name && user && password);
}

function validateDatabaseName() {
  // Los identificadores SQL no aceptan placeholders; limitamos el valor a caracteres seguros.
  if (!/^[A-Za-z0-9_]+$/.test(env.database.name)) {
    throw new DatabaseUnavailableError(
      new Error("DB_NAME solo puede contener letras, números y guion bajo.")
    );
  }
}

async function ensureDatabase() {
  if (!isDatabaseConfigured()) {
    throw new DatabaseUnavailableError(
      new Error("Faltan las variables DB_HOST, DB_NAME, DB_USER o DB_PASSWORD.")
    );
  }

  validateDatabaseName();
  let connection;

  try {
    // Esta conexión no selecciona database porque RDS puede haberse creado sin una base inicial.
    connection = await mysql.createConnection({
      host: env.database.host,
      port: env.database.port,
      user: env.database.user,
      password: env.database.password,
      connectTimeout: 5000,
      // DB_SSL activa TLS cuando el entorno de RDS lo requiera.
      ...(env.database.ssl ? { ssl: { rejectUnauthorized: true } } : {})
    });
    // IF NOT EXISTS permite repetir el arranque sin borrar ni reemplazar datos existentes.
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.database.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } catch (error) {
    throw asDatabaseError(error);
  } finally {
    await connection?.end();
  }
}

function getPool() {
  if (!isDatabaseConfigured()) {
    throw new DatabaseUnavailableError(
      new Error("Faltan las variables DB_HOST, DB_NAME, DB_USER o DB_PASSWORD.")
    );
  }

  if (!pool) {
    pool = mysql.createPool({
      host: env.database.host,
      port: env.database.port,
      database: env.database.name,
      user: env.database.user,
      password: env.database.password,
      waitForConnections: true,
      connectionLimit: env.database.connectionLimit,
      queueLimit: 0,
      connectTimeout: 5000,
      ...(env.database.ssl
        ? { ssl: { rejectUnauthorized: true } }
        : {})
    });
  }

  return pool;
}

function asDatabaseError(error) {
  if (error instanceof DatabaseUnavailableError) return error;
  return new DatabaseUnavailableError(error);
}

async function execute(sql, params = []) {
  try {
    return await getPool().execute(sql, params);
  } catch (error) {
    throw asDatabaseError(error);
  }
}

async function checkConnection() {
  let connection;

  try {
    connection = await getPool().getConnection();
    await connection.ping();
  } catch (error) {
    throw asDatabaseError(error);
  } finally {
    connection?.release();
  }
}

module.exports = {
  checkConnection,
  ensureDatabase,
  execute,
  isDatabaseConfigured
};
