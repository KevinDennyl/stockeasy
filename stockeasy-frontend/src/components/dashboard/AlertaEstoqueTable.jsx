// ============================================================================
// src/components/dashboard/AlertaEstoqueTable.jsx
// Produtos com quantidade_estoque <= estoque_minimo.
//
// Telas grandes (>= 1024px): tabela. Celular/tablet: lista de cartões — uma
// tabela com 5 colunas não cabe em 360px sem rolar para o lado.
// A cor da barra lateral indica a severidade: estoque zerado (terracota) ou
// baixo (âmbar). A informação também aparece em texto, nunca só por cor.
// ============================================================================

import EstadoVazio from '../feedback/EstadoVazio';

function Situacao({ critico }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        critico ? 'bg-clay-light text-clay-dark' : 'bg-amber-light text-amber-dark'
      }`}
    >
      {critico ? 'Estoque zerado' : 'Estoque baixo'}
    </span>
  );
}

export default function AlertaEstoqueTable({ produtos }) {
  if (produtos.length === 0) {
    return <EstadoVazio mensagem="Nenhum produto abaixo do estoque mínimo no momento." />;
  }

  return (
    <>
      {/* Tabela: telas grandes */}
      <div className="hidden overflow-hidden rounded-xl border border-line bg-white lg:block">
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
                      className={`absolute left-0 top-0 h-full w-1 ${critico ? 'bg-clay' : 'bg-amber'}`}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-ink">{produto.nome}</span>
                  </td>
                  <td className="px-4 py-3.5 text-ink-soft">{produto.categoria_nome || '—'}</td>
                  <td className="px-4 py-3.5 text-ink">
                    {produto.quantidade_estoque} {produto.unidade_medida}
                  </td>
                  <td className="px-4 py-3.5 text-ink-soft">
                    {produto.estoque_minimo} {produto.unidade_medida}
                  </td>
                  <td className="py-3.5 pl-4 pr-6">
                    <Situacao critico={critico} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cartões: celular e tablet */}
      <ul className="space-y-3 lg:hidden">
        {produtos.map((produto) => {
          const critico = produto.quantidade_estoque === 0;
          return (
            <li
              key={produto.id}
              className={`overflow-hidden rounded-xl border border-line border-l-4 bg-white p-4 ${
                critico ? 'border-l-clay' : 'border-l-amber'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{produto.nome}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{produto.categoria_nome || 'Sem categoria'}</p>
                </div>
                <Situacao critico={critico} />
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                Em estoque:{' '}
                <strong className="font-medium text-ink">
                  {produto.quantidade_estoque} {produto.unidade_medida}
                </strong>{' '}
                · Mínimo: {produto.estoque_minimo} {produto.unidade_medida}
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
