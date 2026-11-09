import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { UsuarioProvider } from './contexts/UsuarioContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <UsuarioProvider>
          <App />
        </UsuarioProvider>
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
