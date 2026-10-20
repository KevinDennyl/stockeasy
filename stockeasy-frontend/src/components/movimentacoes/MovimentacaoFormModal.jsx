// ============================================================================
// src/components/movimentacoes/MovimentacaoFormModal.jsx
// Formulário de movimentação MANUAL de estoque (entrada ou saída).
//
// - Mostra o estoque atual do produto e como ele ficará depois da operação.
// - Se a saída for maior que o estoque, avisa em âmbar (sem bloquear): quem
//   decide é o banco de dados, e o erro dele é traduzido para linguagem simples.
// - Lembra que VENDAS já baixam o estoque sozinhas, para ninguém lançar a
//   mesma baixa duas vezes.
// ============================================================================

import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Campo from '../ui/Campo';
import EstadoErro from '../feedback/EstadoErro';
import { criarMovimentacao } from '../../services/movimentacoesService';
import { extrairMensagemErro, traduzirErroEstoque } from '../../utils/erros';

const FORM_ID = 'form-movimentacao';

const TIPOS = [
  {
    valor: 'ENTRADA',
    rotulo: 'Entrada',
    descricao: 'Compra, reposição ou devolução',
    icone: ArrowUpCircle,
    selecionado: 'border-moss bg-moss-light',
    corIcone: 'text-moss',
  },
  {
    valor: 'SAIDA',
    rotulo: 'Saída',
    descricao: 'Perda, quebra, doação ou uso próprio',
    icone: ArrowDownCircle,
    selecionado: 'border-clay bg-clay-light',
    corIcone: 'text-clay',
  },
];

export default function MovimentacaoFormModal({ produtos, onFechar, onSalvo }) {
  const [produtoId, setProdutoId] = useState('');
  const [tipo, setTipo] = useState('ENTRADA');
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const produto = produtos.find((p) => p.id === produtoId);
  const qtd = Number(quantidade);
  const quantidadeValida = quantidade !== '' && Number.isInteger(qtd) && qtd > 0;

  // Mensagem de apoio sob o campo "Quantidade"
  let dicaQuantidade;
  let avisoQuantidade;
  if (produto) {
    const unidade = produto.unidade_medida;
    if (quantidadeValida) {
      const depois = tipo === 'ENTRADA' ? produto.quantidade_estoque + qtd : produto.quantidade_estoque - qtd;
      if (depois < 0) {
        avisoQuantidade = `Você só tem ${produto.quantidade_estoque} ${unidade} em estoque. Essa saída será recusada.`;
      } else {
        dicaQuantidade = `Estoque atual: ${produto.quantidade_estoque} ${unidade}. Depois: ${depois} ${unidade}.`;
      }
    } else {
      dicaQuantidade = `Estoque atual: ${produto.quantidade_estoque} ${unidade}.`;
    }
  }

  async function aoEnviar(evento) {
    evento.preventDefault();

    const novosErros = {};
    if (!produtoId) novosErros.produto = 'Escolha o produto que teve a movimentação.';
    if (!quantidadeValida) novosErros.quantidade = 'Informe uma quantidade inteira maior que zero.';
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    setErroApi(null);

    try {
      const movimentacao = await criarMovimentacao({
        produto_id: produtoId,
        tipo,
        quantidade: qtd,
        observacao: motivo.trim() || undefined,
      });
      onSalvo(movimentacao);
    } catch (err) {
      const mensagem = extrairMensagemErro(err, 'Não foi possível registrar a movimentação. Tente novamente.');
      setErroApi(traduzirErroEstoque(mensagem, produtos));
      setSalvando(false);
    }
  }

  return (
    <Modal
      titulo="Nova movimentação"
      onFechar={onFechar}
      podeFechar={!salvando}
      rodape={
        <div className="space-y-3">
          {erroApi && <EstadoErro mensagem={erroApi} />}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={onFechar} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" form={FORM_ID} className="btn btn-primary" disabled={salvando}>
              {salvando ? 'Registrando...' : 'Registrar movimentação'}
            </button>
          </div>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={aoEnviar} noValidate className="space-y-5">
        <Campo id="mov-produto" label="Produto" erro={erros.produto}>
          <select className="input" value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
            <option value="">Selecione um produto</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </Campo>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">Tipo de movimentação</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TIPOS.map(({ valor, rotulo, descricao, icone: Icone, selecionado, corIcone }) => {
              const ativo = tipo === valor;
              return (
                <label
                  key={valor}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-moss ${
                    ativo ? selecionado : 'border-line bg-white hover:bg-paper'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipo-movimentacao"
                    value={valor}
                    checked={ativo}
                    onChange={() => setTipo(valor)}
                    className="sr-only"
                  />
                  <Icone size={20} className={`mt-0.5 shrink-0 ${corIcone}`} aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-medium text-ink">{rotulo}</span>
                    <span className="block text-xs text-ink-soft">{descricao}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {tipo === 'SAIDA' && (
            <p className="mt-2 text-xs text-ink-soft">
              Vendas já baixam o estoque sozinhas. Use saída apenas para outros motivos.
            </p>
          )}
        </fieldset>

        <Campo
          id="mov-quantidade"
          label="Quantidade"
          erro={erros.quantidade}
          aviso={avisoQuantidade}
          dica={dicaQuantidade}
        >
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            className="input"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="Ex.: 10"
          />
        </Campo>

        <Campo id="mov-motivo" label="Motivo" opcional>
          <textarea
            rows={2}
            maxLength={300}
            className="input resize-none"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={
              tipo === 'ENTRADA'
                ? 'Ex.: compra de matéria-prima com o fornecedor A'
                : 'Ex.: peça quebrada durante o transporte'
            }
          />
        </Campo>
      </form>
    </Modal>
  );
}
