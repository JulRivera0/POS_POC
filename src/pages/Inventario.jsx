import { useEffect, useState } from 'react';
import {
  fetchProductos, addProducto, editProducto, deleteProducto
} from '../services/api';
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Table, TableBody, TableCell,
  TableHead, TableRow, Typography
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Navigation from '../components/Navigation';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', price: '', stock: '', category: ''
  });
  const [editId, setEditId] = useState(null);

  // --- Cargar productos ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProductos();
        console.log('Productos recibidos:', data);
        setProductos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar productos', err);
      }
    };
    fetchData();
  }, []);

  // --- Guardar (alta / edición) ---
  const handleSubmit = async () => {
    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock)
    };

    if (editId) await editProducto(editId, body);
    else await addProducto(body);

    // reset & recarga
    setOpen(false);
    setForm({ name: '', sku: '', price: '', stock: '', category: '' });
    setEditId(null);

    const data = await fetchProductos();
    setProductos(Array.isArray(data) ? data : []);
  };

  const handleDelete = async (id) => {
    await deleteProducto(id);
    const data = await fetchProductos();
    setProductos(Array.isArray(data) ? data : []);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Zona desplazable */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Inventario
        </Typography>

        <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
          Agregar producto
        </Button>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.sku}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{p.category ?? '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setForm(p); setEditId(p.id); setOpen(true); }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(p.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Barra inferior fija */}
      <Navigation />

      {/* Diálogo alta / edición */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editId ? 'Editar' : 'Nuevo'} producto</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {['name', 'sku', 'price', 'stock', 'category'].map((f) => (
            <TextField
              key={f}
              label={f.toUpperCase()}
              value={form[f] ?? ''}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
