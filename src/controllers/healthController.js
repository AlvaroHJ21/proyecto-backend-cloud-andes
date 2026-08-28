const { checkConnection } = require("../database/connection");

function health(req, res) {
  res.json({
    status: "ok",
    service: "taskflow-api-v2",
    timestamp: new Date().toISOString()
  });
}

async function databaseHealth(req, res) {
  try {
    await checkConnection();
    res.json({
      status: "ok",
      service: "taskflow-mysql-v2"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "taskflow-mysql-v2",
      code: error.code,
      message: error.message
    });
  }
}

module.exports = {
  databaseHealth,
  health
};
