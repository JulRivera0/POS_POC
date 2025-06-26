// src/pages/Venta.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  fetchProductos, crearVenta
} from '../services/api';

import {
  Box, Typography, TextField, Table, TableHead, TableBody, TableRow, TableCell,
  InputAdornment, IconButton, Button, Snackbar, Dialog, DialogTitle
} from '@mui/material';
import {
  Search as SearchIcon, Delete, CameraAlt,
  ShoppingCart as CartIcon, WarningAmber
} from '@mui/icons-material';

import Navigation from '../components/Navigation';
import {
  Html5QrcodeScanner, Html5QrcodeSupportedFormats
} from 'html5-qrcode';

export default function Venta() {
  /* ---------- estado ---------- */
  const [productos, setProductos] = useState([]);
  const [busqueda,  setBusqueda]  = useState('');
  const [carrito,   setCarrito]   = useState({});      // { id: qty }
  const [msg,       setMsg]       = useState('');
  const [scanOpen,  setScanOpen]  = useState(false);

  /* ---------- carga productos ---------- */
  useEffect(() => { fetchProductos().then(setProductos); }, []);

  /* ---------- filtrado ---------- */
  const filtrados = useMemo(()=>{
    const q = busqueda.toLowerCase();
    if(!q) return [];
    return productos.filter(p => p.name.toLowerCase().includes(q) ||
                                 p.sku.toLowerCase().includes(q));
  },[busqueda, productos]);

  /* ---------- helpers inventario ---------- */
  const stockOf = (id)=> {
    const prod = productos.find(p=>p.id===+id);
    return prod ? prod.stock : 0;
  };

  const addToCart = (prod) => {
    setCarrito(prev=>{
      const nuevo = (prev[prod.id]||0) + 1;
      if (nuevo > prod.stock) {
        setMsg(`Stock insuficiente (máx ${prod.stock})`);
        return prev;
      }
      return { ...prev, [prod.id]: nuevo };
    });
  };

  const updateQty = (id, qty) => {
    const max = stockOf(id);
    if (qty > max) {
      setMsg(`Stock insuficiente (máx ${max})`);
      qty = max;
    }
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCarrito(prev => ({ ...prev, [id]: qty }));
    }
  };

  const removeFromCart = (id) =>
    setCarrito(({[id]:_, ...rest}) => rest);

  const total = Object.entries(carrito).reduce((s,[id,q])=>{
    const p = productos.find(pr=>pr.id===+id);
    return p ? s + p.price*q : s;
  },0);

  /* ---------- venta ---------- */
  const cobrar = async () => {
    const items = Object.entries(carrito).map(([id,q])=>({product_id:+id, quantity:q}));
    if(!items.length) return;
    try{
      const r = await crearVenta(items);
      setMsg(`Venta registrada: $${Number(r.total).toFixed(2)}`);
      setCarrito({});
    }catch{ setMsg('Error al registrar venta'); }
  };

  /* ---------- escáner ---------- */
  useEffect(()=>{
    if(!scanOpen) return;
    const t = setTimeout(()=>{
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps:10,
          qrbox:250,
          formatsToSupport:[
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39
          ]
        },
        false
      );
      scanner.render(
        (txt)=>{
          const p=productos.find(pr=>pr.sku===txt);
          if(p) addToCart(p);
          scanner.clear().then(()=>setScanOpen(false));
        },
        err=>console.warn(err)
      );
    },200);
    return()=>clearTimeout(t);
  },[scanOpen, productos]);

  /* ---------- UI ---------- */
  return (
    <Box sx={{height:'100vh',display:'flex',flexDirection:'column'}}>
      <Box sx={{flexGrow:1,overflowY:'auto',p:2}}>
        <Typography variant="h5" gutterBottom>Venta</Typography>

        <Box sx={{display:'flex',gap:1,mb:2}}>
          <TextField
            fullWidth size="small" placeholder="Buscar o SKU"
            value={busqueda}
            onChange={e=>setBusqueda(e.target.value)}
            onKeyDown={e=>{
              if(e.key==='Enter'){
                const prod=productos.find(p=>p.sku.toLowerCase()===busqueda.toLowerCase());
                if(prod) addToCart(prod);
                setBusqueda('');
              }
            }}
            InputProps={{
              startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment>
            }}
          />
          <IconButton color="primary" onClick={()=>setScanOpen(true)}>
            <CameraAlt/>
          </IconButton>
        </Box>

        {busqueda && filtrados.length>0 && (
          <Table size="small" sx={{mb:2}}>
            <TableBody>
              {filtrados.map(p=>(
                <TableRow key={p.id} hover sx={{cursor:'pointer'}}
                  onClick={()=>{addToCart(p); setBusqueda('');}}>
                  <TableCell width={80}>{p.sku}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell width={70}>${Number(p.price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Typography variant="h6" gutterBottom>Carrito</Typography>
        {Object.keys(carrito).length===0
          ? <Typography color="text.secondary">Sin productos</Typography>
          : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell><TableCell>Nombre</TableCell>
                  <TableCell align="right">Cant</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell/>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(carrito).map(([id,q])=>{
                  const p=productos.find(pr=>pr.id===+id); if(!p) return null;
                  return (
                    <TableRow key={id}>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell align="right" width={80}>
                        <TextField
                          type="number" size="small"
                          value={q}
                          inputProps={{min:1,max:p.stock,style:{width:60,textAlign:'right'}}}
                          onChange={e=>updateQty(id, Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell align="right">${Number(p.price*q).toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={()=>removeFromCart(id)}>
                          <Delete fontSize="small"/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

        <Box sx={{mt:2,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
          <Button variant="contained" startIcon={<CartIcon/>} disabled={total===0} onClick={cobrar}>
            Cobrar
          </Button>
        </Box>
      </Box>

      <Navigation/>

      <Snackbar
        open={!!msg} autoHideDuration={3500}
        onClose={()=>setMsg('')} message={msg}
        iconMapping={{ warning:<WarningAmber/> }}
      />

      <Dialog fullWidth maxWidth="sm" open={scanOpen} onClose={()=>setScanOpen(false)}>
        <DialogTitle>Escanear código de barras</DialogTitle>
        <Box id="reader" sx={{width:'100%',height:320}}/>
      </Dialog>
    </Box>
  );
}
