// ============================================================================
// src/pages/Produtos.jsx
// Catálogo de produtos: listar, cadastrar, editar e excluir (com confirmação).
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { listarProdutos, excluirProduto } from '../services/produtosService';
import { listarCategorias } from '../services/categoriasService';
import ProdutoFormModal from '../components/produtos/ProdutoFormModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import AvisoSucesso from '../components/feedback/AvisoSucesso';
import EstadoCarregando from '../components/feedback/EstadoCarregando';
import EstadoErro from '../components/feedback/EstadoErro';
import EstadoVazio from '../components/feedback/EstadoVazio';
import { formatarMoeda } from '../utils/formatters';
import { extrairMensagemErro } from '../utils/erros';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);

  // modal === null -> fechado | { produto: null } -> novo | { produto } -> editar
  const [modal, setModal] = useState(null);

  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const [dadosProdutos, dadosCategorias] = await Promise.all([
        listarProdutos(),
        listarCategorias(),
      ]);
      setProdutos(dadosProdutos);
      setCategorias(dadosCategorias);
      setErro(null);
    } catch (err) {
      setErro(extrairMensagemErro(err, 'Não foi possível carregar os produtos.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function aoSalvarProduto(_produto, modo) {
    setModal(null);
    setAviso(modo === 'criado' ? 'Produto cadastrado.' : 'Alterações salvas.');
    carregar();
  }

  function aoCriarCategoria(categoria) {
    setCategorias((atuais) =>
      [...atuais, categoria].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    );
  }

  function pedirExclusao(produto) {
    setErroExclusao(null);
    setProdutoParaExcluir(produto);
  }

  function cancelarExclusao() {
    setProdutoParaExcluir(null);
    setErroExclusao(null);
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await excluirProduto(produtoParaExcluir.id);
      setAviso(`Produto "${produtoParaExcluir.nome}" excluído.`);
      setProdutoParaExcluir(null);
      carregar();
    } catch (err) {
      let mensagem = extrairMensagemErro(err, 'Não foi possível excluir o produto. Tente novamente.');
      // 409 = produto já tem vendas/movimentações: sugerimos o caminho alternativo
      if (err.response?.status === 409) {
        mensagem += ' Se ele não é mais vendido, mantenha o cadastro e zere o estoque em Movimentações.';
      }
      setErroExclusao(mensagem);
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) return <EstadoCarregando texto="Carregando produtos..." />;
  if (erro) return <EstadoErro mensagem={erro} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          {produtos.length === 1 ? '1 produto cadastrado' : `${produtos.length} produtos cadastrados`}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ produto: null })}>
          <Plus size={16} aria-hidden="true" />
          Novo produto
        </button>
      </div>

      <AvisoSucesso mensagem={aviso} onFechar={() => setAviso(null)} />

      {produtos.length === 0 ? (
        <EstadoVazio mensagem="Nenhum produto cadastrado ainda. Use o botão “Novo produto” para começar." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-soft">
                <th className="py-3 pl-6 pr-4 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Preço de venda</th>
                <th className="px-4 py-3 font-medium">Em estoque</th>
                <th className="px-4 py-3 font-medium">Mínimo</th>
                <th className="py-3 pl-4 pr-6 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {produtos.map((produto) => {
                const estoqueBaixo = produto.quantidade_estoque <= produto.estoque_minimo;
                return (
                  <tr key={produto.id}>
                    <td className="py-3.5 pl-6 pr-4 font-medium text-ink">{produto.nome}</td>
                    <td className="px-4 py-3.5 text-ink-soft">{produto.categoria_nome || '—'}</td>
                    <td className="px-4 py-3.5 text-ink">{formatarMoeda(produto.preco_venda)}</td>
                    <td className={`px-4 py-3.5 ${estoqueBaixo ? 'font-medium text-amber-dark' : 'text-ink'}`}>
                      {produto.quantidade_estoque} {produto.unidade_medida}
                    </td>
                    <td className="px-4 py-3.5 text-ink-soft">
                      {produto.estoque_minimo} {produto.unidade_medida}
                    </td>
                    <td className="py-2 pl-4 pr-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn-icone"
                          onClick={() => setModal({ produto })}
                          aria-label={`Editar ${produto.nome}`}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icone hover:!bg-clay-light hover:!text-clay-dark"
                          onClick={() => pedirExclusao(produto)}
                          aria-label={`Excluir ${produto.nome}`}
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ProdutoFormModal
          key={modal.produto?.id ?? 'novo'}
          produto={modal.produto}
          categorias={categorias}
          onFechar={() => setModal(null)}
          onSalvo={aoSalvarProduto}
          onCategoriaCriada={aoCriarCategoria}
        />
      )}

      <ConfirmDialog
        aberto={Boolean(produtoParaExcluir)}
        titulo="Excluir produto"
        mensagem={
          produtoParaExcluir
            ? `Tem certeza que deseja excluir "${produtoParaExcluir.nome}"? Essa ação não pode ser desfeita.`
            : ''
        }
        textoConfirmar="Excluir produto"
        textoCarregando="Excluindo..."
        perigo
        carregando={excluindo}
        erro={erroExclusao}
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
      />
    </div>
  );
}
