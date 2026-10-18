// ============================================================================
// src/routes/dashboard.routes.js
// Rotas do módulo de Dashboard.
// ============================================================================

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// GET /api/dashboard/resumo -> métricas gerais do negócio
router.get('/dashboard/resumo', dashboardController.resumo);

module.exports = router;
