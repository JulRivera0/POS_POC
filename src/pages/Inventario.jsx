// src/pages/Inventario.jsx
import { useEffect, useState, useMemo } from 'react';
import {
  fetchProductos, addProducto, editProducto, deleteProducto
} from '../services/api';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Fab, InputAdornment
} from '@mui/material';
import {
  ExpandMore,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import Navigation from '../components/Navigation';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', price: '', stock: '', category: ''
  });
  const [editId, setEditId] = useState(null);

  /* --- Carga productos --- */
  const cargar = async () => {
    const data = await fetchProductos();
    setProductos(Array.isArray(data) ? data : []);
  };
  useEffect(() => { cargar(); }, []);

  /* --- Guardar / eliminar --- */
  const resetForm = () => {
    setOpen(false);
    setForm({ name: '', sku: '', price: '', stock: '', category: '' });
    setEditId(null);
  };
  const handleSubmit = async () => {
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    editId ? await editProducto(editId, payload) : await addProducto(payload);
    await cargar();
    resetForm();
  };
  const handleEliminar = async () => {
    if (editId) {
      await deleteProducto(editId);
      await cargar();
      resetForm();
    }
  };

  /* --- Filtro de búsqueda (memoizado) --- */
  const productosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return productos;
    return productos.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.category ?? '').toLowerCase().includes(q)
    );
  }, [busqueda, productos]);

  /* --- Agrupación por categoría --- */
  const agrupados = productosFiltrados.reduce((acc, p) => {
    const cat = p.category || 'Sin categoría';
    acc[cat] ??= [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Contenido scrollable */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <Typography variant="h5" gutterBottom>Inventario</Typography>

        {/* Buscador */}
        <TextField
          fullWidth
          placeholder="Buscar por nombre, SKU o categoría"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {Object.entries(agrupados).map(([cat, prods]) => (
          <Accordion key={cat} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ fontWeight: 600 }}>{cat}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Table size="small">
                <TableBody>
                  {prods.map((p) => (
                    <TableRow
                      key={p.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setForm({
                          name: p.name,
                          sku: p.sku,
                          price: String(p.price),
                          stock: String(p.stock),
                          category: p.category ?? ''
                        });
                        setEditId(p.id);
                        setOpen(true);
                      }}
                    >
                      <TableCell width={80}>{p.sku}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell width={72}>${Number(p.price).toFixed(2)}</TableCell>
                      <TableCell width={60}>{p.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* FAB flotante */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => {
          setForm({ name: '', sku: '', price: '', stock: '', category: '' });
          setEditId(null);
          setOpen(true);
        }}
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 80,
          zIndex: 1300,
          boxShadow: 4
        }}
      >
        <AddIcon />
      </Fab>

      {/* Menú inferior */}
      <Navigation />

      {/* Diálogo alta / edición */}
      <Dialog open={open} onClose={resetForm} fullWidth>
        <DialogTitle>{editId ? 'Editar' : 'Nuevo'} producto</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="NAME" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="SKU" value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <TextField label="PRICE" type="number" inputProps={{ min: 0, step: '0.01' }}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <TextField label="STOCK" type="number" inputProps={{ min: 0, step: '1' }}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <TextField label="CATEGORY" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </DialogContent>
        <DialogActions>
          {editId && (
            <Button color="error" onClick={handleEliminar}>
              Eliminar
            </Button>
          )}
          <Button onClick={resetForm}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
