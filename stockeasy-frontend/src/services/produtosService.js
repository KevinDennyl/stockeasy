// ============================================================================
// src/services/produtosService.js
// Chamadas relacionadas ao módulo de Produtos.
// ============================================================================

import api from './api';

// GET /api/produtos
export async function listarProdutos() {
  const { data } = await api.get('/produtos');
  return data;
}

// GET /api/produtos/alerta-estoque
export async function listarAlertaEstoque() {
  const { data } = await api.get('/produtos/alerta-estoque');
  return data;
}

// POST /api/produtos
export async function criarProduto(payload) {
  const { data } = await api.post('/produtos', payload);
  return data;
}

// PUT /api/produtos/:id  (atualização parcial)
export async function atualizarProduto(id, payload) {
  const { data } = await api.put(`/produtos/${id}`, payload);
  return data;
}

// DELETE /api/produtos/:id
export async function excluirProduto(id) {
  const { data } = await api.delete(`/produtos/${id}`);
  return data;
}
