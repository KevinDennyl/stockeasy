// ============================================================================
// src/services/api.js
// Instância central do Axios usada por todos os serviços do front-end.
// A URL base vem de VITE_API_URL, com fallback para o back-end local.
// ============================================================================

import axios from 'axios';
import { obterUsuarioIdAtivo } from '../utils/usuarioStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ----------------------------------------------------------------------------
// Interceptor de REQUISIÇÃO: injeta o usuário ativo (operador) automaticamente.
//
//  1. Envia o cabeçalho "X-Usuario-Id" em todas as chamadas — útil para
//     auditoria no back-end (o back-end atual ainda não o utiliza).
//  2. Rede de segurança: se um POST /vendas chegar sem "usuario_id" no corpo,
//     preenche com o operador ativo. Normalmente o checkout já envia o id
//     explicitamente; isto evita vendas "sem dono" caso alguma tela esqueça.
// ----------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const usuarioId = obterUsuarioIdAtivo();

  if (usuarioId) {
    config.headers['X-Usuario-Id'] = usuarioId;

    const ehCriacaoDeVenda = config.method === 'post' && config.url === '/vendas';
    if (ehCriacaoDeVenda && config.data && typeof config.data === 'object' && !config.data.usuario_id) {
      config.data = { ...config.data, usuario_id: usuarioId };
    }
  }

  return config;
});

// Interceptor de resposta: centraliza o log de erros de rede/API.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensagem =
      error.response?.data?.message ||
      error.message ||
      'Erro inesperado ao comunicar com a API.';

    console.error('Erro na chamada à API:', mensagem);
    return Promise.reject(error);
  }
);

export default api;
