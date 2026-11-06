// ============================================================================
// src/components/dashboard/MetricStrip.jsx
// As 4 métricas de /api/dashboard/resumo numa única faixa com divisórias.
//
// Responsivo: 2x2 no celular e 4 em linha nas telas grandes. As divisórias
// são feitas com "gap-px" sobre um fundo cinza (cada célula é branca), o que
// desenha as linhas corretamente em qualquer número de colunas — ao contrário
// de divide-x/divide-y, que falham quando a grade quebra em linhas.
// ============================================================================

import { Package, Wallet, TrendingUp, TriangleAlert } from 'lucide-react';
import { formatarMoeda } from '../../utils/formatters';

export default function MetricStrip({ resumo }) {
  const metrics = [
    { label: 'Total de produtos', valor: resumo.total_produtos, icon: Package, tone: 'text-ink' },
    { label: 'Valor em estoque', valor: formatarMoeda(resumo.valor_total_estoque), icon: Wallet, tone: 'text-ink' },
    { label: 'Vendas totais', valor: formatarMoeda(resumo.total_vendas_valor), icon: TrendingUp, tone: 'text-moss' },
    {
      label: 'Estoque baixo',
      valor: resumo.contagem_produtos_estoque_baixo,
      icon: TriangleAlert,
      tone: resumo.contagem_produtos_estoque_baixo > 0 ? 'text-amber-dark' : 'text-ink',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
      {metrics.map(({ label, valor, icon: Icon, tone }) => (
        <div key={label} className="flex min-w-0 items-start justify-between gap-2 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="text-sm text-ink-soft">{label}</p>
            <p className={`mt-1.5 break-words font-display text-xl font-semibold sm:mt-2 sm:text-2xl lg:text-3xl ${tone}`}>
              {valor}
            </p>
          </div>
          <Icon size={20} className="mt-1 hidden shrink-0 text-ink-soft/50 sm:block" strokeWidth={1.75} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
