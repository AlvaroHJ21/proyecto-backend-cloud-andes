const { execute } = require("../database/connection");

function mapTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.status,
    createdAt: task.created_at,
    updatedAt: task.updated_at
  };
}

async function listByUser(userId) {
  const [rows] = await execute(
    "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC",
    [userId]
  );
  return rows.map(mapTask);
}

async function findByIdForUser(id, userId) {
  const [rows] = await execute(
    "SELECT * FROM tasks WHERE id = ? AND user_id = ? LIMIT 1",
    [id, userId]
  );
  const task = rows[0];
  return task ? mapTask(task) : null;
}

async function create(userId, data) {
  const [result] = await execute(
    "INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)",
    [userId, data.title, data.description || "", data.status || "pending"]
  );

  return findByIdForUser(result.insertId, userId);
}

async function update(id, userId, data) {
  await execute(
    `UPDATE tasks
     SET title = ?, description = ?, status = ?
     WHERE id = ? AND user_id = ?`,
    [data.title, data.description || "", data.status, id, userId]
  );

  return findByIdForUser(id, userId);
}

async function remove(id, userId) {
  const [result] = await execute(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
}

async function summary(userId) {
  const [rows] = await execute(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
     FROM tasks
     WHERE user_id = ?`,
    [userId]
  );
  const row = rows[0];

  return {
    total: Number(row.total || 0),
    pending: Number(row.pending || 0),
    completed: Number(row.completed || 0)
  };
}

module.exports = {
  create,
  findByIdForUser,
  listByUser,
  remove,
  summary,
  update
};
