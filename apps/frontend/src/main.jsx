import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider.jsx';
import { ThemeToggleFab } from './components/common/ThemeToggleFab.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <ThemeToggleFab />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
