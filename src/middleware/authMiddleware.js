const authService = require("../services/authService");
const userModel = require("../models/userModel");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token requerido." });
  }

  let payload;

  try {
    payload = authService.verifyToken(token);
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado." });
  }

  try {
    const user = await userModel.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado." });
    }

    req.user = userModel.sanitizeUser(user);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAuth;
