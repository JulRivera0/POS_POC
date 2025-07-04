import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid,
  Button, List, ListItem, ListItemText
} from '@mui/material';
import { fetchVentas, fetchProductos } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const dateKey = (iso) => iso.slice(0, 10);

export default function Home() {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetchVentas().then(setVentas);
    fetchProductos().then(setProductos);
  }, []);

  const hoy = new Date().toISOString().slice(0, 10);

  const ventasDeHoy = useMemo(() => {
    return ventas.filter(v => dateKey(v.timestamp) === hoy);
  }, [ventas]);

  const resumen = useMemo(() => {
    const total = ventasDeHoy.reduce((sum, v) => sum + Number(v.total), 0);
    const cost  = ventasDeHoy.reduce((sum, v) => sum + Number(v.cost), 0);
    const ganancia = total - cost;
    const promedio = ventasDeHoy.length ? total / ventasDeHoy.length : 0;
    return { total, cost, ganancia, promedio };
  }, [ventasDeHoy]);

  const stockBajo = productos.filter(p => p.stock <= 5);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, p: 2, pb: 8 }}>
        <Typography variant="h5" gutterBottom>Resumen del Día</Typography>

        {/* KPIs */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Ventas hoy</Typography>
                <Typography variant="h6">{ventasDeHoy.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Ingresos</Typography>
                <Typography variant="h6">${resumen.total.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Ganancia</Typography>
                <Typography variant="h6">${resumen.ganancia.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Ticket promedio</Typography>
                <Typography variant="h6">${resumen.promedio.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Inventario bajo */}
        <Typography variant="h6" mt={4} mb={1}>Stock bajo</Typography>
        {stockBajo.length === 0 ? (
          <Typography color="text.secondary">Todo en orden</Typography>
        ) : (
          <List dense>
            {stockBajo.map((p) => (
              <ListItem key={p.id}>
                <ListItemText
                  primary={p.name}
                  secondary={`Stock: ${p.stock}`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Acceso rápido */}
        <Box mt={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => navigate('/venta')}
          >
            Ir a Venta Rápida
          </Button>
        </Box>
      </Box>

      <Navigation />
    </Box>
  );
}
