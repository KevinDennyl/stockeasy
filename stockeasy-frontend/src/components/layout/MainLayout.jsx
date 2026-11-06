// ============================================================================
// src/components/layout/MainLayout.jsx
// Estrutura visual comum a todas as telas.
//
//  - Telas grandes (>= 1024px): Sidebar à esquerda + Header + conteúdo.
//  - Celular/tablet (< 1024px): Header no topo, conteúdo rolável e a
//    BottomNav fixa na base.
//
// "h-dvh" usa a altura REAL visível do celular (descontando a barra de
// endereço do navegador). Com "h-screen" a barra inferior ficaria escondida
// atrás da interface do navegador.
// ============================================================================

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import BannerDemo from './BannerDemo';

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
    <div className="flex h-dvh bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <BannerDemo />
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
