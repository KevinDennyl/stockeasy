// ============================================================================
// src/components/layout/links.js
// Itens de navegação compartilhados pela Sidebar (desktop) e pela
// BottomNav (celular/tablet), para as duas ficarem sempre iguais.
// ============================================================================

import { LayoutDashboard, Package, ArrowLeftRight, ShoppingCart, BookOpen } from 'lucide-react';

// rotuloCurto: versão do nome usada na barra inferior do celular, onde cada
// item tem só ~70px de largura (5 itens em uma tela de 360px).
export const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/movimentacoes', label: 'Movimentações', rotuloCurto: 'Movimentos', icon: ArrowLeftRight },
  { to: '/vendas', label: 'Vendas', icon: ShoppingCart },
  { to: '/fiados', label: 'Fiados', icon: BookOpen },
];
