// ============================================================================
// src/controllers/categorias.controller.js
// CRUD (parcial - listar e criar) do módulo de Categorias.
// ============================================================================

const db = require('../config/database');
const { isTextoValido } = require('../utils/validators');

async function listar(req, res) {
  try {
    const result = await db.query(
      'SELECT id, nome, descricao FROM categorias ORDER BY nome ASC'
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar categorias:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao listar categorias.' });
  }
}

async function criar(req, res) {
  try {
    const { nome, descricao } = req.body;

    if (!isTextoValido(nome)) {
      return res.status(400).json({
        status: 'error',
        message: 'O campo "nome" é obrigatório e não pode ser vazio.',
      });
    }

    const result = await db.query(
      `INSERT INTO categorias (nome, descricao) VALUES ($1, $2) RETURNING id, nome, descricao`,
      [nome.trim(), descricao ?? null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ status: 'error', message: 'Já existe uma categoria com esse nome.' });
    }
    console.error('Erro ao criar categoria:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erro interno ao criar categoria.' });
  }
}

module.exports = { listar, criar };
