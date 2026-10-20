// ============================================================================
// src/components/feedback/EstadoVazio.jsx
// Mensagem exibida quando uma listagem não retorna nenhum registro.
// ============================================================================

export default function EstadoVazio({ mensagem }) {
  return (
    <div className="rounded-lg border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
      {mensagem}
    </div>
  );
}
