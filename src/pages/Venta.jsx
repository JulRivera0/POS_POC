// src/pages/Venta.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  fetchProductos,
  crearVenta,
} from '../services/api';

import {
  Box,
  Typography,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  InputAdornment,
  IconButton,
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
} from '@mui/material';

import {
  Search as SearchIcon,
  Delete,
  CameraAlt,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';

import Navigation from '../components/Navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Venta() {
  /* --------------------- estado --------------------- */
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState({}); // { id: qty }
  const [msg, setMsg] = useState('');
  const [scanOpen, setScanOpen] = useState(false);

  /* ---------------- carga de productos -------------- */
  useEffect(() => {
    fetchProductos().then(setProductos);
  }, []);

  /* ---------------- buscador ------------------------ */
  const productosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return [];
    return productos.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [busqueda, productos]);

  /* ---------------- carrito helpers ---------------- */
  const addToCart = (prod) =>
    setCarrito((prev) => ({
      ...prev,
      [prod.id]: (prev[prod.id] || 0) + 1,
    }));

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCarrito((prev) => ({ ...prev, [id]: qty }));
  };

  const removeFromCart = (id) =>
    setCarrito(({ [id]: _, ...rest }) => rest);

  const total = Object.entries(carrito).reduce((sum, [id, q]) => {
    const p = productos.find((pr) => pr.id === Number(id));
    return p ? sum + p.price * q : sum;
  }, 0);

  /* ---------------- finalizar venta ---------------- */
  const handleVenta = async () => {
    const items = Object.entries(carrito).map(([id, q]) => ({
      product_id: Number(id),
      quantity: q,
    }));
    if (!items.length) return;
    try {
      const res = await crearVenta(items);
      setMsg(`Venta registrada: $${Number(res.total).toFixed(2)}`);
      setCarrito({});
    } catch {
      setMsg('Error al registrar venta');
    }
  };

  /* ---------------- escáner ------------------------- */
  useEffect(() => {
    if (!scanOpen) return;

    const containerId = 'reader';
    // Delay breve para que el div esté en el DOM
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        containerId,
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        (decodedText) => {
          const prod = productos.find((p) => p.sku === decodedText);
          if (prod) addToCart(prod);
          scanner.clear().then(() => setScanOpen(false));
        },
        (err) => console.warn('Scan error', err)
      );
    }, 200);

    return () => clearTimeout(timer);
  }, [scanOpen, productos]);

  /* =================== UI ========================== */
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Venta
        </Typography>

        {/* buscador + icono cámara */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar o escribir SKU"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const prod = productos.find(
                  (p) =>
                    p.sku.toLowerCase() === busqueda.toLowerCase()
                );
                if (prod) {
                  addToCart(prod);
                  setBusqueda('');
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton color="primary" onClick={() => setScanOpen(true)}>
            <CameraAlt />
          </IconButton>
        </Box>

        {/* sugerencias */}
        {busqueda && productosFiltrados.length > 0 && (
          <Table size="small" sx={{ mb: 2 }}>
            <TableBody>
              {productosFiltrados.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    addToCart(p);
                    setBusqueda('');
                  }}
                >
                  <TableCell width={80}>{p.sku}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell width={70}>
                    ${Number(p.price).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* carrito */}
        <Typography variant="h6" gutterBottom>
          Carrito
        </Typography>
        {Object.keys(carrito).length === 0 ? (
          <Typography color="text.secondary">Sin productos</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell align="right">Cant</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(carrito).map(([id, qty]) => {
                const p = productos.find((pr) => pr.id === Number(id));
                if (!p) return null;
                return (
                  <TableRow key={id}>
                    <TableCell>{p.sku}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell align="right" width={80}>
                      <TextField
                        type="number"
                        size="small"
                        value={qty}
                        inputProps={{
                          min: 1,
                          style: { width: 60, textAlign: 'right' },
                        }}
                        onChange={(e) =>
                          updateQty(id, Number(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${Number(p.price * qty).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeFromCart(id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* total y cobrar */}
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">
            Total: ${total.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            startIcon={<CartIcon />}
            disabled={total === 0}
            onClick={handleVenta}
          >
            Cobrar
          </Button>
        </Box>
      </Box>

      <Navigation />

      {/* Snackbar */}
      <Snackbar
        open={!!msg}
        autoHideDuration={4000}
        onClose={() => setMsg('')}
        message={msg}
      />

      {/* Diálogo escáner */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={scanOpen}
        onClose={() => setScanOpen(false)}
      >
        <DialogTitle>Escanear código de barras</DialogTitle>
        <Box id="reader" sx={{ width: '100%', height: 320 }} />
      </Dialog>
    </Box>
  );
}
