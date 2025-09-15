// Autenticación mock + guard de roles

const STORAGE_KEY = 'SCANIX_AUTH';

export function setAuthToken(token, user) {
  const data = token ? { token, user } : null;
  if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  else localStorage.removeItem(STORAGE_KEY);
}

export function getAuth() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
}

export function getCurrentUser() {
  const a = getAuth();
  return a?.user || null;
}

export function requireRole(roles = []) {
  const user = getCurrentUser();
  if (!user) return false;
  if (!roles.length) return true;
  return roles.includes(user.role);
}

export function logout() {
  setAuthToken(null);
  location.hash = '#/login';
}

