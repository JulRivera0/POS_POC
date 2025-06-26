import { useEffect, useState } from 'react';
import { fetchProductos, crearVenta } from '../services/api';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableBody, TableRow, TableCell, Snackbar
} from '@mui/material';
import Navigation from '../components/Navigation';

export default function Venta() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetchProductos().then(setProductos);
  }, []);

  const agregar = (prodId, cantidad) => {
    setCarrito(prev => ({
      ...prev,
      [prodId]: cantidad
    }));
  };

  const total = productos.reduce((sum, p) => {
    const qty = Number(carrito[p.id] || 0);
    return sum + qty * parseFloat(p.price);
  }, 0);

  const finalizarVenta = async () => {
    const items = Object.entries(carrito)
      .filter(([_, qty]) => qty > 0)
      .map(([pid, qty]) => ({ product_id: Number(pid), quantity: Number(qty) }));

    if (items.length === 0) return alert('Agrega productos al carrito');

    try {
      const res = await crearVenta(items);
      setMensaje(`Venta realizada. Total: $${res.total}`);
      setCarrito({});
    } catch (e) {
      alert('Error al registrar venta');
    }
  };

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      <Typography variant="h5">Venta</Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Cantidad</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productos.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>${Number(p.price).toFixed(2)}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  size="small"
                  value={carrito[p.id] || ''}
                  onChange={e => agregar(p.id, e.target.value)}
                  inputProps={{ min: 0, max: p.stock }}
                  sx={{ width: 60 }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography sx={{ mt: 2 }}>Total: ${total.toFixed(2)}</Typography>

      <Button variant="contained" onClick={finalizarVenta} sx={{ mt: 2 }}>
        Finalizar Venta
      </Button>

      <Snackbar
        open={!!mensaje}
        autoHideDuration={4000}
        message={mensaje}
        onClose={() => setMensaje('')}
      />

      <Navigation />
    </Box>
  );
}
