// ============================================================================
// src/utils/formatters.js
// Funções de formatação compartilhadas entre as páginas e componentes.
// ============================================================================

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(valor) || 0
  );
}

export function formatarData(data) {
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Arredonda para 2 casas decimais, evitando erros de ponto flutuante
// (ex.: 0.1 * 3 = 0.30000000000000004) nos cálculos de subtotal e total.
export function arredondarMoeda(valor) {
  return Math.round((Number(valor) || 0) * 100) / 100;
}
