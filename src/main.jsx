import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// 1. Tema claro (puedes personalizar colores)
const theme = createTheme({
  palette: {
    mode: 'light',                 // <- modo claro
    primary: { main: '#1976d2' },  // color principal
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />   {/* reset & fondo según tema */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
