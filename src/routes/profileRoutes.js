const express = require("express");
const profileController = require("../controllers/profileController");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, profileController.getProfile);
router.put("/", requireAuth, profileController.updateProfile);

module.exports = router;
