// ============================================================================
// src/controllers/health.controller.js
// Confirma que a API está no ar e que a conexão com o PostgreSQL funciona.
// ============================================================================

const db = require('../config/database');

async function checkHealth(req, res) {
  try {
    const result = await db.query('SELECT NOW() AS horario_servidor');

    return res.status(200).json({
      status: 'ok',
      api: 'online',
      database: 'connected',
      horario_servidor: result.rows[0].horario_servidor,
    });
  } catch (error) {
    console.error('Falha no health check ao consultar o banco:', error.message);

    return res.status(503).json({
      status: 'error',
      api: 'online',
      database: 'disconnected',
      message: 'Não foi possível conectar ao PostgreSQL. Verifique as variáveis de ambiente e se o banco está ativo.',
    });
  }
}

module.exports = { checkHealth };
