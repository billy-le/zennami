import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app'
import '@/assets/style.css';

const root = document.getElementById('root') as HTMLDivElement

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
root.classList.add('hydrated')
