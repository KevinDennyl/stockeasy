// ============================================================================
// src/components/feedback/EstadoCarregando.jsx
// Mensagem simples exibida enquanto uma requisição está em andamento.
// ============================================================================

export default function EstadoCarregando({ texto = 'Carregando...' }) {
  return (
    <div className="flex items-center gap-2 py-10 text-sm text-ink-soft">
      <span className="h-2 w-2 animate-pulse rounded-full bg-moss" />
      {texto}
    </div>
  );
}
