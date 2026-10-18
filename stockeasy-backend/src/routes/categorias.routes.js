// ============================================================================
// src/routes/categorias.routes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categorias.controller');

router.get('/categorias', categoriasController.listar);
router.post('/categorias', categoriasController.criar);

module.exports = router;
