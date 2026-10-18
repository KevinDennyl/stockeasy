// ============================================================================
// src/controllers/produtos.controller.js
// CRUD completo do módulo de Produtos.
// ============================================================================

const db = require('../config/database');
const {
  isNumeroNaoNegativo,
  isInteiroNaoNegativo,
  isTextoValido,
} = require('../utils/validators');

const SELECT_PRODUTO_BASE = `
  SELECT
    p.id,
    p.nome,
    p.codigo_barras,
    p.categoria_id,
    c.nome AS categoria_nome,
    p.preco_custo,
    p.preco_venda,
    p.quantidade_estoque,
    p.estoque_minimo,
    p.unidade_medida,
    p.criado_em
  FROM produtos p
  LEFT JOIN categorias c ON c.id = p.categoria_id
`;

function validarCamposProduto(body, { parcial = false } = {}) {
  const erros = [];
  const { nome, preco_custo, preco_venda, quantidade_estoque, estoque_minimo } = body;

  if (!parcial || nome !== undefined) {
    if (!isTextoValido(nome)) {
      erros.push('O campo "nome" é obrigatório e não pode ser vazio.');
    }
  }
  if (!parcial || preco_custo !== undefined) {
    if (!isNumeroNaoNegativo(preco_custo)) {
      erros.push('O campo "preco_custo" deve ser um número maior ou igual a zero.');
    }
  }
  if (!parcial || preco_venda !== undefined) {
    if (!isNumeroNaoNegativo(preco_venda)) {
      erros.push('O campo "preco_venda" deve ser um número maior ou igual a zero.');
    }
  }
  if (quantidade_estoque !== undefined && !isInteiroNaoNegativo(quantidade_estoque)) {
    erros.push('O campo "quantidade_estoque" deve ser um número inteiro maior ou igual a zero.');
  }
  if (estoque_minimo !== undefined && !isInteiroNaoNegativo(estoque_minimo)) {
    erros.push('O campo "estoque_minimo" deve ser um número inteiro maior ou igual a zero.');
  }

  return erros;
}

async function listar(req, res) {
  try {
    const result = await db.query(`${SELECT_PRODUTO_BASE} ORDER BY p.nome ASC`);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao listar produtos.' });
  }
}

async function alertaEstoque(req, res) {
  try {
    const result = await db.query(
      `${SELECT_PRODUTO_BASE}
       WHERE p.quantidade_estoque <= p.estoque_minimo
       ORDER BY p.quantidade_estoque ASC`
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar alerta de estoque:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao buscar produtos em alerta de estoque.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(`${SELECT_PRODUTO_BASE} WHERE p.id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Produto não encontrado.' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    if (error.code === '22P02') {
      return res.status(400).json({ status: 'error', message: 'ID de produto inválido.' });
    }
    console.error('Erro ao buscar produto:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao buscar produto.' });
  }
}

async function criar(req, res) {
  try {
    const erros = validarCamposProduto(req.body);
    if (erros.length > 0) {
      return res.status(400).json({ status: 'error', message: erros.join(' ') });
    }

    const {
      nome, codigo_barras, categoria_id, preco_custo, preco_venda,
      quantidade_estoque, estoque_minimo, unidade_medida,
    } = req.body;

    const result = await db.query(
      `INSERT INTO produtos
        (nome, codigo_barras, categoria_id, preco_custo, preco_venda,
         quantidade_estoque, estoque_minimo, unidade_medida)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        nome.trim(),
        codigo_barras ?? null,
        categoria_id ?? null,
        preco_custo,
        preco_venda,
        quantidade_estoque ?? 0,
        estoque_minimo ?? 0,
        unidade_medida ?? 'UN',
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ status: 'error', message: 'Já existe um produto com esse código de barras.' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ status: 'error', message: 'categoria_id informado não existe.' });
    }
    console.error('Erro ao criar produto:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao criar produto.' });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;

    const erros = validarCamposProduto(req.body, { parcial: true });
    if (erros.length > 0) {
      return res.status(400).json({ status: 'error', message: erros.join(' ') });
    }

    const atual = await db.query('SELECT * FROM produtos WHERE id = $1', [id]);
    if (atual.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Produto não encontrado.' });
    }
    const produtoAtual = atual.rows[0];

    const dados = {
      nome: req.body.nome ?? produtoAtual.nome,
      codigo_barras: req.body.codigo_barras ?? produtoAtual.codigo_barras,
      categoria_id: req.body.categoria_id ?? produtoAtual.categoria_id,
      preco_custo: req.body.preco_custo ?? produtoAtual.preco_custo,
      preco_venda: req.body.preco_venda ?? produtoAtual.preco_venda,
      quantidade_estoque: req.body.quantidade_estoque ?? produtoAtual.quantidade_estoque,
      estoque_minimo: req.body.estoque_minimo ?? produtoAtual.estoque_minimo,
      unidade_medida: req.body.unidade_medida ?? produtoAtual.unidade_medida,
    };

    const result = await db.query(
      `UPDATE produtos SET
         nome = $1, codigo_barras = $2, categoria_id = $3, preco_custo = $4,
         preco_venda = $5, quantidade_estoque = $6, estoque_minimo = $7, unidade_medida = $8
       WHERE id = $9
       RETURNING *`,
      [
        dados.nome, dados.codigo_barras, dados.categoria_id, dados.preco_custo,
        dados.preco_venda, dados.quantidade_estoque, dados.estoque_minimo, dados.unidade_medida, id,
      ]
    );

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    if (error.code === '22P02') {
      return res.status(400).json({ status: 'error', message: 'ID de produto inválido.' });
    }
    if (error.code === '23505') {
      return res.status(409).json({ status: 'error', message: 'Já existe um produto com esse código de barras.' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ status: 'error', message: 'categoria_id informado não existe.' });
    }
    console.error('Erro ao atualizar produto:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao atualizar produto.' });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM produtos WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Produto não encontrado.' });
    }

    return res.status(200).json({ status: 'ok', message: 'Produto removido com sucesso.', id: result.rows[0].id });
  } catch (error) {
    if (error.code === '22P02') {
      return res.status(400).json({ status: 'error', message: 'ID de produto inválido.' });
    }
    if (error.code === '23503') {
      return res.status(409).json({
        status: 'error',
        message: 'Não é possível excluir: este produto já possui vendas ou movimentações de estoque vinculadas.',
      });
    }
    console.error('Erro ao deletar produto:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao deletar produto.' });
  }
}

module.exports = { listar, alertaEstoque, buscarPorId, criar, atualizar, deletar };
