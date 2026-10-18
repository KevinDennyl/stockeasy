// ============================================================================
// src/controllers/movimentacoes.controller.js
// Movimentações MANUAIS de estoque (ajustes, compras, perdas, devoluções),
// independentes do fluxo de vendas.
//
// A validação de "SAIDA maior que o estoque disponível" e a atualização de
// produtos.quantidade_estoque já são feitas pela trigger
// "trg_processa_movimentacao_estoque" no PostgreSQL. Aqui só inserimos o
// registro e tratamos o erro que a trigger dispara (RAISE EXCEPTION) caso
// a operação não seja permitida.
// ============================================================================

const db = require('../config/database');
const { isTextoValido, isInteiroPositivo } = require('../utils/validators');

const TIPOS_VALIDOS = ['ENTRADA', 'SAIDA'];

// GET /api/movimentacoes -> histórico de movimentações, com nome do produto
async function listar(req, res) {
  try {
    const result = await db.query(
      `SELECT
         m.id,
         m.produto_id,
         p.nome AS produto_nome,
         m.tipo,
         m.quantidade,
         m.observacao,
         m.data_movimentacao
       FROM movimentacoes_estoque m
       JOIN produtos p ON p.id = m.produto_id
       ORDER BY m.data_movimentacao DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar movimentações:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno ao listar movimentações de estoque.',
    });
  }
}

// POST /api/movimentacoes -> registra uma entrada ou saída manual de estoque
async function criar(req, res) {
  try {
    const { produto_id, tipo, quantidade, observacao } = req.body;

    const erros = [];
    if (!isTextoValido(produto_id)) {
      erros.push('O campo "produto_id" é obrigatório.');
    }
    if (!isTextoValido(tipo) || !TIPOS_VALIDOS.includes(tipo)) {
      erros.push('O campo "tipo" deve ser "ENTRADA" ou "SAIDA".');
    }
    if (!isInteiroPositivo(quantidade)) {
      erros.push('O campo "quantidade" deve ser um número inteiro maior que zero.');
    }
    if (erros.length > 0) {
      return res.status(400).json({ status: 'error', message: erros.join(' ') });
    }

    const result = await db.query(
      `INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, observacao)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [produto_id, tipo, quantidade, observacao ?? null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    // Código 23503 = produto_id não existe (violação de FK)
    if (error.code === '23503') {
      return res.status(400).json({ status: 'error', message: 'produto_id informado não existe.' });
    }
    if (error.code === '22P02') {
      return res.status(400).json({ status: 'error', message: 'produto_id inválido.' });
    }

    // A trigger do banco lança uma exceção customizada quando a SAIDA é
    // maior que o estoque disponível. O Postgres reporta isso como um erro
    // "raised exception" (sem SQLSTATE de uma constraint padrão), então
    // repassamos a mensagem original, que já vem clara para o usuário final.
    if (error.message && error.message.toLowerCase().includes('não permitida')) {
      return res.status(400).json({ status: 'error', message: error.message });
    }

    console.error('Erro ao registrar movimentação:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno ao registrar movimentação de estoque.',
    });
  }
}

module.exports = { listar, criar };
