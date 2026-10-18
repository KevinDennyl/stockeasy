// ============================================================================
// src/utils/validators.js
// Funções de validação reutilizáveis entre os controllers.
// ============================================================================

function isNumeroNaoNegativo(valor) {
  if (valor === undefined || valor === null || valor === '') return false;
  const numero = Number(valor);
  return !Number.isNaN(numero) && numero >= 0;
}

function isInteiroNaoNegativo(valor) {
  if (valor === undefined || valor === null || valor === '') return false;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 0;
}

function isInteiroPositivo(valor) {
  if (valor === undefined || valor === null || valor === '') return false;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0;
}

function isTextoValido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

module.exports = {
  isNumeroNaoNegativo,
  isInteiroNaoNegativo,
  isInteiroPositivo,
  isTextoValido,
};
