import { useEffect, useState } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Table, TableHead, TableBody, TableRow, TableCell, CircularProgress
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { fetchVentas } from '../services/api';
import Navigation from '../components/Navigation';

export default function Historial() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVentas().then((v) => {
      setVentas(v);
      setLoading(false);
    });
  }, []);

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

        {ventas.map((venta) => (
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
                  {/* Fila total */}
                  <TableRow>
                    <TableCell colSpan={2} align="right">
                      <strong>Total:</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${Number(venta.total).toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                  {/* Fila ganancia */}
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

        {ventas.length === 0 && (
          <Typography align="center" mt={4}>
            No hay ventas registradas
          </Typography>
        )}
      </Box>

      <Navigation />
    </Box>
  );
}
