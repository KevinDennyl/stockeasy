// ============================================================================
// src/services/usuariosService.js
// Chamadas relacionadas ao módulo de Usuários.
// ============================================================================

import api from './api';

// GET /api/usuarios -> [{ id, nome }]
export async function listarUsuarios() {
  const { data } = await api.get('/usuarios');
  return data;
}
