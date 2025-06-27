import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Venta from './pages/Venta';
import Inventario from './pages/Inventario';
import Reportes from './pages/Reportes';
import Historial from './pages/Historial';
import Ticket from './pages/Ticket';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/venta"      element={<Venta />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/historial"  element={<Historial />} />   {/* ← aquí */}
        <Route path="/reportes"   element={<Reportes />} />
        <Route path="/ticket/:id" element={<Ticket />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
