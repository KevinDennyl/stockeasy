// ============================================================================
// src/routes/usuarios.routes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// GET /api/usuarios -> lista id e nome dos usuários cadastrados
router.get('/usuarios', usuariosController.listar);

module.exports = router;
