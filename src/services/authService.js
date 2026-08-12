const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userModel = require("../models/userModel");

async function login(email, password) {
  const user = await userModel.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    const error = new Error("Correo o contraseña inválidos.");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  return {
    token,
    user: userModel.sanitizeUser(user)
  };
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = {
  login,
  verifyToken
};
