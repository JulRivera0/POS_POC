const API = 'http://localhost:8000';   // ajusta si despliegas

export async function fetchProductos() {
  return fetch(`${API}/products`).then(r => r.json());
}

export async function addProducto(data) {
  return fetch(`${API}/products`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function editProducto(id, data) {
  return fetch(`${API}/products/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function deleteProducto(id) {
  return fetch(`${API}/products/${id}`, { method: 'DELETE' });
}

export async function crearVenta(items) {
    return fetch(`${API}/sales`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ items })
    }).then(r => {
      if (!r.ok) throw new Error('Error en la venta');
      return r.json();
    });
  }

export async function fetchVentas() {
return fetch(`${API}/sales`).then(r => r.json());
}
