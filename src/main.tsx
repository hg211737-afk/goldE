import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// In AI Studio preview environment, HMR is disabled and WebSockets are restricted.
// Suppress harmless Vite client WebSocket connection errors.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('WebSocket') ||
      event.message?.includes('createWebSocketModuleRunnerTransport') ||
      event.filename?.includes('@vite/client')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message?.includes('WebSocket') ||
      event.reason?.message?.includes('createWebSocketModuleRunnerTransport')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

// Register Service Worker for instant offline loading and PWA installation
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Fail gracefully in restricted sandbox environments
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
