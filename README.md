# StockEasy - Sistema de Gestão de Estoque e Vendas para MEIs

O **StockEasy** é uma solução *full-stack* desenvolvida para simplificar o controle de estoque, registro de movimentações e gestão de vendas para Microempreendedores Individuais (MEIs). O sistema conta com suporte a múltiplos operadores de caixa em tempo real, dashboard de indicadores e controle dinâmico de produtos.

---

## 🛠️ Tecnologias Utilizadas

### **Front-end**
- **React.js** (com Vite)
- **Tailwind CSS** (Interface e estilização)
- **Lucide React** (Ícones)
- **Axios** (Consumo da API REST)

### **Back-end**
- **Node.js** com **Express**
- **PostgreSQL** (Banco de Dados Relacional)
- **node-postgres (`pg`)** (Driver de conexão)
- **Dotenv** & **CORS**

---

## 📁 Estrutura do Projeto

```text
stockeasy/
├── stockeasy-backend/     # API REST em Node.js/Express e conexão com PostgreSQL
├── stockeasy-frontend/    # Interface do usuário em React e Tailwind CSS
└── README.md              # Documentação principal do repositório