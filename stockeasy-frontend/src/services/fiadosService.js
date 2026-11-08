// ============================================================================
// src/services/fiadosService.js
// Chamadas da caderneta de fiados.
// ============================================================================

import api from './api';

// GET /api/fiados
export async function listarFiados() {
  const { data } = await api.get('/fiados');
  return data;
}

// POST /api/fiados  { nome_cliente, telefone, produto, valor, data_pedido, pago }
export async function criarFiado(payload) {
  const { data } = await api.post('/fiados', payload);
  return data;
}

// PUT /api/fiados/:id
export async function atualizarFiado(id, payload) {
  const { data } = await api.put(`/fiados/${id}`, payload);
  return data;
}

// PATCH /api/fiados/:id/pago  { pago: true | false }
export async function alterarPagamento(id, pago) {
  const { data } = await api.patch(`/fiados/${id}/pago`, { pago });
  return data;
}

// DELETE /api/fiados/:id
export async function excluirFiado(id) {
  const { data } = await api.delete(`/fiados/${id}`);
  return data;
}
