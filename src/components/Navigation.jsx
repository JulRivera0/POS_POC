import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { Home, Store, ShoppingCart, BarChart, History } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // rutas en el mismo orden que los botones
  const routes = ['/', '/venta', '/inventario', '/historial', '/reportes'];

  // calcula el índice según la URL actual para que el highlight sea correcto
  const [value, setValue] = useState(routes.indexOf(location.pathname));

  useEffect(() => {
    setValue(routes.indexOf(location.pathname));
  }, [location.pathname]);

  const handleChange = (_, newValue) => {
    setValue(newValue);
    navigate(routes[newValue]);
  };

  return (
    <BottomNavigation value={value} onChange={handleChange} showLabels>
      <BottomNavigationAction label="Inicio"     icon={<Home />} />
      <BottomNavigationAction label="Venta"      icon={<ShoppingCart />} />
      <BottomNavigationAction label="Inventario" icon={<Store />} />
      <BottomNavigationAction label="Historial"  icon={<History />} />
      <BottomNavigationAction label="Reportes"   icon={<BarChart />} />
    </BottomNavigation>
  );
}