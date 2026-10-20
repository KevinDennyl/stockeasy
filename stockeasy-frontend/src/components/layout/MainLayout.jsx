// ============================================================================
// src/components/layout/MainLayout.jsx
// Estrutura visual comum a todas as telas autenticadas: Sidebar fixa à
// esquerda + Header no topo + área de conteúdo rolável.
//
// O título/subtítulo do Header muda de acordo com a rota atual. Mantemos
// esse mapeamento aqui (em vez de duplicar em cada página) para o Header
// ficar sempre consistente e a página só precisar se preocupar com o
// próprio conteúdo.
// ============================================================================

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const TITULOS_POR_ROTA = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral do seu negócio' },
  '/produtos': { title: 'Produtos', subtitle: 'Catálogo e controle de estoque' },
  '/movimentacoes': { title: 'Movimentações', subtitle: 'Entradas e saídas manuais de estoque' },
  '/vendas': { title: 'Vendas', subtitle: 'Histórico de vendas realizadas' },
};

export default function MainLayout() {
  const location = useLocation();
  const { title, subtitle } = TITULOS_POR_ROTA[location.pathname] || {
    title: 'StockEasy',
    subtitle: undefined,
  };

  return (
    <div className="flex h-screen bg-paper">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
