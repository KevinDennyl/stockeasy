// ============================================================================
// src/pages/Fiados.jsx
// Caderneta de fiados: pedidos vendidos para o cliente pagar depois.
//
// - Resumo no topo: quanto falta receber e quanto já foi recebido.
// - Filtro por situação (Pendentes / Pagos / Todos) e busca por nome.
// - Pendentes primeiro; um toque marca como pago (e dá para desfazer).
// - Telefone clicável: no celular, um toque liga para o cliente.
// - Tabela em telas grandes, cartões em celular/tablet.
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Pencil, Phone, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import {
  alterarPagamento,
  excluirFiado,
  listarFiados,
} from '../services/fiadosService';
import FiadoFormModal from '../components/fiados/FiadoFormModal';
import StatusFiado from '../components/fiados/StatusFiado';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import AvisoSucesso from '../components/feedback/AvisoSucesso';
import EstadoCarregando from '../components/feedback/EstadoCarregando';
import EstadoErro from '../components/feedback/EstadoErro';
import EstadoVazio from '../components/feedback/EstadoVazio';
import { formatarDataCurta, formatarDataISO, formatarMoeda } from '../utils/formatters';
import { formatarTelefone, linkDeLigacao } from '../utils/telefone';
import { extrairMensagemErro } from '../utils/erros';

const FILTROS = [
  { id: 'pendentes', rotulo: 'Pendentes' },
  { id: 'pagos', rotulo: 'Pagos' },
  { id: 'todos', rotulo: 'Todos' },
];

// Para a busca ignorar maiúsculas e acentos ("graca" encontra "Graça")
const simplificar = (texto) =>
  String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function LinkTelefone({ telefone, className = '' }) {
  return (
    <a
      href={linkDeLigacao(telefone)}
      className={`inline-flex items-center gap-1.5 rounded font-medium text-moss hover:text-moss-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-moss ${className}`}
      aria-label={`Ligar para ${formatarTelefone(telefone)}`}
    >
      <Phone size={14} aria-hidden="true" />
      {formatarTelefone(telefone)}
    </a>
  );
}

// Botão de marcar como pago / desfazer (usado na tabela e nos cartões).
// Fica FORA da página de propósito: um componente declarado dentro de outro é
// recriado a cada atualização, o que faz o botão piscar e perder o foco.
function BotaoPagamento({ fiado, ocupado, onAlterar, className = '' }) {
  return fiado.pago ? (
    <button
      type="button"
      className={`btn btn-secondary ${className}`}
      onClick={() => onAlterar(fiado, false)}
      disabled={ocupado}
    >
      <RotateCcw size={16} aria-hidden="true" />
      {ocupado ? 'Salvando...' : 'Desfazer pagamento'}
    </button>
  ) : (
    <button
      type="button"
      className={`btn btn-primary ${className}`}
      onClick={() => onAlterar(fiado, true)}
      disabled={ocupado}
    >
      <Check size={16} aria-hidden="true" />
      {ocupado ? 'Salvando...' : 'Marcar como pago'}
    </button>
  );
}

export default function Fiados() {
  const [fiados, setFiados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  const [filtro, setFiltro] = useState('pendentes');
  const [busca, setBusca] = useState('');

  // modal === null -> fechado | { fiado: null } -> novo | { fiado } -> editar
  const [modal, setModal] = useState(null);
  const [atualizandoId, setAtualizandoId] = useState(null);

  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setFiados(await listarFiados());
      setErro(null);
    } catch (err) {
      setErro(extrairMensagemErro(err, 'Não foi possível carregar os fiados.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const resumo = useMemo(() => {
    const pendentes = fiados.filter((f) => !f.pago);
    const pagos = fiados.filter((f) => f.pago);
    const soma = (lista) => lista.reduce((total, f) => total + Number(f.valor), 0);
    return {
      qtdPendentes: pendentes.length,
      qtdPagos: pagos.length,
      totalPendente: soma(pendentes),
      totalPago: soma(pagos),
    };
  }, [fiados]);

  const visiveis = useMemo(() => {
    const termo = simplificar(busca);
    return fiados.filter((f) => {
      const passaFiltro = filtro === 'todos' || (filtro === 'pagos' ? f.pago : !f.pago);
      return passaFiltro && (termo === '' || simplificar(f.nome_cliente).includes(termo));
    });
  }, [fiados, filtro, busca]);

  function contagem(id) {
    if (id === 'pendentes') return resumo.qtdPendentes;
    if (id === 'pagos') return resumo.qtdPagos;
    return fiados.length;
  }

  function aoSalvar(_fiado, modo) {
    setModal(null);
    setErroAcao(null);
    setAviso(modo === 'criado' ? 'Fiado registrado.' : 'Alterações salvas.');
    carregar();
  }

  async function marcarPagamento(fiado, pago) {
    setAtualizandoId(fiado.id);
    setErroAcao(null);
    try {
      await alterarPagamento(fiado.id, pago);
      setAviso(
        pago
          ? `Pedido de ${fiado.nome_cliente} marcado como pago.`
          : `Pedido de ${fiado.nome_cliente} voltou para pendente.`
      );
      await carregar();
    } catch (err) {
      setErroAcao(extrairMensagemErro(err, 'Não foi possível atualizar o pagamento. Tente novamente.'));
    } finally {
      setAtualizandoId(null);
    }
  }

  function pedirExclusao(fiado) {
    setErroExclusao(null);
    setParaExcluir(fiado);
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await excluirFiado(paraExcluir.id);
      setAviso(`Pedido de ${paraExcluir.nome_cliente} excluído.`);
      setParaExcluir(null);
      carregar();
    } catch (err) {
      setErroExclusao(extrairMensagemErro(err, 'Não foi possível excluir o fiado. Tente novamente.'));
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) return <EstadoCarregando texto="Carregando fiados..." />;
  if (erro) return <EstadoErro mensagem={erro} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">Pedidos vendidos para o cliente pagar depois.</p>
        <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={() => setModal({ fiado: null })}>
          <Plus size={16} aria-hidden="true" />
          Novo fiado
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
        <div className="bg-white px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-sm text-ink-soft">A receber</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-clay-dark sm:text-2xl lg:text-3xl">
            {formatarMoeda(resumo.totalPendente)}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {resumo.qtdPendentes === 1 ? '1 pedido pendente' : `${resumo.qtdPendentes} pedidos pendentes`}
          </p>
        </div>
        <div className="bg-white px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-sm text-ink-soft">Já recebido</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-moss sm:text-2xl lg:text-3xl">
            {formatarMoeda(resumo.totalPago)}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {resumo.qtdPagos === 1 ? '1 pedido pago' : `${resumo.qtdPagos} pedidos pagos`}
          </p>
        </div>
      </div>

      <AvisoSucesso mensagem={aviso} onFechar={() => setAviso(null)} />
      {erroAcao && <EstadoErro mensagem={erroAcao} />}

      {/* Filtro e busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filtrar por situação" className="flex gap-2">
          {FILTROS.map(({ id, rotulo }) => {
            const ativo = filtro === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={ativo}
                onClick={() => setFiltro(id)}
                className={`min-h-[40px] flex-1 rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-moss sm:flex-none ${
                  ativo ? 'border-moss bg-moss text-white' : 'border-line bg-white text-ink hover:bg-paper'
                }`}
              >
                {rotulo} ({contagem(id)})
              </button>
            );
          })}
        </div>

        <div className="relative sm:w-64">
          <label htmlFor="busca-fiado" className="sr-only">
            Buscar cliente pelo nome
          </label>
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            id="busca-fiado"
            type="search"
            className="input pl-9"
            placeholder="Buscar cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      {fiados.length === 0 ? (
        <EstadoVazio mensagem="Nenhum fiado registrado ainda. Use o botão “Novo fiado” para anotar o primeiro." />
      ) : visiveis.length === 0 ? (
        <EstadoVazio mensagem="Nenhum pedido encontrado com esse filtro ou busca." />
      ) : (
        <>
          {/* Tabela: telas grandes */}
          <div className="hidden overflow-x-auto rounded-xl border border-line bg-white lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink-soft">
                  <th className="py-3 pl-6 pr-4 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                  <th className="py-3 pl-4 pr-6 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visiveis.map((fiado) => (
                  <tr key={fiado.id}>
                    <td className="py-3.5 pl-6 pr-4 font-medium text-ink">{fiado.nome_cliente}</td>
                    <td className="px-4 py-3.5">
                      <LinkTelefone telefone={fiado.telefone} />
                    </td>
                    <td className="max-w-[16rem] px-4 py-3.5 text-ink-soft">{fiado.produto}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium text-ink">
                      {formatarMoeda(fiado.valor)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-ink-soft">{formatarDataISO(fiado.data_pedido)}</td>
                    <td className="px-4 py-3.5">
                      <StatusFiado pago={fiado.pago} />
                      {fiado.pago && fiado.pago_em && (
                        <p className="mt-0.5 pl-4 text-xs text-ink-soft">em {formatarDataCurta(fiado.pago_em)}</p>
                      )}
                    </td>
                    <td className="py-2 pl-4 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <BotaoPagamento fiado={fiado} ocupado={atualizandoId === fiado.id} onAlterar={marcarPagamento} className="h-9 px-3" />
                        <button
                          type="button"
                          className="btn-icone"
                          onClick={() => setModal({ fiado })}
                          aria-label={`Editar pedido de ${fiado.nome_cliente}`}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icone hover:!bg-clay-light hover:!text-clay-dark"
                          onClick={() => pedirExclusao(fiado)}
                          aria-label={`Excluir pedido de ${fiado.nome_cliente}`}
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartões: celular e tablet */}
          <ul className="space-y-3 lg:hidden">
            {visiveis.map((fiado) => (
              <li key={fiado.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{fiado.nome_cliente}</p>
                    <LinkTelefone telefone={fiado.telefone} className="mt-1 py-1 text-sm" />
                  </div>
                  <p className="shrink-0 font-display text-lg font-semibold text-ink">
                    {formatarMoeda(fiado.valor)}
                  </p>
                </div>

                <p className="mt-2 text-sm text-ink-soft">{fiado.produto}</p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <StatusFiado pago={fiado.pago} />
                  <p className="text-xs text-ink-soft">
                    Pedido em {formatarDataISO(fiado.data_pedido)}
                    {fiado.pago && fiado.pago_em && ` · pago em ${formatarDataCurta(fiado.pago_em)}`}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <BotaoPagamento fiado={fiado} ocupado={atualizandoId === fiado.id} onAlterar={marcarPagamento} className="min-h-[44px] flex-1" />
                  <button
                    type="button"
                    className="btn-icone flex h-11 w-11 shrink-0 items-center justify-center"
                    onClick={() => setModal({ fiado })}
                    aria-label={`Editar pedido de ${fiado.nome_cliente}`}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    className="btn-icone flex h-11 w-11 shrink-0 items-center justify-center hover:!bg-clay-light hover:!text-clay-dark"
                    onClick={() => pedirExclusao(fiado)}
                    aria-label={`Excluir pedido de ${fiado.nome_cliente}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {modal && (
        <FiadoFormModal
          key={modal.fiado?.id ?? 'novo'}
          fiado={modal.fiado}
          onFechar={() => setModal(null)}
          onSalvo={aoSalvar}
        />
      )}

      <ConfirmDialog
        aberto={Boolean(paraExcluir)}
        titulo="Excluir fiado"
        mensagem={
          paraExcluir
            ? `Excluir o pedido de ${paraExcluir.nome_cliente} (${formatarMoeda(paraExcluir.valor)})? Essa ação não pode ser desfeita.`
            : ''
        }
        textoConfirmar="Excluir fiado"
        textoCarregando="Excluindo..."
        perigo
        carregando={excluindo}
        erro={erroExclusao}
        onConfirmar={confirmarExclusao}
        onCancelar={() => {
          setParaExcluir(null);
          setErroExclusao(null);
        }}
      />
    </div>
  );
}
