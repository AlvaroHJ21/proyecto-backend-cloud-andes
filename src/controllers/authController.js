const authService = require("../services/authService");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(
      String(email || "").trim().toLowerCase(),
      String(password || "")
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  login,
  me
};
