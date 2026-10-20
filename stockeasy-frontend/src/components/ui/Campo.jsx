// ============================================================================
// src/components/ui/Campo.jsx
// Envolve um campo de formulário (um único <input>, <select> ou <textarea>)
// com rótulo e mensagens. Injeta no campo o id, aria-invalid e
// aria-describedby, para leitores de tela anunciarem o erro/aviso/dica.
//
// Prioridade da mensagem exibida: erro > aviso > dica.
//   erro  -> vermelho: algo precisa ser corrigido para enviar;
//   aviso -> âmbar: atenção, mas não bloqueia (ex.: estoque insuficiente);
//   dica  -> cinza: ajuda neutra.
// ============================================================================

import { cloneElement } from 'react';

export default function Campo({
  id,
  label,
  opcional = false,
  erro,
  aviso,
  dica,
  className = '',
  children,
}) {
  const tipoMensagem = erro ? 'erro' : aviso ? 'aviso' : dica ? 'dica' : null;

  const controle = cloneElement(children, {
    id,
    'aria-invalid': erro ? true : undefined,
    'aria-describedby': tipoMensagem ? `${id}-${tipoMensagem}` : undefined,
  });

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {opcional && <span className="ml-1.5 font-normal text-ink-soft">(opcional)</span>}
      </label>

      {controle}

      {tipoMensagem === 'erro' && (
        <p id={`${id}-erro`} className="mt-1.5 text-xs text-clay-dark">
          {erro}
        </p>
      )}
      {tipoMensagem === 'aviso' && (
        <p id={`${id}-aviso`} className="mt-1.5 text-xs font-medium text-amber-dark">
          {aviso}
        </p>
      )}
      {tipoMensagem === 'dica' && (
        <p id={`${id}-dica`} className="mt-1.5 text-xs text-ink-soft">
          {dica}
        </p>
      )}
    </div>
  );
}
