// ============================================================================
// src/contexts/UsuarioContext.jsx
// Fonte única da verdade sobre QUEM está operando o sistema.
//
// - Ao iniciar, busca GET /api/usuarios e decide o usuário ativo
//   (localStorage -> VITE_USUARIO_ID -> primeiro da lista).
// - trocarUsuario(id) atualiza o estado, o localStorage e a memória do
//   interceptor do Axios imediatamente — sem recarregar a página.
// - Sincroniza abas: se o operador trocar de usuário em uma aba, as outras
//   abas abertas acompanham. Isso evita vender "em nome" de alguém que não é
//   mais o operador atual só porque uma aba ficou desatualizada.
// ============================================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { listarUsuarios } from '../services/usuariosService';
import { extrairMensagemErro } from '../utils/erros';
import {
  CHAVE_USUARIO,
  definirUsuarioAtivo,
  resolverUsuarioAtivo,
  salvarUsuarioId,
} from '../utils/usuarioStorage';

const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Ref com a lista atual, para o listener de "storage" (que vive fora do
  // ciclo de renderização) sempre validar contra dados atualizados.
  const usuariosRef = useRef([]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const lista = await listarUsuarios();
      usuariosRef.current = lista;
      setUsuarios(lista);

      const ativo = resolverUsuarioAtivo(lista);
      definirUsuarioAtivo(ativo);
      setUsuarioId(ativo);
    } catch (err) {
      setErro(extrairMensagemErro(err, 'Não foi possível carregar a lista de usuários.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Troca de usuário feita em OUTRA aba do navegador
  useEffect(() => {
    function aoMudarStorage(evento) {
      if (evento.key !== CHAVE_USUARIO || !evento.newValue) return;
      if (!usuariosRef.current.some((u) => u.id === evento.newValue)) return;
      definirUsuarioAtivo(evento.newValue);
      setUsuarioId(evento.newValue);
    }

    window.addEventListener('storage', aoMudarStorage);
    return () => window.removeEventListener('storage', aoMudarStorage);
  }, []);

  const trocarUsuario = useCallback((novoId) => {
    if (!usuariosRef.current.some((u) => u.id === novoId)) return;
    salvarUsuarioId(novoId);
    definirUsuarioAtivo(novoId);
    setUsuarioId(novoId);
  }, []);

  const valor = useMemo(
    () => ({
      usuarios,
      usuarioId,
      usuarioAtivo: usuarios.find((u) => u.id === usuarioId) ?? null,
      carregando,
      erro,
      trocarUsuario,
      recarregar: carregar,
    }),
    [usuarios, usuarioId, carregando, erro, trocarUsuario, carregar]
  );

  return <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) {
    throw new Error('useUsuario precisa ser usado dentro de <UsuarioProvider>.');
  }
  return contexto;
}
