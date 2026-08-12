const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const initDatabase = require("./database/init");
const routes = require("./routes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "taskflow-api" });
});
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`TaskFlow API running on port ${env.port}`);
});

initDatabase()
  .then(() => {
    console.log("TaskFlow MySQL database initialized.");
  })
  .catch((error) => {
    const causeCode = error.cause?.code ? ` (${error.cause.code})` : "";
    console.warn(`[database] ${error.message}${causeCode}`);
  });
