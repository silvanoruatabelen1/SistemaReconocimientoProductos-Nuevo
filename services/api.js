// API base usando axios + Token (stubs para conectar backend REST)
// Endpoints esperados:
// - Auth: POST /auth/login -> { token }
// - Productos: GET /products, POST /products, PUT /products/:id, DELETE /products/:id, GET /products?search=
// - Ventas: POST /orders, GET /orders, GET /orders/:id
// - Stock: POST /stock/transfer, GET /stock?productId=&depot=
// - Reconocimiento: POST /vision/detect (imagen) -> detecciones

export const BASE_URL = "http://localhost:8000/api"; // ajustar al backend
let AUTH_TOKEN = localStorage.getItem("AUTH_TOKEN") || null;

export function setAuthToken(t) {
  AUTH_TOKEN = t;
  if (t) localStorage.setItem("AUTH_TOKEN", t); else localStorage.removeItem("AUTH_TOKEN");
}

const headers = () => AUTH_TOKEN ? { Authorization: `Token ${AUTH_TOKEN}` } : {};

function isMock(){
  // Evitar requests reales en modo file:// por defecto
  const v = localStorage.getItem('SCANIX_USE_MOCK');
  return v === null ? true : v === 'true';
}

export async function apiPost(path, body) {
  if (isMock()) throw new Error('MOCK_MODE');
  const { data } = await axios.post(`${BASE_URL}${path}`, body, { headers: headers() });
  return data;
}
export async function apiGet(path)  {
  if (isMock()) throw new Error('MOCK_MODE');
  const { data } = await axios.get(`${BASE_URL}${path}`, { headers: headers() });
  return data;
}
export async function apiPut(path, body) {
  if (isMock()) throw new Error('MOCK_MODE');
  const { data } = await axios.put(`${BASE_URL}${path}`, body, { headers: headers() });
  return data;
}
export async function apiDel(path)  {
  if (isMock()) throw new Error('MOCK_MODE');
  const { data } = await axios.delete(`${BASE_URL}${path}`, { headers: headers() });
  return data;
}
