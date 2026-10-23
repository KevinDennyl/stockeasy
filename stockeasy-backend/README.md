# StockEasy - Backend (API REST)

API REST em Node.js + Express, conectada ao PostgreSQL via `pg`.

## Estrutura de pastas

```
stockeasy-backend/
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── server.js
    ├── config/
    │   └── database.js              # Pool + getClient (para transações)
    ├── routes/
    │   ├── index.js
    │   ├── health.routes.js
    │   ├── categorias.routes.js
    │   ├── produtos.routes.js
    │   ├── movimentacoes.routes.js
    │   ├── vendas.routes.js
    │   ├── dashboard.routes.js
    │   └── usuarios.routes.js
    ├── controllers/
    │   ├── health.controller.js
    │   ├── categorias.controller.js
    │   ├── produtos.controller.js
    │   ├── movimentacoes.controller.js
    │   ├── vendas.controller.js
    │   ├── dashboard.controller.js
    │   └── usuarios.controller.js
    ├── middlewares/
    │   └── notFound.js
    └── utils/
        └── validators.js
```

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

## Endpoints disponíveis

### Health check
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Status da API e da conexão com o banco |

### Categorias
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/categorias` | Lista todas as categorias |
| POST | `/api/categorias` | Cria uma nova categoria |

### Produtos
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/produtos` | Lista todos os produtos, com `categoria_nome` via JOIN |
| GET | `/api/produtos/alerta-estoque` | Produtos com `quantidade_estoque <= estoque_minimo` |
| GET | `/api/produtos/:id` | Busca um produto pelo ID |
| POST | `/api/produtos` | Cadastra um novo produto |
| PUT | `/api/produtos/:id` | Atualiza um produto existente (parcial) |
| DELETE | `/api/produtos/:id` | Remove um produto |

### Movimentações de Estoque (manuais)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/movimentacoes` | Histórico de movimentações, com `produto_nome` via JOIN |
| POST | `/api/movimentacoes` | Registra ENTRADA ou SAIDA manual no estoque |

Corpo esperado no `POST /api/movimentacoes`:
```json
{
  "produto_id": "uuid-do-produto",
  "tipo": "ENTRADA",
  "quantidade": 10,
  "observacao": "Reposição de estoque - fornecedor A"
}
```
A trigger `trg_processa_movimentacao_estoque` do banco valida se há saldo
suficiente para uma `SAIDA` e já atualiza `produtos.quantidade_estoque`
automaticamente — o controller não faz esse cálculo, apenas insere o
registro e repassa o erro do banco caso a operação seja bloqueada.

### Vendas
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/vendas` | Registra uma nova venda com seus itens (transação) |
| GET | `/api/vendas` | Histórico de vendas, com `usuario_nome` e `valor_total` |
| GET | `/api/vendas/:id` | Detalhes de uma venda, com os itens associados |

Corpo esperado no `POST /api/vendas`:
```json
{
  "usuario_id": "uuid-do-usuario",
  "itens": [
    { "produto_id": "uuid-produto-1", "quantidade": 2, "preco_unitario": 29.90 },
    { "produto_id": "uuid-produto-2", "quantidade": 1, "preco_unitario": 24.90 }
  ]
}
```

**Como a transação funciona:** o controller pega um client exclusivo do
pool (`db.getClient()`) e executa `BEGIN`, insere a venda, insere cada item
de `itens` na mesma conexão e faz `COMMIT` no final. Se qualquer item
falhar — por exemplo, a trigger do banco recusar um item por estoque
insuficiente — o `catch` executa `ROLLBACK`, desfazendo a venda inteira e
os itens já inseridos até ali, para nunca deixar uma venda "pela metade".
O `client.release()` roda sempre no `finally`, com sucesso ou erro.
A baixa de estoque, o cálculo de `subtotal` e a atualização de
`vendas.valor_total` continuam sendo feitos pelas triggers do PostgreSQL
(criadas no Passo 1) — o controller só orquestra a transação.

### Dashboard
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/dashboard/resumo` | Métricas gerais do negócio |

Resposta de exemplo:
```json
{
  "total_produtos": 5,
  "valor_total_estoque": 612.50,
  "total_vendas_valor": 149.60,
  "contagem_produtos_estoque_baixo": 1
}
```
- `valor_total_estoque` é calculado como `SUM(quantidade_estoque * preco_custo)`
  — ou seja, o valor investido no estoque atual, pelo preço de custo.
- `contagem_produtos_estoque_baixo` conta produtos com
  `quantidade_estoque <= estoque_minimo`.
- As 4 métricas são buscadas em paralelo com `Promise.all` para reduzir o
  tempo de resposta.

### Usuários
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/usuarios` | Lista `id` e `nome` dos usuários (alimenta o seletor de operador do front-end) |

Por segurança, a resposta **não** inclui `senha_hash` nem `email`. Quando houver
autenticação, esta rota deve passar a exigir login.

### Validações e tratamento de erros
- `nome` (categorias/produtos), `usuario_id`, `produto_id`: obrigatórios,
  não podem ser vazios.
- `preco_custo`, `preco_venda`, `preco_unitario`: números `>= 0`.
- `quantidade_estoque`, `estoque_minimo`: inteiros `>= 0`.
- `quantidade` (movimentações e itens de venda): inteiro `> 0`.
- `tipo` (movimentações): precisa ser `"ENTRADA"` ou `"SAIDA"`.
- Erros do Postgres traduzidos em respostas HTTP: `23505` (duplicado) → 409,
  `23503` (chave estrangeira inválida) → 400, `22P02` (UUID inválido) → 400.
  Exceções customizadas das triggers (estoque insuficiente, produto não
  encontrado) → 400, com a mensagem original do banco.

### Observação sobre a ordem das rotas
Em `produtos.routes.js`, `GET /produtos/alerta-estoque` está registrada
**antes** de `GET /produtos/:id` — o Express avalia rotas na ordem
declarada, então se `:id` viesse primeiro capturaria `"alerta-estoque"`
como se fosse um ID.

## Testando rapidamente (exemplos com curl)

```bash
# Registrar entrada manual de estoque
curl -X POST http://localhost:3000/api/movimentacoes \
  -H "Content-Type: application/json" \
  -d '{"produto_id": "UUID_DO_PRODUTO", "tipo": "ENTRADA", "quantidade": 10, "observacao": "Reposição"}'

# Registrar uma venda com 2 itens
curl -X POST http://localhost:3000/api/vendas \
  -H "Content-Type: application/json" \
  -d '{"usuario_id": "UUID_DO_USUARIO", "itens": [{"produto_id": "UUID_PRODUTO_1", "quantidade": 2, "preco_unitario": 29.9}]}'

# Ver o resumo do dashboard
curl http://localhost:3000/api/dashboard/resumo
```
