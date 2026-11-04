// ============================================================================
// src/server.js
// Cria a aplicação Express, configura os middlewares globais, registra
// as rotas e sobe o servidor.
// ============================================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const notFound = require('./middlewares/notFound');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: em produção, defina CORS_ORIGIN com o endereço do front-end (sem
// barra no final e sem caminho), ex.: https://stockeasy.onrender.com
// Aceita vários endereços separados por vírgula. Sem CORS_ORIGIN (uso local),
// qualquer origem é aceita.
const origensPermitidas = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean);

app.use(cors(origensPermitidas.length > 0 ? { origin: origensPermitidas } : undefined));
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'StockEasy API está rodando. Consulte /api/health para status detalhado.' });
});

app.use(notFound);

app.listen(PORT, () => {
  console.log(`StockEasy API rodando na porta ${PORT}`);
  if (origensPermitidas.length > 0) {
    console.log(`CORS liberado para: ${origensPermitidas.join(', ')}`);
  }
});
