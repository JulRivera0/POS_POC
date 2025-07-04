const API = import.meta.env.VITE_API || "http://localhost:8000"; // cambia en prod

/* ---------- Helper para añadir token ---------- */
const fetchAuth = (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
};

/* ---------- Auth ---------- */
export const login = (email, password) =>
  fetch(`${API}/auth/jwt/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password }),
  }).then((r) => r.json());

export const register = (email, password) =>
  fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());

/* ---------- Usuarios ---------- */
export const me = () =>
  fetchAuth(`${API}/users/me`).then((r) => r.json());

/* ---------- Productos ---------- */
export const fetchProductos = () =>
  fetchAuth(`${API}/products`).then((r) => r.json());

export const addProducto = (data) =>
  fetchAuth(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const editProducto = (id, data) =>
  fetchAuth(`${API}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteProducto = (id) =>
  fetchAuth(`${API}/products/${id}`, { method: "DELETE" });

/* ---------- Ventas ---------- */
export const crearVenta = (items) =>
  fetchAuth(`${API}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).then((r) => r.json());

export const fetchVentas = () =>
  fetchAuth(`${API}/sales`).then((r) => r.json());

export const fetchVenta = (id) =>
  fetchAuth(`${API}/sales/${id}`).then((r) => r.json());
