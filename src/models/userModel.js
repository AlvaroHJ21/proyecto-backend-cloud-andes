const { execute } = require("../database/connection");

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

async function findByEmail(email) {
  const [rows] = await execute("SELECT * FROM users WHERE email = ? LIMIT 1", [
    email
  ]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await execute("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function updateProfile(id, data) {
  await execute("UPDATE users SET name = ?, email = ? WHERE id = ?", [
    data.name,
    data.email,
    id
  ]);

  return sanitizeUser(await findById(id));
}

module.exports = {
  findByEmail,
  findById,
  sanitizeUser,
  updateProfile
};
