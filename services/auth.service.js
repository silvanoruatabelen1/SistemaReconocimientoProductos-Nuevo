import { apiPost, setAuthToken } from './api.js';
import { notify } from './notify.service.js';

const USER_KEY = 'SCANIX_AUTH';
const ATTEMPTS_KEY = 'SCANIX_LOGIN_ATTEMPTS';

export async function login(username, password){
  const now = Date.now();
  let attempts;
  try { attempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || {}; } catch { attempts = {}; }
  const rec = attempts[username] || { count: 0, lockUntil: 0 };
  if (rec.lockUntil && now < rec.lockUntil) {
    const mins = Math.ceil((rec.lockUntil - now) / 60000);
    throw new Error(`Usuario bloqueado. Reintente en ${mins} min`);
  }
  try {
    const res = await apiPost('/login/', { username, password });
    setAuthToken(res.token);
    const user = { username, role: 'Vendedor', name: username };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    attempts[username] = { count: 0, lockUntil: 0 };
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
    return user;
  } catch (e) {
    // Mock fallback
    const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
    const user = db.users.find(u => u.username===username && u.password===password);
    if (!user) {
      rec.count = (rec.count || 0) + 1;
      if (rec.count >= 5) {
        rec.lockUntil = now + 15 * 60 * 1000; // 15 minutes
        rec.count = 0;
        notify.warn('Demasiados intentos. Usuario bloqueado por 15 minutos');
      }
      attempts[username] = rec;
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
      throw new Error('Credenciales inválidas');
    }
    setAuthToken('mock-token');
    const minimal = { username, role: user.role, name: user.name };
    localStorage.setItem(USER_KEY, JSON.stringify(minimal));
    attempts[username] = { count: 0, lockUntil: 0 };
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
    return minimal;
  }
}

export function logout(){
  setAuthToken(null);
  localStorage.removeItem(USER_KEY);
}

export function currentUser(){
  try{ return JSON.parse(localStorage.getItem(USER_KEY)); }catch{ return null; }
}

