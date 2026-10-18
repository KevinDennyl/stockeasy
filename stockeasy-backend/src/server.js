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

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'StockEasy API está rodando. Consulte /api/health para status detalhado.' });
});

app.use(notFound);

app.listen(PORT, () => {
  console.log(`StockEasy API rodando em http://localhost:${PORT}`);
  console.log(`Health check disponível em http://localhost:${PORT}/api/health`);
});
