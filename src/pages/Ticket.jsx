import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableRow, TableCell,
  Button, Divider, CircularProgress
} from '@mui/material';

export default function Ticket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/sales/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setVenta(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" mt={2}>
          Cargando ticket…
        </Typography>
      </Box>
    );
  }

  if (!venta) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Ticket no encontrado
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 400,
        m: '0 auto',
        p: 3,
        border: '1px solid #ccc',
        borderRadius: 2,
        bgcolor: '#fff',
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        Punto de Venta
      </Typography>

      <Typography align="center" fontSize={14}>
        Ticket #{venta.id}
      </Typography>
      <Typography align="center" fontSize={13} gutterBottom>
        {new Date(venta.timestamp).toLocaleString()}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Table size="small">
        <TableBody>
          {venta.items.map((it, idx) => {
            // fallback si unit_price no viene:
            const unit = it.unit_price ?? it.subtotal / it.quantity;
            return (
              <TableRow key={idx}>
                <TableCell>
                  <strong>{it.product_name}</strong>
                </TableCell>
                <TableCell align="right">x{it.quantity}</TableCell>
                <TableCell align="right">
                  ${Number(unit).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  ${Number(it.subtotal).toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell colSpan={3}>
              <Typography align="right" fontWeight="bold">
                Total:
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography fontWeight="bold">
                ${Number(venta.total).toFixed(2)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
        <Button fullWidth variant="outlined" onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button fullWidth variant="contained" onClick={() => window.print()}>
          Imprimir
        </Button>
      </Box>
    </Box>
  );
}
