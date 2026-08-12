const express = require("express");
const authRoutes = require("./authRoutes");
const healthRoutes = require("./healthRoutes");
const profileRoutes = require("./profileRoutes");
const taskRoutes = require("./taskRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/profile", profileRoutes);
router.use("/tasks", taskRoutes);

module.exports = router;
