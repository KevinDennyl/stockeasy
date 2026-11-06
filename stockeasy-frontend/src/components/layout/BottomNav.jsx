// ============================================================================
// src/components/layout/BottomNav.jsx
// Barra de navegação fixa na base da tela, exibida em celulares e tablets
// (< 1024px). Fica ao alcance do polegar e cada item tem área de toque grande
// (mais de 48px de altura), pensada para operar o caixa com uma mão.
// ============================================================================

import { NavLink } from 'react-router-dom';
import { LINKS } from './links';

export default function BottomNav() {
  return (
    <nav aria-label="Navegação principal" className="shrink-0 border-t border-line bg-white lg:hidden">
      <ul className="flex">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="min-w-0 flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'relative flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[11px] font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-moss',
                  isActive ? 'text-moss' : 'text-ink-soft hover:text-ink',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {/* barrinha no topo do item ativo */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-1/2 top-0 h-0.5 w-10 -translate-x-1/2 rounded-full ${
                      isActive ? 'bg-moss' : 'bg-transparent'
                    }`}
                  />
                  <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
                  <span className="max-w-full truncate">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
