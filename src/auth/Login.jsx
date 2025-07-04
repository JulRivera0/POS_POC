import { useState, useContext } from "react";
import {
  Box, TextField, Button, Typography, CircularProgress
} from "@mui/material";
import { login } from "../services/api";
import { AuthCtx } from "./AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(AuthCtx);
  const nav = useNavigate();

  const handle = async () => {
    setLoading(true);
    const r = await login(email, pass);
    if (r.access_token) {
      loginUser(r.access_token);
      nav("/");
    } else {
      setErr("Credenciales inválidas");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 360, m: "0 auto" }}>
      <Typography variant="h5" mb={2}>Iniciar sesión</Typography>
      <TextField
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        sx={{ mt: 2 }}
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      {err && <Typography color="error">{err}</Typography>}
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handle}
        disabled={loading}
      >
        {loading ? <CircularProgress size={20} /> : "Entrar"}
      </Button>
      <Button fullWidth sx={{ mt: 1 }} onClick={() => nav("/register")}>
        Crear cuenta
      </Button>
    </Box>
  );
}
