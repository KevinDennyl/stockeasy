// ============================================================================
// src/pages/Movimentacoes.jsx
// Histórico de movimentações de estoque + registro de novas movimentações.
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Plus } from 'lucide-react';
import { listarMovimentacoes } from '../services/movimentacoesService';
import { listarProdutos } from '../services/produtosService';
import MovimentacaoFormModal from '../components/movimentacoes/MovimentacaoFormModal';
import AvisoSucesso from '../components/feedback/AvisoSucesso';
import EstadoCarregando from '../components/feedback/EstadoCarregando';
import EstadoErro from '../components/feedback/EstadoErro';
import EstadoVazio from '../components/feedback/EstadoVazio';
import { formatarData } from '../utils/formatters';
import { extrairMensagemErro } from '../utils/erros';

export default function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    try {
      // Produtos são recarregados junto: o formulário mostra o estoque atual
      const [dadosMovimentacoes, dadosProdutos] = await Promise.all([
        listarMovimentacoes(),
        listarProdutos(),
      ]);
      setMovimentacoes(dadosMovimentacoes);
      setProdutos(dadosProdutos);
      setErro(null);
    } catch (err) {
      setErro(extrairMensagemErro(err, 'Não foi possível carregar as movimentações.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function aoSalvar() {
    setModalAberto(false);
    setAviso('Movimentação registrada. O estoque do produto já foi atualizado.');
    carregar();
  }

  if (carregando) return <EstadoCarregando texto="Carregando movimentações..." />;
  if (erro) return <EstadoErro mensagem={erro} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          Entradas e saídas manuais. As vendas baixam o estoque automaticamente.
        </p>
        <button type="button" className="btn btn-primary shrink-0" onClick={() => setModalAberto(true)}>
          <Plus size={16} aria-hidden="true" />
          Nova movimentação
        </button>
      </div>

      <AvisoSucesso mensagem={aviso} onFechar={() => setAviso(null)} />

      {movimentacoes.length === 0 ? (
        <EstadoVazio mensagem="Nenhuma movimentação de estoque registrada ainda." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-soft">
                <th className="py-3 pl-6 pr-4 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Quantidade</th>
                <th className="px-4 py-3 font-medium">Motivo</th>
                <th className="py-3 pl-4 pr-6 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {movimentacoes.map((mov) => {
                const entrada = mov.tipo === 'ENTRADA';
                return (
                  <tr key={mov.id}>
                    <td className="py-3.5 pl-6 pr-4 font-medium text-ink">{mov.produto_nome}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                          entrada ? 'text-moss' : 'text-clay'
                        }`}
                      >
                        {entrada ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                        {entrada ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-ink">{mov.quantidade}</td>
                    <td className="px-4 py-3.5 text-ink-soft">{mov.observacao || '—'}</td>
                    <td className="py-3.5 pl-4 pr-6 text-ink-soft">{formatarData(mov.data_movimentacao)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <MovimentacaoFormModal
          produtos={produtos}
          onFechar={() => setModalAberto(false)}
          onSalvo={aoSalvar}
        />
      )}
    </div>
  );
}
