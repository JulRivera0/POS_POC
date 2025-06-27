const API = "http://localhost:8000";   // ajusta si usas otro host/puerto

/* ---------- Productos ---------- */
export const fetchProductos = () =>
  fetch(`${API}/products`).then(r => r.json());

export const addProducto = (data) =>
  fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sku:       data.sku,
      name:      data.name,
      price:     Number(data.price),
      cost:      Number(data.cost),    // 👈 NUEVO  (obligatorio)
      stock:     Number(data.stock),
      category:  data.category || null
    })
  }).then(r => r.json());

export const editProducto = (id, data) =>
  fetch(`${API}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sku:       data.sku,
      name:      data.name,
      price:     Number(data.price),
      cost:      Number(data.cost),    // 👈 NUEVO
      stock:     Number(data.stock),
      category:  data.category || null
    })
  }).then(r => r.json());

export const deleteProducto = (id) =>
  fetch(`${API}/products/${id}`, { method: "DELETE" });

/* ---------- Ventas ---------- */
export const crearVenta = (items) =>
  fetch(`${API}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  }).then(r => r.json());

export const fetchVentas = () =>
  fetch(`${API}/sales`).then(r => r.json());

export const fetchVenta = (id) =>
  fetch(`${API}/sales/${id}`).then(r => r.json());
