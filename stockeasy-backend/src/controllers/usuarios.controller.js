// ============================================================================
// src/controllers/usuarios.controller.js
// Módulo de Usuários (somente leitura por enquanto).
//
// SEGURANÇA: a listagem devolve apenas "id" e "nome". Nunca expor
// "senha_hash" (nem "email") em endpoints sem autenticação. Quando o login
// for implementado, esta rota deve passar a exigir um usuário autenticado.
// ============================================================================

const db = require('../config/database');

// GET /api/usuarios -> lista os usuários cadastrados (para o seletor de operador)
async function listar(req, res) {
  try {
    const result = await db.query('SELECT id, nome FROM usuarios ORDER BY nome ASC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno ao listar usuários.',
    });
  }
}

module.exports = { listar };
