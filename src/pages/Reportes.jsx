import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow,
  TableCell, CircularProgress, TextField, InputAdornment
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { fetchVentas } from '../services/api';
import Navigation from '../components/Navigation';

/* ---- util para formatear fechas ---- */
const dateKey = (iso) => iso.slice(0, 10); // "2025-06-26"

export default function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState(''); // YYYY-MM, p.ej. "2025-06"

  /* cargar ventas */
  useEffect(() => {
    fetchVentas().then((v) => {
      setVentas(v);
      setLoading(false);
    });
  }, []);

  /* agrupar por día y sumar */
  const rows = useMemo(() => {
    const map = {};
    ventas.forEach((v) => {
      const key = dateKey(v.timestamp);
      map[key] ??= { ingresos: 0, costos: 0, ganancia: 0 };
      map[key].ingresos  += Number(v.total);
      map[key].costos    += Number(v.cost);
      map[key].ganancia  += Number(v.total) - Number(v.cost);
    });
    const list = Object.entries(map)
      .map(([fecha, vals]) => ({ fecha, ...vals }))
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1)); // desc
    if (!filtro) return list;
    return list.filter(r => r.fecha.startsWith(filtro));
  }, [ventas, filtro]);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Cargando reportes…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto', pb: 8 }}>
        <Typography variant="h5" gutterBottom>Reportes de ganancias</Typography>

        {/* Filtro por mes */}
        <TextField
          size="small"
          type="month"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, width: 200 }}
        />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell align="right"><strong>Ingresos</strong></TableCell>
              <TableCell align="right"><strong>Costos</strong></TableCell>
              <TableCell align="right"><strong>Ganancia</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.fecha}>
                <TableCell>{r.fecha}</TableCell>
                <TableCell align="right">${r.ingresos.toFixed(2)}</TableCell>
                <TableCell align="right">${r.costos.toFixed(2)}</TableCell>
                <TableCell align="right">
                  ${r.ganancia.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Sin ventas en el periodo seleccionado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Navigation />
    </Box>
  );
}
