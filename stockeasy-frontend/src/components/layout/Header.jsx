// ============================================================================
// src/components/layout/Header.jsx
// Cabeçalho superior: título da página + seletor do operador ativo.
//
// O <select> lista os usuários de GET /api/usuarios. Ao trocar a opção, o
// UsuarioContext salva a escolha no localStorage e atualiza o sistema todo
// na hora (inclusive o checkout de vendas), sem recarregar a página.
// ============================================================================

import { useUsuario } from '../../contexts/UsuarioContext';

function obterIniciais(nome) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

function SeletorDeUsuario() {
  const { usuarios, usuarioAtivo, carregando, erro, trocarUsuario, recarregar } = useUsuario();

  if (carregando) {
    return <span className="text-sm text-ink-soft">Carregando usuários...</span>;
  }

  if (erro) {
    return (
      <button
        type="button"
        onClick={recarregar}
        className="rounded text-sm font-medium text-clay-dark underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
        title={erro}
      >
        Usuários indisponíveis — tentar novamente
      </button>
    );
  }

  if (usuarios.length === 0) {
    return <span className="text-sm text-ink-soft">Nenhum usuário cadastrado no banco</span>;
  }

  return (
    <>
      <label htmlFor="seletor-usuario" className="sr-only text-sm text-ink-soft sm:not-sr-only">
        Operador
      </label>
      <select
        id="seletor-usuario"
        className="input !w-auto min-w-[10rem] py-2"
        value={usuarioAtivo?.id ?? ''}
        onChange={(evento) => trocarUsuario(evento.target.value)}
      >
        {usuarios.map((usuario) => (
          <option key={usuario.id} value={usuario.id}>
            {usuario.nome}
          </option>
        ))}
      </select>
      {usuarioAtivo && (
        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss text-sm font-semibold text-white"
        >
          {obterIniciais(usuarioAtivo.nome)}
        </div>
      )}
    </>
  );
}

export default function Header({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-paper px-8 py-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <SeletorDeUsuario />
      </div>
    </header>
  );
}
