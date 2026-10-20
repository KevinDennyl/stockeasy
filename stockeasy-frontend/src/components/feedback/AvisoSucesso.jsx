// ============================================================================
// src/components/feedback/AvisoSucesso.jsx
// Faixa de confirmação exibida no topo da página após uma ação bem-sucedida
// (ex.: "Produto cadastrado."). Some sozinha depois de alguns segundos e
// também pode ser dispensada manualmente.
// ============================================================================

import { useEffect, useRef } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function AvisoSucesso({ mensagem, onFechar, duracao = 6000 }) {
  // Ref para o timer não reiniciar caso a página re-renderize com um
  // novo onFechar (função recriada a cada render).
  const onFecharRef = useRef(onFechar);
  onFecharRef.current = onFechar;

  useEffect(() => {
    if (!mensagem) return undefined;
    const timer = setTimeout(() => onFecharRef.current?.(), duracao);
    return () => clearTimeout(timer);
  }, [mensagem, duracao]);

  if (!mensagem) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded-lg border border-moss/30 bg-moss-light px-4 py-3 text-sm text-moss-dark"
    >
      <span className="flex items-center gap-2">
        <CheckCircle2 size={18} aria-hidden="true" />
        {mensagem}
      </span>
      <button
        type="button"
        onClick={onFechar}
        aria-label="Dispensar aviso"
        className="btn-icone -my-1 text-moss-dark hover:bg-white/60"
      >
        <X size={16} />
      </button>
    </div>
  );
}
