// ============================================================================
// src/utils/usuarioStorage.js
// Gerencia qual usuário (operador) está ativo no sistema.
//
// Ordem de prioridade para descobrir o usuário ativo:
//   1. o id salvo no localStorage (escolha feita pelo operador no Header);
//   2. VITE_USUARIO_ID do .env (fallback opcional);
//   3. o primeiro usuário retornado pela API.
// Em todos os casos o id precisa existir na lista de usuários da API — um id
// "velho" (ex.: usuário removido do banco) é descartado automaticamente.
//
// Além do localStorage, mantemos o id ativo em memória. Isso permite que o
// interceptor do Axios (fora do React) saiba o usuário ativo de forma
// síncrona, inclusive quando ele veio de um fallback e não está salvo.
// ============================================================================

export const CHAVE_USUARIO = 'stockeasy_usuario_id';

const USUARIO_ID_ENV = (import.meta.env.VITE_USUARIO_ID || '').trim();

let usuarioAtivoEmMemoria = null;

// localStorage pode lançar exceção (modo privado do Safari, storage bloqueado
// pelo navegador, etc.). Nesses casos o sistema continua funcionando, só não
// lembra a escolha entre sessões.

/** Lê o id salvo no localStorage (ou null). */
export function lerUsuarioId() {
  try {
    return localStorage.getItem(CHAVE_USUARIO) || null;
  } catch {
    return null;
  }
}

/** Salva o id escolhido no localStorage. */
export function salvarUsuarioId(id) {
  try {
    localStorage.setItem(CHAVE_USUARIO, id);
  } catch {
    // sem persistência; o valor em memória continua valendo nesta sessão
  }
}

/** Remove o id salvo (ex.: quando o usuário não existe mais no banco). */
export function limparUsuarioId() {
  try {
    localStorage.removeItem(CHAVE_USUARIO);
  } catch {
    // ignora
  }
}

/** Define o usuário ativo em memória (usado pelo interceptor do Axios). */
export function definirUsuarioAtivo(id) {
  usuarioAtivoEmMemoria = id || null;
}

/**
 * Id do usuário ativo, de forma síncrona: memória -> localStorage -> .env.
 * Retorna null se nenhum estiver disponível (o primeiro usuário da API só é
 * conhecido depois que a lista é carregada — ver UsuarioContext).
 */
export function obterUsuarioIdAtivo() {
  return usuarioAtivoEmMemoria || lerUsuarioId() || USUARIO_ID_ENV || null;
}

/**
 * Escolhe o usuário ativo entre os cadastrados, seguindo a ordem de
 * prioridade descrita no topo do arquivo. Ids que não existem na lista são
 * ignorados (e o do localStorage, se for inválido, é limpo).
 */
export function resolverUsuarioAtivo(usuarios) {
  const existe = (id) => Boolean(id) && usuarios.some((u) => u.id === id);

  const salvo = lerUsuarioId();
  if (existe(salvo)) return salvo;
  if (salvo) limparUsuarioId();

  if (existe(USUARIO_ID_ENV)) return USUARIO_ID_ENV;

  return usuarios[0]?.id ?? null;
}
