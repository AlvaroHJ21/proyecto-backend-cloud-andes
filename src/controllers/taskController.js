const taskService = require("../services/taskService");

async function listTasks(req, res, next) {
  try {
    const [tasks, summary] = await Promise.all([
      taskService.list(req.user.id),
      taskService.summary(req.user.id)
    ]);
    res.json({ tasks, summary });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const task = await taskService.create(req.user.id, req.body);
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await taskService.update(req.user.id, req.params.id, req.body);
    res.json({ task });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    await taskService.remove(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTask,
  deleteTask,
  listTasks,
  updateTask
};
