// ============================================================================
// src/utils/telefone.js
// Telefone brasileiro: guardado só com dígitos (DDD + número) e mostrado com
// máscara, ex.: (11) 98765-4321.
// ============================================================================

/** Só dígitos, sem o código do país (55) e no máximo 11 dígitos. */
export function normalizarTelefone(texto) {
  let digitos = String(texto ?? '').replace(/\D/g, '');
  if (digitos.length > 11 && digitos.startsWith('55')) digitos = digitos.slice(2);
  return digitos.slice(0, 11);
}

/** Aplica a máscara enquanto a pessoa digita (aceita celular e fixo). */
export function formatarTelefone(texto) {
  const d = normalizarTelefone(texto);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

/** Endereço "tel:" para ligar com um toque no celular. */
export function linkDeLigacao(texto) {
  return `tel:+55${normalizarTelefone(texto)}`;
}
