// ============================================================================
// src/components/ui/ConfirmDialog.jsx
// Diálogo de confirmação (ex.: excluir produto). O foco inicial fica no
// botão "Cancelar" — em ações destrutivas, o caminho seguro é o padrão.
// ============================================================================

import Modal from './Modal';
import EstadoErro from '../feedback/EstadoErro';

export default function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCarregando = 'Aguarde...',
  perigo = false,
  carregando = false,
  erro,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal
      aberto={aberto}
      titulo={titulo}
      onFechar={onCancelar}
      podeFechar={!carregando}
      largura="sm"
      rodape={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            data-autofocus
            className="btn btn-secondary"
            onClick={onCancelar}
            disabled={carregando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${perigo ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? textoCarregando : textoConfirmar}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-ink-soft">{mensagem}</p>
      {erro && (
        <div className="mt-4">
          <EstadoErro mensagem={erro} />
        </div>
      )}
    </Modal>
  );
}
