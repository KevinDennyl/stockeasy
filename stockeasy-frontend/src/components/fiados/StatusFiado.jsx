// ============================================================================
// src/components/fiados/StatusFiado.jsx
// Situação do fiado: bolinha colorida + texto.
//   Pendente -> bolinha vermelho-alaranjado (terracota)
//   Pago     -> bolinha verde
// O texto sempre acompanha a bolinha, para quem não distingue as cores.
// ============================================================================

export default function StatusFiado({ pago }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${pago ? 'bg-moss' : 'bg-clay'}`}
      />
      {pago ? 'Pago' : 'Pendente'}
    </span>
  );
}
