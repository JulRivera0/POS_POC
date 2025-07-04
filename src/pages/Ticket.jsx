import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Divider,
  CircularProgress
} from '@mui/material';
import { fetchVenta } from '../services/api'; // helper centralizado

export default function Ticket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------- cargar venta ------- */
  useEffect(() => {
    fetchVenta(id)
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
        fontFamily: 'monospace'
      }}
    >
      {/* Encabezado */}
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

      {/* Detalle */}
      <Table size="small">
        <TableBody>
          {/* Encabezados de columna */}
          <TableRow>
            <TableCell><strong>Producto</strong></TableCell>
            <TableCell align="right"><strong>Cant</strong></TableCell>
            <TableCell align="right"><strong>Precio</strong></TableCell>
            <TableCell align="right"><strong>Subtotal</strong></TableCell>
          </TableRow>

          {/* Ítems */}
          {venta.items.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell><strong>{item.product_name}</strong></TableCell>
              <TableCell align="right">x{item.quantity}</TableCell>
              <TableCell align="right">
                ${Number(item.unit_price).toFixed(2)}
              </TableCell>
              <TableCell align="right">
                ${Number(item.subtotal).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}

          {/* Total */}
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

      {/* Acciones */}
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
