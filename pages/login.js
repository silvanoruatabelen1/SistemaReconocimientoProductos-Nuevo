import { login } from '../services/auth.service.js';
import { notify } from '../services/notify.service.js';

export default function LoginPage(){
  const el = document.createElement('div');
  el.className = 'container py-4';
  el.innerHTML = `
    <div class="mx-auto" style="max-width:420px">
      <div class="card-scanix p-4 rounded-2xl">
        <div class="mb-3 text-center">
          <i class="bi bi-qr-code-scan" style="font-size:36px"></i>
          <h3 class="mt-2 mb-0">Ingresar</h3>
          <div class="muted small">Token auth simulado (mock)</div>
        </div>
        <form id="formLogin" class="vstack">
          <input class="form-control" id="user" placeholder="Usuario" required>
          <input class="form-control" id="pass" placeholder="Contraseña" type="password" required>
          <button class="btn btn-primary mt-2" type="submit">Entrar</button>
        </form>
      </div>
    </div>`;
  el.querySelector('#formLogin').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const u = el.querySelector('#user').value.trim();
    const p = el.querySelector('#pass').value.trim();
    try {
      await login(u,p);
      notify.success('Bienvenido');
      location.hash = '#/scan';
    } catch(err){
      notify.error(err.message||'Error de login');
    }
  });
  return el;
}

