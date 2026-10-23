import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { erro: null, pilha: '' };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error('Erro de renderização:', erro);
    this.setState({ pilha: info.componentStack });
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div role="alert" className="mx-auto mt-16 max-w-2xl rounded-xl border border-clay/30 bg-clay-light p-6 text-clay-dark">
        <h1 className="font-display text-xl font-semibold">Não foi possível carregar o StockEasy</h1>
        <p className="mt-2 text-sm">{String(this.state.erro.message)}</p>
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer">Detalhes técnicos</summary>
          <pre className="mt-2 whitespace-pre-wrap">{this.state.pilha}</pre>
        </details>
        <button type="button" className="btn btn-secondary mt-4" onClick={() => window.location.reload()}>
          Recarregar
        </button>
      </div>
    );
  }
}