import { createContext, useState, useEffect } from "react";
import { me } from "../services/api";

export const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const loginUser = (tok) => {
    localStorage.setItem("token", tok);
    setToken(tok);
    setLoading(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ token, user, loginUser, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}
