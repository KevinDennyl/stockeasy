// ============================================================================
// src/services/mockApi.js
// MODO DEMONSTRAÇÃO: um "back-end de mentirinha" que roda dentro do navegador.
//
// Para que serve: o GitHub Pages só hospeda arquivos estáticos, então o site
// publicado não consegue falar com o back-end Node/PostgreSQL do seu
// computador. Com VITE_MODO_DEMO=true, o Axios usa o adapter abaixo em vez
// de fazer chamadas de rede: as mesmas rotas, validações e mensagens de erro
// do back-end real, com os dados salvos no localStorage do visitante.
//
// Cada visitante tem os próprios dados (ninguém vê o que o outro fez) e pode
// restaurar os dados de exemplo a qualquer momento (ver BannerDemo).
//
// Como o adapter só decide COMO a requisição é atendida, nenhuma tela ou
// serviço precisa saber se está em modo demo ou falando com a API real.
// ============================================================================

import { AxiosError } from 'axios';

export const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === 'true';

const CHAVE_BANCO = 'stockeasy_demo_db_v1';
const ATRASO_MS = 120; // pequena espera, para os estados de "carregando" aparecerem como no uso real

// ----------------------------------------------------------------------------
// Utilidades
// ----------------------------------------------------------------------------

// Ids fixos para os dados de exemplo (assim "Restaurar" mantém o operador
// escolhido) e UUID aleatório para tudo que o visitante criar.
const idFixo = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

function novoId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const arredondar = (valor) => Math.round((Number(valor) || 0) * 100) / 100;
const porNome = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR');
const textoValido = (v) => typeof v === 'string' && v.trim().length > 0;
const preenchido = (v) => v !== undefined && v !== null && v !== '';
const numeroNaoNegativo = (v) => preenchido(v) && !Number.isNaN(Number(v)) && Number(v) >= 0;
const inteiroNaoNegativo = (v) => preenchido(v) && Number.isInteger(Number(v)) && Number(v) >= 0;
const inteiroPositivo = (v) => preenchido(v) && Number.isInteger(Number(v)) && Number(v) > 0;

// Interrompe o atendimento da requisição com um erro HTTP (como o back-end faria)
function falhar(status, message) {
  throw { __http: true, status, message };
}

const ok = (data, status = 200) => ({ status, data });

// ----------------------------------------------------------------------------
// "Banco de dados": dados de exemplo + persistência no localStorage
// ----------------------------------------------------------------------------

function criarDadosIniciais() {
  const diasAtras = (d) => new Date(Date.now() - d * 86400000).toISOString();

  return {
    usuarios: [
      { id: idFixo(1), nome: 'Ana Souza' },
      { id: idFixo(2), nome: 'Carlos Lima' },
    ],
    categorias: [
      { id: idFixo(11), nome: 'Bijuterias', descricao: 'Colares, brincos, pulseiras e acessórios artesanais' },
      { id: idFixo(12), nome: 'Papelaria Criativa', descricao: 'Cadernos, cartões e itens de scrapbook' },
      { id: idFixo(13), nome: 'Velas Aromáticas', descricao: 'Velas artesanais de diversos aromas e tamanhos' },
    ],
    produtos: [
      { id: idFixo(21), nome: 'Colar Lua de Prata', codigo_barras: '7891000000011', categoria_id: idFixo(11), preco_custo: 12.5, preco_venda: 29.9, quantidade_estoque: 28, estoque_minimo: 5, unidade_medida: 'UN', criado_em: diasAtras(30) },
      { id: idFixo(22), nome: 'Brinco Flor de Resina', codigo_barras: '7891000000028', categoria_id: idFixo(11), preco_custo: 6, preco_venda: 15.9, quantidade_estoque: 32, estoque_minimo: 10, unidade_medida: 'UN', criado_em: diasAtras(30) },
      { id: idFixo(23), nome: 'Caderno Artesanal A5', codigo_barras: '7891000000035', categoria_id: idFixo(12), preco_custo: 8, preco_venda: 22, quantidade_estoque: 14, estoque_minimo: 5, unidade_medida: 'UN', criado_em: diasAtras(30) },
      { id: idFixo(24), nome: 'Vela Aromática Lavanda 200g', codigo_barras: '7891000000042', categoria_id: idFixo(13), preco_custo: 9.5, preco_venda: 24.9, quantidade_estoque: 24, estoque_minimo: 8, unidade_medida: 'UN', criado_em: diasAtras(30) },
      // abaixo do mínimo de propósito, para a tabela de alerta do dashboard ter o que mostrar
      { id: idFixo(25), nome: 'Vela Aromática Baunilha 200g', codigo_barras: '7891000000059', categoria_id: idFixo(13), preco_custo: 9.5, preco_venda: 24.9, quantidade_estoque: 6, estoque_minimo: 8, unidade_medida: 'UN', criado_em: diasAtras(30) },
    ],
    movimentacoes: [
      { id: idFixo(31), produto_id: idFixo(21), tipo: 'ENTRADA', quantidade: 10, observacao: 'Reposição inicial de estoque - fornecedor A', data_movimentacao: diasAtras(12) },
      { id: idFixo(32), produto_id: idFixo(25), tipo: 'ENTRADA', quantidade: 5, observacao: 'Compra extra para atender feira de artesanato', data_movimentacao: diasAtras(9) },
      { id: idFixo(33), produto_id: idFixo(25), tipo: 'SAIDA', quantidade: 3, observacao: 'Embalagens danificadas no transporte', data_movimentacao: diasAtras(2) },
    ],
    vendas: [
      {
        id: idFixo(41), usuario_id: idFixo(1), data_venda: diasAtras(6), valor_total: 84.7,
        itens: [
          { id: idFixo(51), produto_id: idFixo(21), quantidade: 2, preco_unitario: 29.9, subtotal: 59.8 },
          { id: idFixo(52), produto_id: idFixo(24), quantidade: 1, preco_unitario: 24.9, subtotal: 24.9 },
        ],
      },
      {
        id: idFixo(42), usuario_id: idFixo(2), data_venda: diasAtras(3), valor_total: 69.7,
        itens: [
          { id: idFixo(53), produto_id: idFixo(22), quantidade: 3, preco_unitario: 15.9, subtotal: 47.7 },
          { id: idFixo(54), produto_id: idFixo(23), quantidade: 1, preco_unitario: 22, subtotal: 22 },
        ],
      },
    ],
  };
}

// Se o navegador bloquear o localStorage, os dados vivem só em memória
let copiaEmMemoria = null;

function gravarBanco(db) {
  copiaEmMemoria = db;
  try {
    localStorage.setItem(CHAVE_BANCO, JSON.stringify(db));
  } catch {
    // sem persistência: vale só até recarregar a página
  }
}

// Lê o banco a CADA requisição (e não uma vez só), assim várias abas abertas
// enxergam sempre os mesmos dados.
function lerBanco() {
  try {
    const bruto = localStorage.getItem(CHAVE_BANCO);
    if (bruto) return JSON.parse(bruto);
  } catch {
    // storage bloqueado ou JSON corrompido: cai para os casos abaixo
  }
  if (copiaEmMemoria) return structuredClone(copiaEmMemoria);
  const inicial = criarDadosIniciais();
  gravarBanco(inicial);
  return structuredClone(inicial);
}

/** Volta todos os dados para os exemplos originais. */
export function restaurarDadosDemo() {
  gravarBanco(criarDadosIniciais());
}

// ----------------------------------------------------------------------------
// Rotas — mesmas regras e mensagens do back-end Express
// ----------------------------------------------------------------------------

const comCategoria = (db, p) => ({
  ...p,
  categoria_nome: db.categorias.find((c) => c.id === p.categoria_id)?.nome ?? null,
});

function rotaCategorias(db, metodo, partes, corpo) {
  if (partes.length !== 1) return null;

  if (metodo === 'get') {
    return ok([...db.categorias].sort(porNome));
  }

  if (metodo === 'post') {
    if (!textoValido(corpo.nome)) falhar(400, 'O campo "nome" é obrigatório e não pode ser vazio.');
    const nome = corpo.nome.trim();
    if (db.categorias.some((c) => c.nome === nome)) falhar(409, 'Já existe uma categoria com esse nome.');

    const categoria = { id: novoId(), nome, descricao: corpo.descricao ?? null };
    db.categorias.push(categoria);
    gravarBanco(db);
    return ok(categoria, 201);
  }
  return null;
}

function validarProduto(corpo, parcial) {
  const erros = [];
  if ((!parcial || corpo.nome !== undefined) && !textoValido(corpo.nome)) {
    erros.push('O campo "nome" é obrigatório e não pode ser vazio.');
  }
  if ((!parcial || corpo.preco_custo !== undefined) && !numeroNaoNegativo(corpo.preco_custo)) {
    erros.push('O campo "preco_custo" deve ser um número maior ou igual a zero.');
  }
  if ((!parcial || corpo.preco_venda !== undefined) && !numeroNaoNegativo(corpo.preco_venda)) {
    erros.push('O campo "preco_venda" deve ser um número maior ou igual a zero.');
  }
  if (corpo.quantidade_estoque !== undefined && !inteiroNaoNegativo(corpo.quantidade_estoque)) {
    erros.push('O campo "quantidade_estoque" deve ser um número inteiro maior ou igual a zero.');
  }
  if (corpo.estoque_minimo !== undefined && !inteiroNaoNegativo(corpo.estoque_minimo)) {
    erros.push('O campo "estoque_minimo" deve ser um número inteiro maior ou igual a zero.');
  }
  return erros;
}

function rotaProdutos(db, metodo, partes, corpo) {
  const [, param] = partes;

  if (partes.length === 1 && metodo === 'get') {
    return ok([...db.produtos].sort(porNome).map((p) => comCategoria(db, p)));
  }

  // "alerta-estoque" precisa vir antes do tratamento de :id
  if (param === 'alerta-estoque' && partes.length === 2 && metodo === 'get') {
    return ok(
      db.produtos
        .filter((p) => p.quantidade_estoque <= p.estoque_minimo)
        .sort((a, b) => a.quantidade_estoque - b.quantidade_estoque)
        .map((p) => comCategoria(db, p))
    );
  }

  if (partes.length === 1 && metodo === 'post') {
    const erros = validarProduto(corpo, false);
    if (erros.length > 0) falhar(400, erros.join(' '));
    if (corpo.codigo_barras && db.produtos.some((p) => p.codigo_barras === corpo.codigo_barras)) {
      falhar(409, 'Já existe um produto com esse código de barras.');
    }
    if (corpo.categoria_id && !db.categorias.some((c) => c.id === corpo.categoria_id)) {
      falhar(400, 'categoria_id informado não existe.');
    }

    const produto = {
      id: novoId(),
      nome: corpo.nome.trim(),
      codigo_barras: corpo.codigo_barras ?? null,
      categoria_id: corpo.categoria_id ?? null,
      preco_custo: Number(corpo.preco_custo),
      preco_venda: Number(corpo.preco_venda),
      quantidade_estoque: Number(corpo.quantidade_estoque ?? 0),
      estoque_minimo: Number(corpo.estoque_minimo ?? 0),
      unidade_medida: corpo.unidade_medida ?? 'UN',
      criado_em: new Date().toISOString(),
    };
    db.produtos.push(produto);
    gravarBanco(db);
    return ok(produto, 201);
  }

  if (partes.length === 2) {
    const produto = db.produtos.find((p) => p.id === param);

    if (metodo === 'get') {
      if (!produto) falhar(404, 'Produto não encontrado.');
      return ok(comCategoria(db, produto));
    }

    if (metodo === 'put') {
      const erros = validarProduto(corpo, true);
      if (erros.length > 0) falhar(400, erros.join(' '));
      if (!produto) falhar(404, 'Produto não encontrado.');
      if (corpo.codigo_barras && db.produtos.some((p) => p.id !== param && p.codigo_barras === corpo.codigo_barras)) {
        falhar(409, 'Já existe um produto com esse código de barras.');
      }
      if (corpo.categoria_id && !db.categorias.some((c) => c.id === corpo.categoria_id)) {
        falhar(400, 'categoria_id informado não existe.');
      }

      // Atualização parcial: campos ausentes (ou nulos) mantêm o valor atual
      Object.assign(produto, {
        nome: corpo.nome?.trim() ?? produto.nome,
        codigo_barras: corpo.codigo_barras ?? produto.codigo_barras,
        categoria_id: corpo.categoria_id ?? produto.categoria_id,
        preco_custo: corpo.preco_custo !== undefined && corpo.preco_custo !== null ? Number(corpo.preco_custo) : produto.preco_custo,
        preco_venda: corpo.preco_venda !== undefined && corpo.preco_venda !== null ? Number(corpo.preco_venda) : produto.preco_venda,
        quantidade_estoque: corpo.quantidade_estoque !== undefined && corpo.quantidade_estoque !== null ? Number(corpo.quantidade_estoque) : produto.quantidade_estoque,
        estoque_minimo: corpo.estoque_minimo !== undefined && corpo.estoque_minimo !== null ? Number(corpo.estoque_minimo) : produto.estoque_minimo,
        unidade_medida: corpo.unidade_medida ?? produto.unidade_medida,
      });
      gravarBanco(db);
      return ok(produto);
    }

    if (metodo === 'delete') {
      if (!produto) falhar(404, 'Produto não encontrado.');
      const temVendas = db.vendas.some((v) => v.itens.some((i) => i.produto_id === param));
      if (temVendas) {
        falhar(409, 'Não é possível excluir: este produto já possui vendas ou movimentações de estoque vinculadas.');
      }
      db.produtos = db.produtos.filter((p) => p.id !== param);
      db.movimentacoes = db.movimentacoes.filter((m) => m.produto_id !== param); // ON DELETE CASCADE
      gravarBanco(db);
      return ok({ status: 'ok', message: 'Produto removido com sucesso.', id: param });
    }
  }
  return null;
}

function rotaMovimentacoes(db, metodo, partes, corpo) {
  if (partes.length !== 1) return null;

  if (metodo === 'get') {
    return ok(
      [...db.movimentacoes]
        .sort((a, b) => new Date(b.data_movimentacao) - new Date(a.data_movimentacao))
        .map((m) => ({ ...m, produto_nome: db.produtos.find((p) => p.id === m.produto_id)?.nome ?? '—' }))
    );
  }

  if (metodo === 'post') {
    const erros = [];
    if (!textoValido(corpo.produto_id)) erros.push('O campo "produto_id" é obrigatório.');
    if (!['ENTRADA', 'SAIDA'].includes(corpo.tipo)) erros.push('O campo "tipo" deve ser "ENTRADA" ou "SAIDA".');
    if (!inteiroPositivo(corpo.quantidade)) erros.push('O campo "quantidade" deve ser um número inteiro maior que zero.');
    if (erros.length > 0) falhar(400, erros.join(' '));

    const produto = db.produtos.find((p) => p.id === corpo.produto_id);
    if (!produto) falhar(400, 'produto_id informado não existe.');

    const quantidade = Number(corpo.quantidade);
    if (corpo.tipo === 'SAIDA') {
      // mesma mensagem da trigger do PostgreSQL
      if (produto.quantidade_estoque < quantidade) {
        falhar(
          400,
          `Saída de estoque não permitida para o produto ${produto.id}. Disponível: ${produto.quantidade_estoque}, solicitado: ${quantidade}.`
        );
      }
      produto.quantidade_estoque -= quantidade;
    } else {
      produto.quantidade_estoque += quantidade;
    }

    const movimentacao = {
      id: novoId(),
      produto_id: produto.id,
      tipo: corpo.tipo,
      quantidade,
      observacao: corpo.observacao ?? null,
      data_movimentacao: new Date().toISOString(),
    };
    db.movimentacoes.push(movimentacao);
    gravarBanco(db);
    return ok(movimentacao, 201);
  }
  return null;
}

function detalharVenda(db, venda) {
  return {
    id: venda.id,
    usuario_id: venda.usuario_id,
    usuario_nome: db.usuarios.find((u) => u.id === venda.usuario_id)?.nome ?? '—',
    data_venda: venda.data_venda,
    valor_total: venda.valor_total,
    itens: venda.itens.map((i) => ({
      ...i,
      produto_nome: db.produtos.find((p) => p.id === i.produto_id)?.nome ?? '—',
    })),
  };
}

function rotaVendas(db, metodo, partes, corpo) {
  if (partes.length === 1 && metodo === 'get') {
    return ok(
      [...db.vendas]
        .sort((a, b) => new Date(b.data_venda) - new Date(a.data_venda))
        .map(({ itens, ...venda }) => ({
          ...venda,
          usuario_nome: db.usuarios.find((u) => u.id === venda.usuario_id)?.nome ?? '—',
        }))
    );
  }

  if (partes.length === 2 && metodo === 'get') {
    const venda = db.vendas.find((v) => v.id === partes[1]);
    if (!venda) falhar(404, 'Venda não encontrada.');
    return ok(detalharVenda(db, venda));
  }

  if (partes.length === 1 && metodo === 'post') {
    // --- validação (mesmas mensagens do back-end) ---
    const erros = [];
    if (!textoValido(corpo.usuario_id)) erros.push('O campo "usuario_id" é obrigatório.');
    if (!Array.isArray(corpo.itens) || corpo.itens.length === 0) {
      erros.push('O campo "itens" deve ser um array com pelo menos um item de venda.');
    } else {
      corpo.itens.forEach((item, i) => {
        if (!textoValido(item.produto_id)) erros.push(`Item ${i + 1}: "produto_id" é obrigatório.`);
        if (!inteiroPositivo(item.quantidade)) erros.push(`Item ${i + 1}: "quantidade" deve ser um número inteiro maior que zero.`);
        if (!numeroNaoNegativo(item.preco_unitario)) erros.push(`Item ${i + 1}: "preco_unitario" deve ser um número maior ou igual a zero.`);
      });
    }
    if (erros.length > 0) falhar(400, erros.join(' '));
    if (!db.usuarios.some((u) => u.id === corpo.usuario_id)) falhar(400, 'usuario_id informado não existe.');

    // --- itens: equivale ao BEGIN ... COMMIT/ROLLBACK ---
    // Tudo é calculado sobre "db" (uma cópia lida do storage) e só é gravado
    // no final. Se qualquer item falhar, falhar() interrompe antes do
    // gravarBanco: nada muda — o mesmo efeito do ROLLBACK do back-end.
    const itens = corpo.itens.map((item) => {
      const produto = db.produtos.find((p) => p.id === item.produto_id);
      if (!produto) falhar(400, `Produto ${item.produto_id} não encontrado.`);

      const quantidade = Number(item.quantidade);
      if (produto.quantidade_estoque < quantidade) {
        // mesma mensagem da trigger do PostgreSQL
        falhar(
          400,
          `Estoque insuficiente para o produto ${produto.id}. Disponível: ${produto.quantidade_estoque}, solicitado: ${quantidade}.`
        );
      }
      produto.quantidade_estoque -= quantidade;

      const precoUnitario = Number(item.preco_unitario);
      return {
        id: novoId(),
        produto_id: produto.id,
        quantidade,
        preco_unitario: precoUnitario,
        subtotal: arredondar(quantidade * precoUnitario),
      };
    });

    const venda = {
      id: novoId(),
      usuario_id: corpo.usuario_id,
      data_venda: new Date().toISOString(),
      valor_total: arredondar(itens.reduce((soma, i) => soma + i.subtotal, 0)),
      itens,
    };
    db.vendas.push(venda);
    gravarBanco(db);
    return ok(detalharVenda(db, venda), 201);
  }
  return null;
}

function rotaDashboard(db, metodo, partes) {
  if (metodo === 'get' && partes.length === 2 && partes[1] === 'resumo') {
    return ok({
      total_produtos: db.produtos.length,
      valor_total_estoque: arredondar(db.produtos.reduce((s, p) => s + p.quantidade_estoque * p.preco_custo, 0)),
      total_vendas_valor: arredondar(db.vendas.reduce((s, v) => s + v.valor_total, 0)),
      contagem_produtos_estoque_baixo: db.produtos.filter((p) => p.quantidade_estoque <= p.estoque_minimo).length,
    });
  }
  return null;
}

function tratarRequisicao(metodo, caminho, corpo) {
  const partes = caminho.split('/').filter(Boolean);
  const db = lerBanco();

  let resposta = null;
  switch (partes[0]) {
    case 'health':
      resposta = ok({ status: 'ok', api: 'demo', database: 'navegador (localStorage)', horario_servidor: new Date().toISOString() });
      break;
    case 'usuarios':
      if (metodo === 'get' && partes.length === 1) resposta = ok([...db.usuarios].sort(porNome));
      break;
    case 'categorias':
      resposta = rotaCategorias(db, metodo, partes, corpo);
      break;
    case 'produtos':
      resposta = rotaProdutos(db, metodo, partes, corpo);
      break;
    case 'movimentacoes':
      resposta = rotaMovimentacoes(db, metodo, partes, corpo);
      break;
    case 'vendas':
      resposta = rotaVendas(db, metodo, partes, corpo);
      break;
    case 'dashboard':
      resposta = rotaDashboard(db, metodo, partes);
      break;
    default:
      break;
  }

  return resposta ?? falhar(404, `Rota não encontrada: ${metodo.toUpperCase()} /api${caminho}`);
}

// ----------------------------------------------------------------------------
// Adapter do Axios: no lugar de ir à rede, atende a requisição aqui mesmo
// ----------------------------------------------------------------------------

export async function adaptadorDemo(config) {
  await new Promise((resolver) => setTimeout(resolver, ATRASO_MS));

  const metodo = (config.method || 'get').toLowerCase();
  const caminho = String(config.url || '').split('?')[0];

  let corpo = config.data;
  if (typeof corpo === 'string') {
    try {
      corpo = JSON.parse(corpo);
    } catch {
      corpo = {};
    }
  }

  let resultado;
  try {
    resultado = tratarRequisicao(metodo, caminho, corpo || {});
  } catch (erro) {
    if (erro && erro.__http) {
      resultado = { status: erro.status, data: { status: 'error', message: erro.message } };
    } else {
      console.error('Erro no modo demonstração:', erro);
      resultado = { status: 500, data: { status: 'error', message: 'Erro interno no modo demonstração.' } };
    }
  }

  const resposta = {
    data: resultado.data,
    status: resultado.status,
    statusText: String(resultado.status),
    headers: {},
    config,
    request: {},
  };

  // Adapters personalizados precisam rejeitar eles mesmos os status de erro
  // (o Axios só faz isso automaticamente nos adapters embutidos).
  if (resultado.status >= 400) {
    throw new AxiosError(
      resultado.data.message,
      resultado.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      resposta
    );
  }

  return resposta;
}
