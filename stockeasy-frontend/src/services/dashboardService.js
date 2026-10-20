// ============================================================================
// src/services/dashboardService.js
// Chamadas relacionadas ao módulo de Dashboard.
// ============================================================================

import api from './api';

// GET /api/dashboard/resumo
export async function buscarResumo() {
  const { data } = await api.get('/dashboard/resumo');
  return data;
}
