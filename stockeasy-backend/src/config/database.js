// ============================================================================
// src/config/database.js
// Configura o Pool de conexões com o PostgreSQL usando a biblioteca "pg".
// O Pool reutiliza conexões abertas em vez de criar uma nova a cada query.
//
// Além da função "query" (para queries avulsas), exportamos também
// "getClient", que empresta um client exclusivo do pool. Isso é necessário
// para rodar transações (BEGIN/COMMIT/ROLLBACK), já que todas as queries de
// uma mesma transação precisam usar a MESMA conexão — usar "pool.query"
// diretamente poderia distribuir os comandos entre conexões diferentes.
// ============================================================================

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexões do PostgreSQL:', err);
});

async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Retorna um client exclusivo do pool, para uso em transações manuais.
 * Uso:
 *   const client = await db.getClient();
 *   try {
 *     await client.query('BEGIN');
 *     ...
 *     await client.query('COMMIT');
 *   } catch (e) {
 *     await client.query('ROLLBACK');
 *     throw e;
 *   } finally {
 *     client.release();
 *   }
 */
async function getClient() {
  return pool.connect();
}

module.exports = {
  pool,
  query,
  getClient,
};
