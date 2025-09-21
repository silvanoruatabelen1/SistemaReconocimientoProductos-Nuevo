import { SECURITY } from '../config.js';

const K = {
  FAIL: 'scanix.auth.failCount',
  LOCK: 'scanix.auth.lockUntil',
  SESSION: 'scanix.auth.session',
};

function now(){ return Date.now(); }
function minutes(ms){ return ms*60*1000; }

export function getSession(){
  try{
    const raw = localStorage.getItem(K.SESSION); if (!raw) return null;
    const s = JSON.parse(raw); if (!s || !s.exp || s.exp < now()) { localStorage.removeItem(K.SESSION); return null; }
    return s;
  }catch{ return null; }
}

export function logout(){ localStorage.removeItem(K.SESSION); }

export function login({ user, pass }){
  // lockout
  const lock = Number(localStorage.getItem(K.LOCK) || 0);
  if (lock && lock > now()) {
    const mins = SECURITY.LOCKOUT_MINUTES;
    throw new Error(`Cuenta bloqueada por ${mins} min`);
  }
  const ok = (
    (user==='admin@scanix' && pass==='1234') ||
    (user==='vendedor@scanix' && pass==='1234') ||
    (user==='deposito@scanix' && pass==='1234')
  );
  if (!ok) {
    const fail = Number(localStorage.getItem(K.FAIL) || 0) + 1;
    localStorage.setItem(K.FAIL, String(fail));
    if (fail >= SECURITY.MAX_LOGIN_ATTEMPTS) {
      localStorage.setItem(K.LOCK, String(now() + minutes(SECURITY.LOCKOUT_MINUTES)));
      localStorage.setItem(K.FAIL, '0');
    }
    throw new Error('Usuario o contraseña incorrectos');
  }
  localStorage.setItem(K.FAIL, '0'); localStorage.removeItem(K.LOCK);
  const role = user.startsWith('admin') ? 'ADMIN' : user.startsWith('vendedor') ? 'VENDEDOR' : 'DEPOSITO';
  const exp = now() + minutes(SECURITY.SESSION_TTL_MINUTES);
  const session = { email: user, role, exp };
  localStorage.setItem(K.SESSION, JSON.stringify(session));
  return session;
}

