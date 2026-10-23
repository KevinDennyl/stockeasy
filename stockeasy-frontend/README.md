# StockEasy - Frontend

Interface Web em React (Vite) + Tailwind CSS, consumindo a API REST do StockEasy.

## Como rodar

```bash
npm install
cp .env.example .env     # (se já tem um .env, só acrescente as duas linhas VITE_USUARIO_*)
npm run dev
```

Acesse **http://localhost:5173** (back-end rodando em `http://localhost:3000`).

### Troca de operador (usuário ativo)

No canto superior direito do Header há um seletor com todos os usuários do banco
(`GET /api/usuarios`). Ao trocar, a escolha é salva no `localStorage`
(`stockeasy_usuario_id`) e vale **na hora**, sem recarregar a página nem editar
o `.env`. Todas as vendas passam a ser registradas em nome do operador escolhido.

Como o usuário ativo é definido (nesta ordem):
1. o id salvo no navegador (escolha do operador);
2. `VITE_USUARIO_ID` no `.env` (opcional);
3. o primeiro usuário retornado pela API.

Ids que não existem mais no banco são descartados automaticamente. Se o sistema
estiver aberto em mais de uma aba, a troca de operador é sincronizada entre elas.

> ⚠️ Este seletor **não é autenticação**: qualquer pessoa com acesso à tela pode
> escolher qualquer usuário. Serve para identificar quem está operando o caixa
> em um ambiente de confiança (ex.: um balcão). Login com senha é o próximo passo.

**Requer o back-end atualizado** (este pacote inclui a nova rota `GET /api/usuarios`).

## O que cada tela faz

| Tela | Ações |
|---|---|
| **Produtos** | Listar, **Novo produto**, **Editar**, **Excluir** (com confirmação). Categorias podem ser criadas dentro do próprio formulário. |
| **Movimentações** | Histórico + **Nova movimentação** (produto, entrada/saída, quantidade, motivo). |
| **Vendas** | Histórico + **Nova venda** (checkout com vários itens e total em tempo real). |
| **Dashboard** | Métricas e tabela de alerta de estoque (do passo anterior). |

## Decisões de UX que valem conhecer

- **Estoque é somente leitura ao editar um produto.** Mexer na quantidade
  direto no produto não deixaria rastro no histórico. Para ajustar, use
  *Movimentações* — assim toda variação de estoque fica registrada.
- **Preço de venda abaixo do custo** gera um aviso, e acima dele o formulário
  mostra o lucro por unidade enquanto você digita.
- **Checkout:** o preço unitário vem preenchido com o preço de venda, mas é
  editável (descontos em feiras). Um produto não repete em duas linhas e
  produtos sem estoque ficam desabilitados.
- **Erro de estoque da trigger** (venda ou saída maior que o saldo) é
  traduzido: em vez de `Estoque insuficiente para o produto <uuid>...`, o
  usuário vê *"Estoque insuficiente de "Colar Lua de Prata": você pediu 10,
  mas só há 3 disponíveis."*. A venda inteira é desfeita no back-end
  (ROLLBACK), o carrinho é mantido e a lista de produtos é recarregada.
- **Excluir produto com histórico** (vendas/movimentações) é recusado pelo
  banco; a tela explica e sugere zerar o estoque em vez de excluir.
- **Enter no checkout** não finaliza a venda por acidente.
- Modais: foco automático, `Esc` fecha, foco preso dentro do modal e botões
  de ícone com `aria-label`.

## Estrutura de pastas

```
src/
├── contexts/UsuarioContext.jsx  # operador ativo (lista, seleção, sincronização)
├── utils/
│   ├── formatters.js            # moeda, data, arredondamento
│   ├── usuarioStorage.js        # localStorage do operador + fallbacks
│   └── erros.js                 # mensagens amigáveis de erro da API/trigger
├── services/                    # axios: api, dashboard, produtos, categorias,
│                                #        movimentacoes, vendas, usuarios
├── components/
│   ├── ui/                      # Modal, Campo, ConfirmDialog
│   ├── feedback/                # Carregando, Erro, Vazio, AvisoSucesso
│   ├── layout/                  # Sidebar, Header, MainLayout
│   ├── dashboard/               # MetricStrip, AlertaEstoqueTable
│   ├── produtos/ProdutoFormModal.jsx
│   ├── movimentacoes/MovimentacaoFormModal.jsx
│   └── vendas/NovaVendaModal.jsx
├── pages/                       # Dashboard, Produtos, Movimentacoes, Vendas
└── routes/AppRoutes.jsx
```
