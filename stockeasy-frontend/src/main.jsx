import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { UsuarioProvider } from './contexts/UsuarioContext.jsx';
import './index.css';
import { HashRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';

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