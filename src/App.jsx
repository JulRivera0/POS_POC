import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import PrivateRoute from "./auth/PrivateRoute";

import Login from "./auth/Login";
import Register from "./auth/Register";
import Home from "./pages/Home";
import Inventario from "./pages/Inventario";
import Venta from "./pages/Venta";
import Historial from "./pages/Historial";
import Reportes from "./pages/Reportes";
import Ticket from "./pages/Ticket";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/inventario" element={<PrivateRoute><Inventario /></PrivateRoute>} />
          <Route path="/venta" element={<PrivateRoute><Venta /></PrivateRoute>} />
          <Route path="/historial" element={<PrivateRoute><Historial /></PrivateRoute>} />
          <Route path="/reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
          <Route path="/ticket/:id" element={<PrivateRoute><Ticket /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
