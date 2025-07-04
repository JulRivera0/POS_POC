import { useState } from "react";
import {
  Box, TextField, Button, Typography, CircularProgress
} from "@mui/material";
import { register } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handle = async () => {
    if (pass !== confirm) {
      setMsg("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    const r = await register(email, pass);
    setLoading(false);
    if (r.id) {
      setMsg("Cuenta creada, inicia sesión");
    } else {
      setMsg("Error al registrar");
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 360, m: "0 auto" }}>
      <Typography variant="h5" mb={2}>Crear cuenta</Typography>
      <TextField label="Email" fullWidth value={email}
        onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Password" type="password" fullWidth sx={{ mt: 2 }}
        value={pass} onChange={(e) => setPass(e.target.value)} />
      <TextField label="Confirmar" type="password" fullWidth sx={{ mt: 2 }}
        value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      {msg && <Typography color="error">{msg}</Typography>}
      <Button variant="contained" fullWidth sx={{ mt: 2 }}
        onClick={handle} disabled={loading}>
        {loading ? <CircularProgress size={20} /> : "Registrar"}
      </Button>
      <Button fullWidth sx={{ mt: 1 }} onClick={() => nav("/login")}>
        Volver a login
      </Button>
    </Box>
  );
}
