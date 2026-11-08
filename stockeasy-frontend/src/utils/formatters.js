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

/**
 * Converte uma data "AAAA-MM-DD" em "DD/MM/AAAA" SEM passar por Date.
 * Passar por Date aplicaria o fuso horário e poderia mostrar o dia anterior.
 */
export function formatarDataISO(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '—';
}

/** Data de hoje (no relógio do aparelho) como "AAAA-MM-DD". */
export function hojeISO() {
  const d = new Date();
  const dois = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

/** Só a data (DD/MM/AAAA) de um instante, ex.: quando o fiado foi pago. */
export function formatarDataCurta(data) {
  return new Date(data).toLocaleDateString('pt-BR');
}
