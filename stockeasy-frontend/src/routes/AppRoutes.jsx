// ============================================================================
// src/routes/AppRoutes.jsx
// Mapeamento de rotas da aplicação. Todas as páginas ficam dentro de
// MainLayout, que fornece a Sidebar e o Header comuns a todas as telas.
// ============================================================================

import { Routes, Route, } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Produtos from '../pages/Produtos';
import Movimentacoes from '../pages/Movimentacoes';
import Vendas from '../pages/Vendas';

export default function AppRoutes() {
  return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/movimentacoes" element={<Movimentacoes />} />
          <Route path="/vendas" element={<Vendas />} />
        </Route>
      </Routes>
  );
}
