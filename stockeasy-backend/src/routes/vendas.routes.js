// ============================================================================
// src/routes/vendas.routes.js
// Rotas do módulo de Vendas.
// ============================================================================

const express = require('express');
const router = express.Router();
const vendasController = require('../controllers/vendas.controller');

// POST /api/vendas -> registra uma nova venda (com itens_venda em transação)
router.post('/vendas', vendasController.criar);

// GET /api/vendas -> lista o histórico de vendas
router.get('/vendas', vendasController.listar);

// GET /api/vendas/:id -> detalhes de uma venda, com os itens
router.get('/vendas/:id', vendasController.buscarPorId);

module.exports = router;
