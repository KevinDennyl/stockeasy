// ============================================================================
// src/pages/Vendas.jsx
// Histórico de vendas + checkout de nova venda.
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { listarVendas } from '../services/vendasService';
import NovaVendaModal from '../components/vendas/NovaVendaModal';
import AvisoSucesso from '../components/feedback/AvisoSucesso';
import EstadoCarregando from '../components/feedback/EstadoCarregando';
import EstadoErro from '../components/feedback/EstadoErro';
import EstadoVazio from '../components/feedback/EstadoVazio';
import { formatarData, formatarMoeda } from '../utils/formatters';
import { extrairMensagemErro } from '../utils/erros';
import { useUsuario } from '../contexts/UsuarioContext';

export default function Vendas() {
  const { usuarioAtivo } = useUsuario();
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setVendas(await listarVendas());
      setErro(null);
    } catch (err) {
      setErro(extrairMensagemErro(err, 'Não foi possível carregar as vendas.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function aoFinalizarVenda(venda) {
    setModalAberto(false);
    const vendedor = usuarioAtivo ? ` em nome de ${usuarioAtivo.nome}` : '';
    setAviso(`Venda finalizada${vendedor}: ${formatarMoeda(venda.valor_total)}. O estoque dos produtos já foi atualizado.`);
    carregar();
  }

  if (carregando) return <EstadoCarregando texto="Carregando vendas..." />;
  if (erro) return <EstadoErro mensagem={erro} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          {vendas.length === 1 ? '1 venda registrada' : `${vendas.length} vendas registradas`}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setModalAberto(true)}>
          <Plus size={16} aria-hidden="true" />
          Nova venda
        </button>
      </div>

      <AvisoSucesso mensagem={aviso} onFechar={() => setAviso(null)} />

      {vendas.length === 0 ? (
        <EstadoVazio mensagem="Nenhuma venda registrada ainda. Use o botão “Nova venda” para fazer a primeira." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-soft">
                <th className="py-3 pl-6 pr-4 font-medium">Vendedor</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="py-3 pl-4 pr-6 text-right font-medium">Valor total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {vendas.map((venda) => (
                <tr key={venda.id}>
                  <td className="py-3.5 pl-6 pr-4 font-medium text-ink">{venda.usuario_nome}</td>
                  <td className="px-4 py-3.5 text-ink-soft">{formatarData(venda.data_venda)}</td>
                  <td className="py-3.5 pl-4 pr-6 text-right font-medium text-moss">
                    {formatarMoeda(venda.valor_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <NovaVendaModal onFechar={() => setModalAberto(false)} onSalvo={aoFinalizarVenda} />
      )}
    </div>
  );
}
