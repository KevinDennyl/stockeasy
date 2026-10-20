// ============================================================================
// src/components/dashboard/AlertaEstoqueTable.jsx
// Lista os produtos com quantidade_estoque <= estoque_minimo.
// Cada linha tem uma barra lateral colorida indicando a severidade:
// estoque zerado (clay/crítico) vs. estoque baixo mas não zerado (amber).
// ============================================================================

import EstadoVazio from '../feedback/EstadoVazio';

export default function AlertaEstoqueTable({ produtos }) {
  if (produtos.length === 0) {
    return <EstadoVazio mensagem="Nenhum produto abaixo do estoque mínimo no momento." />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-ink-soft">
            <th className="py-3 pl-6 pr-4 font-medium">Produto</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Em estoque</th>
            <th className="px-4 py-3 font-medium">Mínimo</th>
            <th className="py-3 pl-4 pr-6 font-medium">Situação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {produtos.map((produto) => {
            const critico = produto.quantidade_estoque === 0;
            return (
              <tr key={produto.id} className="relative">
                <td className="py-3.5 pl-6 pr-4">
                  <span
                    className={`absolute left-0 top-0 h-full w-1 ${
                      critico ? 'bg-clay' : 'bg-amber'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-ink">{produto.nome}</span>
                </td>
                <td className="px-4 py-3.5 text-ink-soft">
                  {produto.categoria_nome || '—'}
                </td>
                <td className="px-4 py-3.5 text-ink">{produto.quantidade_estoque} {produto.unidade_medida}</td>
                <td className="px-4 py-3.5 text-ink-soft">{produto.estoque_minimo} {produto.unidade_medida}</td>
                <td className="py-3.5 pl-4 pr-6">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      critico ? 'bg-clay-light text-clay-dark' : 'bg-amber-light text-amber-dark'
                    }`}
                  >
                    {critico ? 'Estoque zerado' : 'Estoque baixo'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
