// ============================================================================
// src/services/movimentacoesService.js
// Chamadas relacionadas ao módulo de Movimentações de Estoque.
// ============================================================================

import api from './api';

// GET /api/movimentacoes
export async function listarMovimentacoes() {
  const { data } = await api.get('/movimentacoes');
  return data;
}

// POST /api/movimentacoes  { produto_id, tipo, quantidade, observacao? }
export async function criarMovimentacao(payload) {
  const { data } = await api.post('/movimentacoes', payload);
  return data;
}
