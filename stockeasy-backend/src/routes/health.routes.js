// ============================================================================
// src/routes/health.routes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const { checkHealth } = require('../controllers/health.controller');

router.get('/health', checkHealth);

module.exports = router;
