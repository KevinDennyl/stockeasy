// ============================================================================
// src/routes/produtos.routes.js
// ATENÇÃO: "/produtos/alerta-estoque" precisa vir ANTES de "/produtos/:id".
// ============================================================================

const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtos.controller');

router.get('/produtos', produtosController.listar);
router.get('/produtos/alerta-estoque', produtosController.alertaEstoque);
router.get('/produtos/:id', produtosController.buscarPorId);
router.post('/produtos', produtosController.criar);
router.put('/produtos/:id', produtosController.atualizar);
router.delete('/produtos/:id', produtosController.deletar);

module.exports = router;
