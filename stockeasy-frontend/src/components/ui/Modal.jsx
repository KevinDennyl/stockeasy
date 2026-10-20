// ============================================================================
// src/components/ui/Modal.jsx
// Janela modal base usada por todos os formulários e confirmações.
//
// Comportamentos de acessibilidade:
//  - role="dialog" + aria-modal + título associado (aria-labelledby);
//  - ao abrir, o foco vai para o elemento com [data-autofocus] ou para o
//    primeiro campo do formulário; ao fechar, volta para onde estava;
//  - Tab/Shift+Tab ficam "presos" dentro do modal;
//  - Esc fecha (exceto quando podeFechar = false, ex.: durante um envio);
//  - a rolagem da página de fundo fica travada enquanto o modal está aberto.
//
// Os modais são montados apenas quando estão abertos (a página decide), então
// o estado interno de cada formulário sempre começa limpo.
// ============================================================================

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const LARGURAS = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-4xl',
};

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  aberto = true,
  titulo,
  onFechar,
  podeFechar = true,
  largura = 'md',
  rodape,
  children,
}) {
  const tituloId = useId();
  const painelRef = useRef(null);

  // Guardamos os callbacks em refs para o efeito abaixo não reiniciar
  // (e roubar o foco) a cada nova renderização do formulário.
  const onFecharRef = useRef(onFechar);
  const podeFecharRef = useRef(podeFechar);
  onFecharRef.current = onFechar;
  podeFecharRef.current = podeFechar;

  useEffect(() => {
    if (!aberto) return undefined;

    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const painel = painelRef.current;
    const inicial =
      painel?.querySelector('[data-autofocus]') ||
      painel?.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])') ||
      painel?.querySelector(FOCAVEIS);
    inicial?.focus();

    function aoPressionarTecla(evento) {
      if (evento.key === 'Escape' && podeFecharRef.current) {
        evento.stopPropagation();
        onFecharRef.current?.();
        return;
      }

      if (evento.key !== 'Tab' || !painelRef.current) return;

      const focaveis = Array.from(painelRef.current.querySelectorAll(FOCAVEIS));
      if (focaveis.length === 0) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener('keydown', aoPressionarTecla);

    return () => {
      document.removeEventListener('keydown', aoPressionarTecla);
      document.body.style.overflow = overflowAnterior;
      elementoAnterior?.focus?.();
    };
  }, [aberto]);

  if (!aberto) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className={`flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-xl ${LARGURAS[largura]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <h2 id={tituloId} className="font-display text-lg font-semibold text-ink">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            disabled={!podeFechar}
            aria-label="Fechar"
            className="btn-icone -mr-2 -mt-1 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {rodape && <div className="border-t border-line px-6 py-4">{rodape}</div>}
      </div>
    </div>,
    document.body
  );
}
