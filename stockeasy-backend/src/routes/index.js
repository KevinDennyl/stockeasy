// ============================================================================
// src/routes/index.js
// Ponto central que agrega todas as rotas da aplicação sob o prefixo /api.
// ============================================================================

const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const categoriasRoutes = require('./categorias.routes');
const produtosRoutes = require('./produtos.routes');
const movimentacoesRoutes = require('./movimentacoes.routes');
const vendasRoutes = require('./vendas.routes');
const dashboardRoutes = require('./dashboard.routes');
const usuariosRoutes = require('./usuarios.routes');

router.use(healthRoutes);
router.use(categoriasRoutes);
router.use(produtosRoutes);
router.use(movimentacoesRoutes);
router.use(vendasRoutes);
router.use(dashboardRoutes);
router.use(usuariosRoutes);

module.exports = router;
