// ============================================================================
// src/services/categoriasService.js
// Chamadas relacionadas ao módulo de Categorias.
// ============================================================================

import api from './api';

// GET /api/categorias
export async function listarCategorias() {
  const { data } = await api.get('/categorias');
  return data;
}

// POST /api/categorias  { nome, descricao? }
export async function criarCategoria(payload) {
  const { data } = await api.post('/categorias', payload);
  return data;
}
