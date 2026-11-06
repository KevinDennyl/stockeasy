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
    return <span className="text-xs text-ink-soft sm:text-sm">Carregando usuários...</span>;
  }

  if (erro) {
    return (
      <button
        type="button"
        onClick={recarregar}
        className="rounded text-right text-xs font-medium text-clay-dark underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss sm:text-sm"
        title={erro}
      >
        Usuários indisponíveis — tentar novamente
      </button>
    );
  }

  if (usuarios.length === 0) {
    return <span className="text-xs text-ink-soft sm:text-sm">Nenhum usuário cadastrado no banco</span>;
  }

  return (
    <>
      <label htmlFor="seletor-usuario" className="sr-only text-sm text-ink-soft sm:not-sr-only">
        Operador
      </label>
      <select
        id="seletor-usuario"
        className="input !w-auto min-w-0 max-w-[11rem] py-2 sm:min-w-[10rem] sm:max-w-none"
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
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss text-sm font-semibold text-white sm:flex"
        >
          {obterIniciais(usuarioAtivo.nome)}
        </div>
      )}
    </>
  );
}

export default function Header({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3 sm:px-6 lg:px-8 lg:py-5">
      <div className="min-w-0">
        <h1 className="truncate font-display text-xl font-semibold text-ink lg:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 hidden text-sm text-ink-soft sm:block">{subtitle}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <SeletorDeUsuario />
      </div>
    </header>
  );
}
