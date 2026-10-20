// ============================================================================
// src/components/vendas/NovaVendaModal.jsx
// Checkout: monta a venda item a item e envia para POST /api/vendas.
//
// Como funciona:
//  - Os produtos são buscados ao abrir o modal, para o estoque exibido estar
//    sempre atual.
//  - Cada linha tem produto, quantidade e preço unitário (pré-preenchido com
//    o preço de venda, mas editável — útil para descontos em feiras).
//  - Subtotal de cada linha e total da venda são calculados no front-end
//    enquanto o usuário digita (o banco recalcula tudo ao gravar).
//  - Um produto não pode aparecer em duas linhas; produtos sem estoque ficam
//    desabilitados na lista.
//  - Se a trigger do banco recusar por falta de estoque, a venda inteira é
//    desfeita no back-end (ROLLBACK) e aqui mostramos uma mensagem em
//    linguagem simples, mantendo o carrinho para o usuário só ajustar a
//    quantidade. A lista de produtos é recarregada para refletir o estoque real.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import EstadoCarregando from '../feedback/EstadoCarregando';
import EstadoErro from '../feedback/EstadoErro';
import { listarProdutos } from '../../services/produtosService';
import { criarVenda } from '../../services/vendasService';
import { useUsuario } from '../../contexts/UsuarioContext';
import { arredondarMoeda, formatarMoeda } from '../../utils/formatters';
import { extrairMensagemErro, traduzirErroEstoque } from '../../utils/erros';

const FORM_ID = 'form-venda';

// Colunas: produto | quantidade | preço unitário | subtotal | remover
const COLUNAS = 'md:grid-cols-[minmax(0,1fr)_5.5rem_7.5rem_6.5rem_2.25rem]';

function novaLinha(id) {
  return { id, produtoId: '', quantidade: '1', preco: '' };
}

function subtotalDaLinha(linha) {
  const quantidade = Number(linha.quantidade);
  const preco = Number(linha.preco);
  if (!linha.produtoId || !(quantidade > 0) || linha.preco === '' || Number.isNaN(preco)) return 0;
  return arredondarMoeda(quantidade * preco);
}

export default function NovaVendaModal({ onFechar, onSalvo }) {
  const proximoId = useRef(2);
  const { usuarioId, usuarioAtivo } = useUsuario();

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);

  const [linhas, setLinhas] = useState([novaLinha(1)]);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregarProdutos = useCallback(async () => {
    try {
      setProdutos(await listarProdutos());
      setErroCarga(null);
    } catch (err) {
      setErroCarga(extrairMensagemErro(err, 'Não foi possível carregar os produtos.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  const produtosPorId = useMemo(() => new Map(produtos.map((p) => [p.id, p])), [produtos]);

  const linhasPreenchidas = linhas.filter((l) => l.produtoId);
  const total = arredondarMoeda(linhas.reduce((soma, l) => soma + subtotalDaLinha(l), 0));

  function atualizarLinha(id, campos) {
    setLinhas((atuais) => atuais.map((l) => (l.id === id ? { ...l, ...campos } : l)));
  }

  function escolherProduto(id, produtoId) {
    const produto = produtosPorId.get(produtoId);
    atualizarLinha(id, { produtoId, preco: produto ? String(produto.preco_venda) : '' });
  }

  function adicionarLinha() {
    setLinhas((atuais) => [...atuais, novaLinha(proximoId.current++)]);
  }

  function removerLinha(id) {
    setLinhas((atuais) => (atuais.length === 1 ? atuais : atuais.filter((l) => l.id !== id)));
  }

  // Linhas sem produto são ignoradas (ex.: o usuário clicou em "Adicionar
  // item" e desistiu). Só as preenchidas são validadas e enviadas.
  function validarLinhas() {
    if (linhasPreenchidas.length === 0) return ['Escolha pelo menos um produto para vender.'];

    const problemas = [];
    linhas.forEach((linha, indice) => {
      if (!linha.produtoId) return;
      const quantidade = Number(linha.quantidade);
      const preco = Number(linha.preco);
      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        problemas.push(`Item ${indice + 1}: informe uma quantidade inteira maior que zero.`);
      }
      if (linha.preco === '' || Number.isNaN(preco) || preco < 0) {
        problemas.push(`Item ${indice + 1}: informe um preço válido.`);
      }
    });
    return problemas;
  }

  async function finalizarVenda(evento) {
    evento.preventDefault();
    if (!usuarioId) return;

    const problemas = validarLinhas();
    if (problemas.length > 0) {
      setErro(problemas.join(' '));
      return;
    }

    setSalvando(true);
    setErro(null);

    const itens = linhasPreenchidas.map((l) => ({
      produto_id: l.produtoId,
      quantidade: Number(l.quantidade),
      preco_unitario: Number(l.preco),
    }));

    try {
      const venda = await criarVenda({ usuario_id: usuarioId, itens });
      onSalvo(venda);
    } catch (err) {
      let mensagem = extrairMensagemErro(err, 'Não foi possível finalizar a venda. Tente novamente.');

      if (/usuario_id/i.test(mensagem)) {
        mensagem =
          'O operador selecionado não existe mais no banco. Escolha outro usuário no seletor no topo da tela.';
      } else {
        mensagem = traduzirErroEstoque(mensagem, produtos);
      }

      setErro(mensagem);
      setSalvando(false);
      carregarProdutos(); // atualiza o estoque exibido após a recusa
    }
  }

  const rodape = (
    <div className="space-y-3">
      {erro && <EstadoErro mensagem={erro} />}
      <div className="flex justify-end gap-3">
        <button type="button" className="btn btn-secondary" onClick={onFechar} disabled={salvando}>
          Cancelar
        </button>
        <button
          type="submit"
          form={FORM_ID}
          className="btn btn-primary"
          disabled={salvando || carregando || Boolean(erroCarga) || !usuarioId}
        >
          {salvando ? 'Finalizando...' : 'Finalizar venda'}
        </button>
      </div>
    </div>
  );

  return (
    <Modal titulo="Nova venda" largura="lg" onFechar={onFechar} podeFechar={!salvando} rodape={rodape}>
      {usuarioId ? (
        <p className="mb-5 text-sm text-ink-soft">
          Venda em nome de <strong className="font-medium text-ink">{usuarioAtivo?.nome}</strong>. Para trocar o
          operador, feche esta janela e use o seletor no topo da tela.
        </p>
      ) : (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-amber/40 bg-amber-light px-4 py-3 text-sm leading-relaxed text-amber-dark"
        >
          <strong className="font-semibold">Nenhum operador selecionado.</strong> Escolha um usuário no seletor
          no topo da tela. Se a lista estiver vazia, cadastre um usuário no banco de dados.
        </div>
      )}

      {carregando ? (
        <EstadoCarregando texto="Carregando produtos..." />
      ) : erroCarga ? (
        <EstadoErro mensagem={erroCarga} />
      ) : (
        <form
          id={FORM_ID}
          onSubmit={finalizarVenda}
          noValidate
          // Enter dentro de um campo não deve finalizar a venda por acidente
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.preventDefault();
          }}
        >
          <div className={`hidden gap-3 pb-2 text-xs font-medium text-ink-soft md:grid ${COLUNAS}`}>
            <span>Produto</span>
            <span>Qtd.</span>
            <span>Preço unit.</span>
            <span className="text-right">Subtotal</span>
            <span />
          </div>

          <ul className="space-y-3">
            {linhas.map((linha, indice) => {
              const produto = produtosPorId.get(linha.produtoId);
              const quantidade = Number(linha.quantidade);
              const excedeEstoque = Boolean(produto) && quantidade > produto.quantidade_estoque;
              const numero = indice + 1;

              return (
                <li key={linha.id} className={`grid grid-cols-2 gap-2 md:items-start md:gap-3 ${COLUNAS}`}>
                  <div className="col-span-2 md:col-span-1">
                    <select
                      aria-label={`Produto do item ${numero}`}
                      className="input"
                      value={linha.produtoId}
                      onChange={(e) => escolherProduto(linha.id, e.target.value)}
                      autoFocus
                    >
                      <option value="">Selecione um produto</option>
                      {produtos.map((p) => {
                        const usadoEmOutraLinha = linhas.some(
                          (l) => l.id !== linha.id && l.produtoId === p.id
                        );
                        const semEstoque = p.quantidade_estoque <= 0;
                        return (
                          <option key={p.id} value={p.id} disabled={usadoEmOutraLinha || semEstoque}>
                            {p.nome} ({formatarMoeda(p.preco_venda)}){semEstoque ? ' — sem estoque' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {produto && (
                      <p
                        className={`mt-1 text-xs ${
                          excedeEstoque ? 'font-medium text-amber-dark' : 'text-ink-soft'
                        }`}
                      >
                        {excedeEstoque
                          ? `Só há ${produto.quantidade_estoque} ${produto.unidade_medida} em estoque.`
                          : `Disponível: ${produto.quantidade_estoque} ${produto.unidade_medida}`}
                      </p>
                    )}
                  </div>

                  <input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="1"
                    aria-label={`Quantidade do item ${numero}`}
                    placeholder="Qtd."
                    className="input"
                    value={linha.quantidade}
                    onChange={(e) => atualizarLinha(linha.id, { quantidade: e.target.value })}
                  />

                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    aria-label={`Preço unitário do item ${numero}`}
                    placeholder="Preço"
                    className="input"
                    value={linha.preco}
                    onChange={(e) => atualizarLinha(linha.id, { preco: e.target.value })}
                  />

                  <p className="py-2.5 text-right text-sm font-medium text-ink">
                    {formatarMoeda(subtotalDaLinha(linha))}
                  </p>

                  <button
                    type="button"
                    onClick={() => removerLinha(linha.id)}
                    disabled={linhas.length === 1}
                    aria-label={`Remover item ${numero}`}
                    title="Remover item"
                    className="btn-icone justify-self-end hover:!bg-clay-light hover:!text-clay-dark disabled:opacity-30 disabled:hover:!bg-transparent disabled:hover:!text-ink-soft"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
            <button type="button" className="btn btn-secondary" onClick={adicionarLinha}>
              <Plus size={16} aria-hidden="true" />
              Adicionar item
            </button>

            <div className="text-right">
              <p className="text-sm text-ink-soft">
                Total da venda ({linhasPreenchidas.length}{' '}
                {linhasPreenchidas.length === 1 ? 'item' : 'itens'})
              </p>
              <p aria-live="polite" className="font-display text-3xl font-semibold text-moss">
                {formatarMoeda(total)}
              </p>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
