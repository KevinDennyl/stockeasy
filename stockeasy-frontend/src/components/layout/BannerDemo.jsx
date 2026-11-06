// ============================================================================
// src/components/layout/BannerDemo.jsx
// Faixa exibida APENAS no modo demonstração (VITE_MODO_DEMO=true). Deixa
// claro para quem visita que os dados são fictícios e ficam só no navegador,
// e oferece o botão para voltar aos dados de exemplo.
// ============================================================================

import { MODO_DEMO, restaurarDadosDemo } from '../../services/mockApi';

export default function BannerDemo() {
  if (!MODO_DEMO) return null;

  function restaurar() {
    const confirmou = window.confirm(
      'Restaurar os dados de exemplo? Tudo que você cadastrou neste navegador será apagado.'
    );
    if (!confirmou) return;
    restaurarDadosDemo();
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-amber-light px-4 py-2 text-xs text-amber-dark sm:px-6 sm:text-sm lg:px-8">
      <p>
        <strong className="font-semibold">Modo demonstração:</strong> os dados são fictícios e ficam salvos
        apenas neste navegador.
      </p>
      <button
        type="button"
        onClick={restaurar}
        className="rounded font-medium underline underline-offset-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
      >
        Restaurar dados de exemplo
      </button>
    </div>
  );
}
