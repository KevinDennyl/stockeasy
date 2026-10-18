// ============================================================================
// src/controllers/dashboard.controller.js
// Métricas gerais do negócio para a tela inicial (dashboard).
// ============================================================================

const db = require('../config/database');

// GET /api/dashboard/resumo
async function resumo(req, res) {
  try {
    // As 4 métricas são independentes entre si, então rodamos as queries em
    // paralelo com Promise.all em vez de aguardar uma de cada vez — reduz
    // o tempo total de resposta do endpoint.
    const [
      totalProdutosResult,
      valorEstoqueResult,
      totalVendasResult,
      estoqueBaixoResult,
    ] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS total FROM produtos'),

      // Valor total investido em estoque, pelo preço de custo
      // (quantidade_estoque * preco_custo de cada produto).
      db.query(
        `SELECT COALESCE(SUM(quantidade_estoque * preco_custo), 0)::numeric(12,2) AS total
         FROM produtos`
      ),

      db.query('SELECT COALESCE(SUM(valor_total), 0)::numeric(12,2) AS total FROM vendas'),

      db.query(
        `SELECT COUNT(*)::int AS total
         FROM produtos
         WHERE quantidade_estoque <= estoque_minimo`
      ),
    ]);

    return res.status(200).json({
      total_produtos: totalProdutosResult.rows[0].total,
      valor_total_estoque: Number(valorEstoqueResult.rows[0].total),
      total_vendas_valor: Number(totalVendasResult.rows[0].total),
      contagem_produtos_estoque_baixo: estoqueBaixoResult.rows[0].total,
    });
  } catch (error) {
    console.error('Erro ao calcular resumo do dashboard:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno ao calcular o resumo do dashboard.',
    });
  }
}

module.exports = { resumo };
