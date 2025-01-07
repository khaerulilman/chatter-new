import React from 'react'; // Pastikan untuk mengimpor React
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Pastikan elemen dengan id 'root' ada di file HTML Anda
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement); // Membuat root
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}
