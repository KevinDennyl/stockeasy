// ============================================================================
// src/components/produtos/ProdutoFormModal.jsx
// Formulário para cadastrar (produto = null) ou editar um produto.
//
// Decisões de UX:
//  - Na edição, a quantidade em estoque é SOMENTE LEITURA. Alterar o estoque
//    direto no produto não deixaria rastro no histórico; o caminho correto é
//    registrar uma movimentação (entrada/saída).
//  - A categoria pode ser criada ali mesmo, sem sair do formulário.
//  - Mostra o lucro por unidade em tempo real, ajudando a precificar.
//  - Validação no front-end com mensagens claras; o back-end continua sendo
//    a validação definitiva (erros dele aparecem no rodapé do modal).
// ============================================================================

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import Campo from '../ui/Campo';
import EstadoErro from '../feedback/EstadoErro';
import { criarProduto, atualizarProduto } from '../../services/produtosService';
import { criarCategoria } from '../../services/categoriasService';
import { extrairMensagemErro } from '../../utils/erros';
import { formatarMoeda } from '../../utils/formatters';

const FORM_ID = 'form-produto';
const UNIDADES = ['UN', 'PAR', 'KG', 'L', 'PCT', 'CX'];

function valoresIniciais(produto) {
  return {
    nome: produto?.nome ?? '',
    categoriaId: produto?.categoria_id ?? '',
    codigoBarras: produto?.codigo_barras ?? '',
    unidade: produto?.unidade_medida ?? 'UN',
    precoCusto: produto ? String(produto.preco_custo) : '',
    precoVenda: produto ? String(produto.preco_venda) : '',
    estoque: produto ? String(produto.quantidade_estoque) : '0',
    estoqueMinimo: produto ? String(produto.estoque_minimo) : '0',
  };
}

function ehPrecoValido(texto) {
  const numero = Number(texto);
  return texto !== '' && !Number.isNaN(numero) && numero >= 0;
}

function ehInteiroValido(texto) {
  const numero = Number(texto);
  return texto !== '' && Number.isInteger(numero) && numero >= 0;
}

function validar(form, editando) {
  const erros = {};

  if (!form.nome.trim()) erros.nome = 'Informe o nome do produto.';
  if (!ehPrecoValido(form.precoCusto)) erros.precoCusto = 'Informe um valor igual ou maior que zero.';
  if (!ehPrecoValido(form.precoVenda)) erros.precoVenda = 'Informe um valor igual ou maior que zero.';
  if (!editando && !ehInteiroValido(form.estoque)) {
    erros.estoque = 'Use um número inteiro, a partir de zero.';
  }
  if (!ehInteiroValido(form.estoqueMinimo)) {
    erros.estoqueMinimo = 'Use um número inteiro, a partir de zero.';
  }

  return erros;
}

export default function ProdutoFormModal({
  produto = null,
  categorias,
  onFechar,
  onSalvo,
  onCategoriaCriada,
}) {
  const editando = Boolean(produto);

  const [form, setForm] = useState(() => valoresIniciais(produto));
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const [novaCategoriaAberta, setNovaCategoriaAberta] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [erroCategoria, setErroCategoria] = useState(null);
  const [criandoCategoria, setCriandoCategoria] = useState(false);

  // O back-end não permite "limpar" a categoria de um produto que já tem uma
  // (null mantém o valor atual no PUT), então só oferecemos "Sem categoria"
  // quando ele ainda não tem categoria.
  const permitirSemCategoria = !produto?.categoria_id;

  const unidades = UNIDADES.includes(form.unidade) ? UNIDADES : [form.unidade, ...UNIDADES];

  function alterar(campo) {
    return (evento) => setForm((atual) => ({ ...atual, [campo]: evento.target.value }));
  }

  // Lucro por unidade, calculado enquanto o usuário digita os preços.
  let dicaPreco = null;
  let avisoPreco = null;
  if (ehPrecoValido(form.precoCusto) && ehPrecoValido(form.precoVenda)) {
    const custo = Number(form.precoCusto);
    const venda = Number(form.precoVenda);
    if (venda < custo) {
      avisoPreco = 'O preço de venda está abaixo do custo: você teria prejuízo em cada unidade vendida.';
    } else if (venda > 0) {
      const lucro = venda - custo;
      dicaPreco = `Lucro por unidade: ${formatarMoeda(lucro)} (${Math.round((lucro / venda) * 100)}% do preço de venda).`;
    }
  }

  async function criarNovaCategoria() {
    const nome = novaCategoria.trim();
    if (!nome) {
      setErroCategoria('Digite o nome da categoria.');
      return;
    }

    setCriandoCategoria(true);
    setErroCategoria(null);
    try {
      const categoria = await criarCategoria({ nome });
      onCategoriaCriada(categoria);
      setForm((atual) => ({ ...atual, categoriaId: categoria.id }));
      setNovaCategoria('');
      setNovaCategoriaAberta(false);
    } catch (err) {
      setErroCategoria(extrairMensagemErro(err, 'Não foi possível criar a categoria. Tente novamente.'));
    } finally {
      setCriandoCategoria(false);
    }
  }

  async function aoEnviar(evento) {
    evento.preventDefault();

    const novosErros = validar(form, editando);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    setErroApi(null);

    // Campos opcionais em branco são omitidos: o back-end trata "ausente"
    // como "não informado" (e código de barras vazio violaria a regra de
    // unicidade se mais de um produto o tivesse como texto vazio).
    const payload = {
      nome: form.nome.trim(),
      categoria_id: form.categoriaId || undefined,
      codigo_barras: form.codigoBarras.trim() || undefined,
      unidade_medida: form.unidade,
      preco_custo: Number(form.precoCusto),
      preco_venda: Number(form.precoVenda),
      estoque_minimo: Number(form.estoqueMinimo),
    };
    if (!editando) payload.quantidade_estoque = Number(form.estoque);

    try {
      const salvo = editando
        ? await atualizarProduto(produto.id, payload)
        : await criarProduto(payload);
      onSalvo(salvo, editando ? 'editado' : 'criado');
    } catch (err) {
      setErroApi(extrairMensagemErro(err, 'Não foi possível salvar o produto. Tente novamente.'));
      setSalvando(false);
    }
  }

  return (
    <Modal
      titulo={editando ? 'Editar produto' : 'Novo produto'}
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
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar produto'}
            </button>
          </div>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={aoEnviar} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="produto-nome" label="Nome do produto" erro={erros.nome} className="sm:col-span-2">
          <input
            type="text"
            className="input"
            value={form.nome}
            onChange={alterar('nome')}
            placeholder="Ex.: Colar lua de prata"
            maxLength={150}
            autoComplete="off"
          />
        </Campo>

        <div className="sm:col-span-2">
          <Campo id="produto-categoria" label="Categoria" opcional>
            <select className="input" value={form.categoriaId} onChange={alterar('categoriaId')}>
              {permitirSemCategoria && <option value="">Sem categoria</option>}
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </Campo>

          {!novaCategoriaAberta ? (
            <button
              type="button"
              onClick={() => setNovaCategoriaAberta(true)}
              className="mt-2 inline-flex items-center gap-1 rounded text-sm font-medium text-moss hover:text-moss-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            >
              <Plus size={14} aria-hidden="true" />
              Criar nova categoria
            </button>
          ) : (
            <div className="mt-3 rounded-lg border border-line bg-paper p-3">
              <label htmlFor="produto-nova-categoria" className="mb-1.5 block text-sm font-medium text-ink">
                Nome da nova categoria
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="produto-nova-categoria"
                  type="text"
                  autoFocus
                  className="input min-w-0 flex-1"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter aqui cria a categoria, sem enviar o formulário do produto
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      criarNovaCategoria();
                    }
                  }}
                  placeholder="Ex.: Bijuterias"
                  maxLength={100}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="btn btn-primary shrink-0"
                  onClick={criarNovaCategoria}
                  disabled={criandoCategoria}
                >
                  {criandoCategoria ? 'Criando...' : 'Criar categoria'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary shrink-0"
                  onClick={() => {
                    setNovaCategoriaAberta(false);
                    setNovaCategoria('');
                    setErroCategoria(null);
                  }}
                  disabled={criandoCategoria}
                >
                  Cancelar
                </button>
              </div>
              {erroCategoria && <p className="mt-1.5 text-xs text-clay-dark">{erroCategoria}</p>}
            </div>
          )}
        </div>

        <Campo id="produto-codigo" label="Código de barras" opcional>
          <input
            type="text"
            className="input"
            value={form.codigoBarras}
            onChange={alterar('codigoBarras')}
            maxLength={50}
            autoComplete="off"
          />
        </Campo>

        <Campo id="produto-unidade" label="Unidade de medida">
          <select className="input" value={form.unidade} onChange={alterar('unidade')}>
            {unidades.map((unidade) => (
              <option key={unidade} value={unidade}>
                {unidade}
              </option>
            ))}
          </select>
        </Campo>

        <Campo id="produto-preco-custo" label="Preço de custo (R$)" erro={erros.precoCusto}>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="input"
            value={form.precoCusto}
            onChange={alterar('precoCusto')}
            placeholder="0,00"
          />
        </Campo>

        <Campo id="produto-preco-venda" label="Preço de venda (R$)" erro={erros.precoVenda}>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="input"
            value={form.precoVenda}
            onChange={alterar('precoVenda')}
            placeholder="0,00"
          />
        </Campo>

        {(avisoPreco || dicaPreco) && (
          <p
            className={`-mt-1 text-xs sm:col-span-2 ${
              avisoPreco ? 'font-medium text-amber-dark' : 'text-ink-soft'
            }`}
          >
            {avisoPreco || dicaPreco}
          </p>
        )}

        <Campo
          id="produto-estoque"
          label={editando ? 'Estoque atual' : 'Estoque inicial'}
          erro={erros.estoque}
          dica={
            editando
              ? 'Para ajustar a quantidade, registre uma movimentação na aba Movimentações.'
              : 'Quantas unidades você tem hoje.'
          }
        >
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            className="input"
            value={form.estoque}
            onChange={alterar('estoque')}
            disabled={editando}
          />
        </Campo>

        <Campo
          id="produto-estoque-minimo"
          label="Estoque mínimo"
          erro={erros.estoqueMinimo}
          dica="O produto entra na lista de alertas ao chegar nesse valor."
        >
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            className="input"
            value={form.estoqueMinimo}
            onChange={alterar('estoqueMinimo')}
          />
        </Campo>
      </form>
    </Modal>
  );
}
