// ============================================================================
// src/components/layout/Sidebar.jsx
// Navegação lateral fixa. Fundo verde-floresta escuro para diferenciar
// claramente a área de navegação do conteúdo (fundo claro).
// ============================================================================

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowLeftRight, ShoppingCart, Boxes } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/movimentacoes', label: 'Movimentações', icon: ArrowLeftRight },
  { to: '/vendas', label: 'Vendas', icon: ShoppingCart },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-panel text-white flex flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <Boxes size={24} className="text-moss-light" strokeWidth={2} />
        <span className="font-display text-lg font-semibold tracking-tight">
          StockEasy
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-moss text-white'
                  : 'text-white/70 hover:bg-panel-soft hover:text-white',
              ].join(' ')
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 text-xs text-white/40 border-t border-white/10">
        StockEasy · Gestão para MEIs
      </div>
    </aside>
  );
}
