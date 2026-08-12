const userModel = require("../models/userModel");

async function getProfile(userId) {
  return userModel.sanitizeUser(await userModel.findById(userId));
}

async function updateProfile(userId, data) {
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();

  if (!name || !email) {
    const error = new Error("Nombre y correo son obligatorios.");
    error.status = 400;
    throw error;
  }

  const existing = await userModel.findByEmail(email);
  if (existing && Number(existing.id) !== Number(userId)) {
    const error = new Error("El correo ya está en uso.");
    error.status = 409;
    throw error;
  }

  return userModel.updateProfile(userId, { name, email });
}

module.exports = {
  getProfile,
  updateProfile
};
