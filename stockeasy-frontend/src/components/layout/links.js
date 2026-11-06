// ============================================================================
// src/components/layout/links.js
// Itens de navegação compartilhados pela Sidebar (desktop) e pela
// BottomNav (celular/tablet), para as duas ficarem sempre iguais.
// ============================================================================

import { LayoutDashboard, Package, ArrowLeftRight, ShoppingCart } from 'lucide-react';

export const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/movimentacoes', label: 'Movimentações', icon: ArrowLeftRight },
  { to: '/vendas', label: 'Vendas', icon: ShoppingCart },
];
