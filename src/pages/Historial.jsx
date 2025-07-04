import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Table, TableHead, TableBody, TableRow, TableCell, CircularProgress,
  TextField, InputAdornment, Divider
} from '@mui/material';
import { ExpandMore, CalendarToday } from '@mui/icons-material';
import { fetchVentas } from '../services/api';
import Navigation from '../components/Navigation';

/* util para obtener YYYY-MM-DD */
const dateKey = (iso) => iso.slice(0, 10);

export default function Historial() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dia, setDia] = useState('');            // formato YYYY-MM

  /* cargar ventas una vez */
  useEffect(() => {
    fetchVentas().then((v) => {
      setVentas(v);
      setLoading(false);
    });
  }, []);

  /* filtrar ventas por día elegido */
  const ventasFiltradas = useMemo(() => {
    if (!dia) return ventas;
    return ventas.filter((v) => dateKey(v.timestamp) === dia);
  }, [ventas, dia]);

  /* resumen del día */
  const resumen = useMemo(() => {
    return ventasFiltradas.reduce(
      (acc, v) => {
        acc.total += Number(v.total);
        acc.cost  += Number(v.cost);
        return acc;
      },
      { total: 0, cost: 0 }
    );
  }, [ventasFiltradas]);

  const gananciaTotal = resumen.total - resumen.cost;

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Cargando historial…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto', pb: 8 }}>
        <Typography variant="h5" gutterBottom>Historial de Ventas</Typography>

        {/* Selector de día */}
        <TextField
          type="date"
          size="small"
          label="Elegir día"
          value={dia}
          onChange={(e) => setDia(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, width: 220 }}
        />

        {ventasFiltradas.map((venta) => (
          <Accordion key={venta.id}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>
                Venta #{venta.id} – {new Date(venta.timestamp).toLocaleString()} – Total: ${Number(venta.total).toFixed(2)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Producto</strong></TableCell>
                    <TableCell align="right"><strong>Cantidad</strong></TableCell>
                    <TableCell align="right"><strong>Subtotal</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {venta.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${Number(item.subtotal).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} align="right">
                      <strong>Total:</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${Number(venta.total).toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} align="right">
                      <strong>Ganancia:</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${Number(venta.total - venta.cost).toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        ))}

        {ventasFiltradas.length === 0 && (
          <Typography align="center" mt={4}>
            No hay ventas para el día seleccionado
          </Typography>
        )}

        {/* Resumen diario */}
        {ventasFiltradas.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6">Resumen del día</Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>Ingresos:</strong></TableCell>
                  <TableCell align="right">
                    ${resumen.total.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Costos:</strong></TableCell>
                  <TableCell align="right">
                    ${resumen.cost.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Ganancia:</strong></TableCell>
                  <TableCell align="right">
                    ${gananciaTotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        )}
      </Box>

      <Navigation />
    </Box>
  );
}
