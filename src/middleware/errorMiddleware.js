function notFound(req, res) {
  res.status(404).json({ message: "Ruta no encontrada." });
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const message = status >= 500 && !error.expose
    ? "Error interno del servidor."
    : error.message;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    message,
    ...(error.code ? { code: error.code } : {})
  });
}

module.exports = {
  errorHandler,
  notFound
};
