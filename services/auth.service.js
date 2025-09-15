import { apiPost, setAuthToken } from './api.js';

const USER_KEY = 'SCANIX_AUTH';

export async function login(username, password){
  try {
    const res = await apiPost('/login/', { username, password });
    setAuthToken(res.token);
    // En API real podrías pedir /api/user/me; en mock guardamos básico
    const user = { username, role: 'Vendedor', name: username };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch (e) {
    // Mock fallback
    const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
    const user = db.users.find(u => u.username===username && u.password===password);
    if (!user) throw new Error('Credenciales inválidas');
    setAuthToken('mock-token');
    const minimal = { username, role: user.role, name: user.name };
    localStorage.setItem(USER_KEY, JSON.stringify(minimal));
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

