const taskModel = require("../models/taskModel");

const allowedStatuses = ["pending", "completed"];

function validateTask(data) {
  const title = String(data.title || "").trim();
  const description = String(data.description || "").trim();
  const status = data.status || "pending";

  if (!title) {
    const error = new Error("El título de la tarea es obligatorio.");
    error.status = 400;
    throw error;
  }

  if (!allowedStatuses.includes(status)) {
    const error = new Error("El estado de la tarea no es válido.");
    error.status = 400;
    throw error;
  }

  return { title, description, status };
}

async function list(userId) {
  return taskModel.listByUser(userId);
}

async function create(userId, data) {
  return taskModel.create(userId, validateTask(data));
}

async function update(userId, taskId, data) {
  const task = await taskModel.update(
    Number(taskId),
    userId,
    validateTask(data)
  );
  if (!task) {
    const error = new Error("Tarea no encontrada.");
    error.status = 404;
    throw error;
  }
  return task;
}

async function remove(userId, taskId) {
  const deleted = await taskModel.remove(Number(taskId), userId);
  if (!deleted) {
    const error = new Error("Tarea no encontrada.");
    error.status = 404;
    throw error;
  }
}

async function summary(userId) {
  return taskModel.summary(userId);
}

module.exports = {
  create,
  list,
  remove,
  summary,
  update
};
