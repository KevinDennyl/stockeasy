// ============================================================================
// src/pages/Dashboard.jsx
// Tela inicial: métricas gerais (/api/dashboard/resumo) e a lista de
// produtos que precisam de reposição (/api/produtos/alerta-estoque).
// ============================================================================

import { useEffect, useState } from 'react';
import { buscarResumo } from '../services/dashboardService';
import { listarAlertaEstoque } from '../services/produtosService';
import MetricStrip from '../components/dashboard/MetricStrip';
import AlertaEstoqueTable from '../components/dashboard/AlertaEstoqueTable';
import EstadoCarregando from '../components/feedback/EstadoCarregando';
import EstadoErro from '../components/feedback/EstadoErro';

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      setErro(null);
      try {
        // As duas chamadas são independentes, então rodam em paralelo.
        const [dadosResumo, dadosAlertas] = await Promise.all([
          buscarResumo(),
          listarAlertaEstoque(),
        ]);
        setResumo(dadosResumo);
        setAlertas(dadosAlertas);
      } catch (err) {
        setErro(err.response?.data?.message || 'Não foi possível carregar o dashboard.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  if (carregando) {
    return <EstadoCarregando texto="Carregando dashboard..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} />;
  }

  return (
    <div className="space-y-8">
      <MetricStrip resumo={resumo} />

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          Alerta de estoque
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Produtos com quantidade em estoque igual ou abaixo do mínimo definido.
        </p>
        <div className="mt-4">
          <AlertaEstoqueTable produtos={alertas} />
        </div>
      </section>
    </div>
  );
}
