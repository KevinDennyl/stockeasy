// ============================================================================
// src/controllers/vendas.controller.js
// Módulo de Vendas.
//
// IMPORTANTE sobre a trigger do banco:
// Ao inserir cada linha em "itens_venda", a trigger "trg_processa_item_venda"
// do PostgreSQL automaticamente:
//   - verifica se há estoque suficiente do produto (senão dispara EXCEPTION);
//   - calcula o "subtotal" (quantidade * preco_unitario);
//   - dá baixa em produtos.quantidade_estoque.
// Outra trigger ("trg_atualiza_valor_total_venda") recalcula
// vendas.valor_total automaticamente a cada item inserido.
// Ou seja: o controller NÃO precisa (e não deve) calcular subtotal, baixar
// estoque ou somar valor_total manualmente — isso já é responsabilidade do
// banco. O papel do controller é orquestrar a transação: se qualquer item
// falhar (ex.: estoque insuficiente), a venda inteira é desfeita (ROLLBACK),
// garantindo que nunca fique uma venda "pela metade".
// ============================================================================

const db = require('../config/database');
const {
  isTextoValido,
  isInteiroPositivo,
  isNumeroNaoNegativo,
} = require('../utils/validators');

// Valida o corpo da requisição de criação de venda.
// Retorna um array de mensagens de erro (vazio se estiver tudo certo).
function validarVenda(body) {
  const erros = [];
  const { usuario_id, itens } = body;

  if (!isTextoValido(usuario_id)) {
    erros.push('O campo "usuario_id" é obrigatório.');
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    erros.push('O campo "itens" deve ser um array com pelo menos um item de venda.');
    return erros; // sem itens, não há o que validar item a item
  }

  itens.forEach((item, index) => {
    if (!isTextoValido(item.produto_id)) {
      erros.push(`Item ${index + 1}: "produto_id" é obrigatório.`);
    }
    if (!isInteiroPositivo(item.quantidade)) {
      erros.push(`Item ${index + 1}: "quantidade" deve ser um número inteiro maior que zero.`);
    }
    if (!isNumeroNaoNegativo(item.preco_unitario)) {
      erros.push(`Item ${index + 1}: "preco_unitario" deve ser um número maior ou igual a zero.`);
    }
  });

  return erros;
}

// POST /api/vendas -> registra uma nova venda com seus itens, em uma transação
async function criar(req, res) {
  const erros = validarVenda(req.body);
  if (erros.length > 0) {
    return res.status(400).json({ status: 'error', message: erros.join(' ') });
  }

  const { usuario_id, itens } = req.body;

  // Pega um client EXCLUSIVO do pool: todos os comandos da transação
  // precisam rodar na mesma conexão.
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const vendaResult = await client.query(
      `INSERT INTO vendas (usuario_id) VALUES ($1) RETURNING id, usuario_id, data_venda, valor_total`,
      [usuario_id]
    );
    const venda = vendaResult.rows[0];

    // Insere cada item dentro da MESMA transação. Se algum insert falhar
    // (ex.: a trigger detectar estoque insuficiente), o catch abaixo faz
    // ROLLBACK de tudo, inclusive dos itens já inseridos com sucesso.
    for (const item of itens) {
      await client.query(
        `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)`,
        [venda.id, item.produto_id, item.quantidade, item.preco_unitario]
      );
    }

    await client.query('COMMIT');

    // Busca a venda já consolidada (valor_total atualizado pela trigger)
    // junto com os itens, para devolver a resposta completa ao cliente.
    const vendaFinal = await client.query(
      'SELECT id, usuario_id, data_venda, valor_total FROM vendas WHERE id = $1',
      [venda.id]
    );
    const itensFinal = await client.query(
      `SELECT iv.id, iv.produto_id, p.nome AS produto_nome, iv.quantidade, iv.preco_unitario, iv.subtotal
       FROM itens_venda iv
       JOIN produtos p ON p.id = iv.produto_id
       WHERE iv.venda_id = $1`,
      [venda.id]
    );

    return res.status(201).json({
      ...vendaFinal.rows[0],
      itens: itensFinal.rows,
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23503') {
      return res.status(400).json({ status: 'error', message: 'usuario_id informado não existe.' });
    }
    if (error.code === '22P02') {
      return res.status(400).json({ status: 'error', message: 'usuario_id ou produto_id em formato inválido.' });
    }
    // Exceções customizadas lançadas pela trigger de estoque (produto não
    // encontrado ou estoque insuficiente) chegam aqui como erro genérico do
    // Postgres, mas com a mensagem original que já é clara para o usuário.
    if (
      error.message &&
      (error.message.toLowerCase().includes('estoque insuficiente') ||
        error.message.toLowerCase().includes('não encontrado'))
    ) {
      return res.status(400).json({ status: 'error', message: error.message });
    }

    console.error('Erro ao registrar venda:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao registrar venda.' });
  } finally {
    // Sempre libera o client de volta para o pool, com sucesso ou erro.
    client.release();
  }
}

// GET /api/vendas -> lista o histórico de vendas, com nome do usuário
async function listar(req, res) {
  try {
    const result = await db.query(
      `SELECT
         v.id,
         v.usuario_id,
         u.nome AS usuario_nome,
         v.data_venda,
         v.valor_total
       FROM vendas v
       JOIN usuarios u ON u.id = v.usuario_id
       ORDER BY v.data_venda DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar vendas:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao listar vendas.' });
  }
}

// GET /api/vendas/:id -> detalhes de uma venda, com os itens associados
async function buscarPorId(req, res) {
  try {
    const { id } = req.params;

    const vendaResult = await db.query(
      `SELECT
         v.id,
         v.usuario_id,
         u.nome AS usuario_nome,
         v.data_venda,
         v.valor_total
       FROM vendas v
       JOIN usuarios u ON u.id = v.usuario_id
       WHERE v.id = $1`,
      [id]
    );

    if (vendaResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Venda não encontrada.' });
    }

    const itensResult = await db.query(
      `SELECT iv.id, iv.produto_id, p.nome AS produto_nome, iv.quantidade, iv.preco_unitario, iv.subtotal
       FROM itens_venda iv
       JOIN produtos p ON p.id = iv.produto_id
       WHERE iv.venda_id = $1
       ORDER BY p.nome ASC`,
      [id]
    );

    return res.status(200).json({
      ...vendaResult.rows[0],
      itens: itensResult.rows,
    });
  } catch (error) {
    if (error.code === '22P02') {
      return res.status(400).json({ status: 'error', message: 'ID de venda inválido.' });
    }
    console.error('Erro ao buscar venda:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao buscar venda.' });
  }
}

module.exports = { criar, listar, buscarPorId };
