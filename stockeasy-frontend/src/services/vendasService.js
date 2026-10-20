// ============================================================================
// src/services/vendasService.js
// Chamadas relacionadas ao módulo de Vendas.
// ============================================================================

import api from './api';

// GET /api/vendas
export async function listarVendas() {
  const { data } = await api.get('/vendas');
  return data;
}

// POST /api/vendas  { usuario_id, itens: [{ produto_id, quantidade, preco_unitario }] }
// O back-end roda tudo em uma transação: se um item falhar (ex.: estoque
// insuficiente), a venda inteira é desfeita.
export async function criarVenda(payload) {
  const { data } = await api.post('/vendas', payload);
  return data;
}
