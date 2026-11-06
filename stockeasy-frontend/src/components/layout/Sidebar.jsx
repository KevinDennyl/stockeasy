// ============================================================================
// src/components/layout/Sidebar.jsx
// Navegação lateral fixa, exibida apenas em telas grandes (>= 1024px).
// Em telas menores a navegação fica na BottomNav.
// ============================================================================

import { NavLink } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { LINKS } from './links';

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-panel text-white lg:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <Boxes size={24} className="text-moss-light" strokeWidth={2} />
        <span className="font-display text-lg font-semibold tracking-tight">StockEasy</span>
      </div>

      <nav aria-label="Navegação principal" className="flex-1 space-y-1 px-3 py-2">
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

      <div className="border-t border-white/10 px-6 py-5 text-xs text-white/40">
        StockEasy · Gestão para MEIs
      </div>
    </aside>
  );
}
