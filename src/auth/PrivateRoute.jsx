import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthCtx } from "./AuthProvider";

export default function PrivateRoute({ children }) {
  const { token, loading } = useContext(AuthCtx);

  if (loading) return null; // o spinner global
  return token ? children : <Navigate to="/login" replace />;
}
