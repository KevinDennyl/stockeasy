// ============================================================================
// src/middlewares/notFound.js
// ============================================================================

function notFound(req, res) {
  res.status(404).json({
    status: 'error',
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFound;
