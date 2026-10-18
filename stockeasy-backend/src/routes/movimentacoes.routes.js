// ============================================================================
// src/routes/movimentacoes.routes.js
// Rotas do módulo de Movimentações manuais de Estoque.
// ============================================================================

const express = require('express');
const router = express.Router();
const movimentacoesController = require('../controllers/movimentacoes.controller');

// GET /api/movimentacoes -> lista o histórico de movimentações
router.get('/movimentacoes', movimentacoesController.listar);

// POST /api/movimentacoes -> registra entrada ou saída manual no estoque
router.post('/movimentacoes', movimentacoesController.criar);

module.exports = router;
