// ============================================================================
// src/routes/AppRoutes.jsx
// Mapeamento de rotas.
//  - /login: pública;
//  - todo o resto: dentro de RotaProtegida (exige login) e do MainLayout
//    (Sidebar/BottomNav + Header).
// ============================================================================

import { Routes, Route, Navigate } from 'react-router-dom';
import RotaProtegida from './RotaProtegida';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Produtos from '../pages/Produtos';
import Movimentacoes from '../pages/Movimentacoes';
import Vendas from '../pages/Vendas';
import Fiados from '../pages/Fiados';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RotaProtegida />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/movimentacoes" element={<Movimentacoes />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/fiados" element={<Fiados />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
