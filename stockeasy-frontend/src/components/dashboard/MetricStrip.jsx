// ============================================================================
// src/components/dashboard/MetricStrip.jsx
// Exibe as 4 métricas de /api/dashboard/resumo como uma única faixa com
// divisórias internas, em vez de 4 cards separados com sombra repetida —
// reforça que são facetas de um mesmo resumo, não widgets independentes.
// ============================================================================

import { Package, Wallet, TrendingUp, TriangleAlert } from 'lucide-react';
import { formatarMoeda } from '../../utils/formatters';

export default function MetricStrip({ resumo }) {
  const metrics = [
    {
      label: 'Total de produtos',
      valor: resumo.total_produtos,
      icon: Package,
      tone: 'text-ink',
    },
    {
      label: 'Valor em estoque',
      valor: formatarMoeda(resumo.valor_total_estoque),
      icon: Wallet,
      tone: 'text-ink',
    },
    {
      label: 'Vendas totais',
      valor: formatarMoeda(resumo.total_vendas_valor),
      icon: TrendingUp,
      tone: 'text-moss',
    },
    {
      label: 'Estoque baixo',
      valor: resumo.contagem_produtos_estoque_baixo,
      icon: TriangleAlert,
      tone: resumo.contagem_produtos_estoque_baixo > 0 ? 'text-amber' : 'text-ink',
    },
  ];

  return (
    <div className="grid grid-cols-1 divide-y divide-line rounded-xl border border-line bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {metrics.map(({ label, valor, icon: Icon, tone }) => (
        <div key={label} className="flex items-start justify-between gap-3 px-6 py-5">
          <div>
            <p className="text-sm text-ink-soft">{label}</p>
            <p className={`mt-2 font-display text-3xl font-semibold ${tone}`}>{valor}</p>
          </div>
          <Icon size={20} className="mt-1 text-ink-soft/50" strokeWidth={1.75} />
        </div>
      ))}
    </div>
  );
}
