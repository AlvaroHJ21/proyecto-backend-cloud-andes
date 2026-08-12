require("dotenv").config();

function toBoolean(value) {
  return String(value || "").toLowerCase() === "true";
}

const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "taskflow-local-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  database: {
    host: process.env.DB_HOST || "",
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    ssl: toBoolean(process.env.DB_SSL),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10)
  },
  seedUser: {
    name: process.env.TASKFLOW_ADMIN_NAME || "Demo User",
    email: process.env.TASKFLOW_ADMIN_EMAIL || "demo@taskflow.local",
    password: process.env.TASKFLOW_ADMIN_PASSWORD || "TaskFlow123"
  }
};

module.exports = env;
