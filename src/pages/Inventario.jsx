import { useEffect, useState } from 'react';
import {
  fetchProductos, addProducto, editProducto, deleteProducto
} from '../services/api';
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, Typography
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Navigation from '../components/Navigation';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({name:'',sku:'',price:'',stock:'',category:''});
  const [editId, setEditId] = useState(null);

  const cargar = () => {
    setCargando(true);
    fetchProductos()
      .then(data => { setProductos(Array.isArray(data) ? data : []); setError(''); })
      .catch(err => { console.error(err); setError('Error al cargar productos'); })
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const handleSubmit = async () => {
    const body = {...form, price:Number(form.price), stock:Number(form.stock)};
    editId ? await editProducto(editId, body) : await addProducto(body);
    setOpen(false); setForm({name:'',sku:'',price:'',stock:'',category:''}); setEditId(null);
    cargar();
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Inventario</Typography>
      <Button variant="contained" onClick={()=>setOpen(true)}>Agregar producto</Button>

      {cargando && <CircularProgress sx={{mt:4}}/>}
      {error && <Typography color="error" sx={{mt:2}}>{error}</Typography>}

      {!cargando && !error && (
        productos.length === 0
          ? <Typography sx={{mt:4}}>No hay productos registrados.</Typography>
          : <Table size="small" sx={{mt:2}}>
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell><TableCell>Nombre</TableCell>
                  <TableCell>Precio</TableCell><TableCell>Stock</TableCell>
                  <TableCell>Categoría</TableCell><TableCell/>
                </TableRow>
              </TableHead>
              <TableBody>
                {productos.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.sku}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>{p.category ?? '-'}</TableCell>
                    <TableCell>
                      <IconButton onClick={()=>{setForm(p); setEditId(p.id); setOpen(true);}}><Edit/></IconButton>
                      <IconButton onClick={()=>deleteProducto(p.id).then(cargar)}><Delete/></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
      )}

      {/* diálogo de alta/edición */}
      <Dialog open={open} onClose={()=>setOpen(false)}>
        <DialogTitle>{editId ? 'Editar' : 'Nuevo'} producto</DialogTitle>
        <DialogContent sx={{display:'flex', flexDirection:'column', gap:2, mt:1}}>
          {['name','sku','price','stock','category'].map(f=>(
            <TextField key={f} label={f.toUpperCase()} value={form[f] ?? ''}
                       onChange={e=>setForm({...form,[f]:e.target.value})}/>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Navigation/>
    </Box>
  );
}
