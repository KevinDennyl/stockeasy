// ============================================================================
// src/config/database.js
// Pool de conexões com o PostgreSQL (biblioteca "pg").
//
// Dois modos de configuração:
//  - NUVEM (Neon, Render, Railway...): uma única variável DATABASE_URL,
//    ex.: postgresql://usuario:senha@host/banco?sslmode=require
//  - LOCAL: variáveis separadas DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
//
// Se DATABASE_URL existir, ela tem prioridade. Bancos na nuvem exigem SSL.
// ============================================================================

const { Pool } = require('pg');
require('dotenv').config();

const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: true },
    }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const pool = new Pool(config);

pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexões do PostgreSQL:', err);
});

async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Retorna um client exclusivo do pool, para uso em transações manuais
 * (BEGIN / COMMIT / ROLLBACK) — ver vendas.controller.js.
 */
async function getClient() {
  return pool.connect();
}

module.exports = {
  pool,
  query,
  getClient,
};
