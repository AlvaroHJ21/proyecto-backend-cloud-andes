const bcrypt = require("bcryptjs");
const { execute } = require("./connection");
const env = require("../config/env");

async function createSchema() {
  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      title VARCHAR(180) NOT NULL,
      description TEXT,
      status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_tasks_user_id (user_id),
      CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function seedDemoUser() {
  const [rows] = await execute("SELECT COUNT(*) AS total FROM users");
  if (Number(rows[0].total) > 0) return;

  const passwordHash = bcrypt.hashSync(env.seedUser.password, 10);
  const [result] = await execute(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [env.seedUser.name, env.seedUser.email, passwordHash]
  );

  const seedTasks = [
    ["Revisar presupuesto AWS", "Crear una alerta de costo antes de desplegar.", "completed"],
    ["Publicar frontend", "Subir la interfaz a un hosting web.", "pending"],
    ["Probar health check", "Validar que el backend responda correctamente.", "pending"]
  ];

  for (const task of seedTasks) {
    await execute(
      `INSERT INTO tasks (user_id, title, description, status)
       VALUES (?, ?, ?, ?)`,
      [result.insertId, task[0], task[1], task[2]]
    );
  }
}

async function initDatabase() {
  await createSchema();
  await seedDemoUser();
}

module.exports = initDatabase;
