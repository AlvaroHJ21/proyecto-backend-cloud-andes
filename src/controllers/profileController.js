const userService = require("../services/userService");

async function getProfile(req, res, next) {
  try {
    res.json({ user: await userService.getProfile(req.user.id) });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
