import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { Home, Store, ShoppingCart, BarChart, History } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const routes = ['/', '/venta', '/inventario', '/historial', '/reportes'];
  const navigate = useNavigate();
  const location = useLocation();

  const [value, setValue] = useState(routes.indexOf(location.pathname));

  useEffect(() => {
    setValue(routes.indexOf(location.pathname));
  }, [location.pathname]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 1200
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue);
          navigate(routes[newValue]);
        }}
        showLabels
      >
        <BottomNavigationAction label="Inicio"     icon={<Home />} />
        <BottomNavigationAction label="Venta"      icon={<ShoppingCart />} />
        <BottomNavigationAction label="Inventario" icon={<Store />} />
        <BottomNavigationAction label="Historial"  icon={<History />} />
        <BottomNavigationAction label="Reportes"   icon={<BarChart />} />
      </BottomNavigation>
    </Box>
  );
}
