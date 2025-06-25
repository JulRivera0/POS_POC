import { useEffect, useState } from 'react';
import { fetchVentas } from '../services/api';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Navigation from '../components/Navigation';

export default function Historial() {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    fetchVentas().then(setVentas);
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h5">Historial de Ventas</Typography>

      {ventas.map(v => (
        <Accordion key={v.id} sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Venta #{v.id} – {new Date(v.timestamp).toLocaleString()} – Total: ${Number(v.total).toFixed(2)}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {v.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${Number(item.subtotal).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}

      <Navigation />
    </Box>
  );
}
