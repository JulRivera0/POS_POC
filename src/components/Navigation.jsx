import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { Home, Store, ShoppingCart, BarChart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navigation() {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const routes = ['/', '/venta', '/inventario', '/reportes'];
    navigate(routes[newValue]);
  };

  return (
    <BottomNavigation value={value} onChange={handleChange} showLabels>
      <BottomNavigationAction label="Inicio" icon={<Home />} />
      <BottomNavigationAction label="Venta" icon={<ShoppingCart />} />
      <BottomNavigationAction label="Inventario" icon={<Store />} />
      <BottomNavigationAction label="Reportes" icon={<BarChart />} />
    </BottomNavigation>
  );
}
