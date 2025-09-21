// Simple stubs to prepare future backend integration
export const BASE_URL = localStorage.getItem('API_BASE_URL') || '';

export async function apiGet(path) {
  throw new Error('apiGet no implementado (mock localStorage activo)');
}
export async function apiPost(path, body) {
  throw new Error('apiPost no implementado (mock localStorage activo)');
}
export async function apiPut(path, body) {
  throw new Error('apiPut no implementado (mock localStorage activo)');
}
export async function apiDel(path) {
  throw new Error('apiDel no implementado (mock localStorage activo)');
}

