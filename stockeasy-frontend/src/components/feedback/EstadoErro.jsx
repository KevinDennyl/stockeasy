// ============================================================================
// src/components/feedback/EstadoErro.jsx
// Mensagem de erro padrão: dizer o que aconteceu e o que fazer a seguir.
// role="alert" faz leitores de tela anunciarem o erro assim que aparece.
// ============================================================================

export default function EstadoErro({ mensagem }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-clay/30 bg-clay-light px-4 py-3 text-sm text-clay-dark"
    >
      {mensagem ||
        'Não foi possível carregar os dados. Verifique se o back-end está rodando em http://localhost:3000 e tente novamente.'}
    </div>
  );
}
