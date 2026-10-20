// ============================================================================
// src/utils/erros.js
// Converte erros do Axios/back-end em mensagens amigáveis para o usuário.
// ============================================================================

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Extrai a mensagem de um erro do Axios. Se o back-end respondeu com
 * { message }, usa ela; se nem chegou a responder (servidor desligado,
 * sem rede), explica isso; caso contrário usa o texto padrão informado.
 */
export function extrairMensagemErro(err, padrao = 'Algo deu errado. Tente novamente.') {
  if (err?.response?.data?.message) return err.response.data.message;
  if (!err?.response) {
    return 'Não foi possível conectar ao servidor. Confira se o back-end está rodando em http://localhost:3000.';
  }
  return padrao;
}

/**
 * A trigger do PostgreSQL recusa vendas/saídas sem estoque com um texto
 * técnico, tipo:
 *   "Estoque insuficiente para o produto <uuid>. Disponível: 3, solicitado: 10."
 * Esta função troca o UUID pelo nome do produto e reescreve a frase em
 * linguagem natural. Mensagens que não seguem esse padrão voltam como vieram.
 */
export function traduzirErroEstoque(mensagem, produtos = []) {
  if (typeof mensagem !== 'string') return mensagem;

  const dados = /dispon[ií]vel:\s*(\d+)\D+solicitado:\s*(\d+)/i.exec(mensagem);
  if (!dados) return mensagem;

  const disponivel = Number(dados[1]);
  const solicitado = Number(dados[2]);
  const idProduto = UUID_REGEX.exec(mensagem)?.[0];
  const produto = produtos.find((p) => p.id === idProduto);
  const nome = produto ? `"${produto.nome}"` : 'um dos produtos';

  if (disponivel === 0) {
    return `Não há estoque de ${nome} no momento. Remova o item ou registre uma entrada de estoque antes de continuar.`;
  }

  return `Estoque insuficiente de ${nome}: você pediu ${solicitado}, mas só há ${disponivel} ${
    disponivel === 1 ? 'disponível' : 'disponíveis'
  }. Ajuste a quantidade e tente novamente.`;
}
