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
        <div class="small mt-2"><a href="#" id="forgot">¿Olvidaste tu contraseña?</a></div>
      </div>
    </div>
    <div class="modal fade" id="modalReset" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Recuperar contraseña</h5><button class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body vstack gap-2">
            <label>Usuario</label>
            <input class="form-control" id="resetUser" placeholder="usuario" />
            <button class="btn btn-outline-secondary" id="sendToken">Simular envío de token</button>
            <div class="small muted" id="tokenInfo" style="display:none"></div>
            <label>Token</label>
            <input class="form-control" id="resetToken" placeholder="token" />
            <label>Nueva contraseña</label>
            <input type="password" class="form-control" id="newPass" />
          </div>
          <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button><button class="btn btn-primary" id="applyReset">Aplicar</button></div>
        </div>
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
  // Forgot password flow
  el.querySelector('#forgot').addEventListener('click', (ev)=>{
    ev.preventDefault();
    // eslint-disable-next-line no-undef
    const bs = new bootstrap.Modal(el.querySelector('#modalReset'));
    bs.show();
  });
  el.querySelector('#sendToken').addEventListener('click', ()=>{
    const u = el.querySelector('#resetUser').value.trim();
    if (!u) return notify.warn('Ingrese el usuario');
    const tokensKey = 'SCANIX_RESET_TOKENS';
    let map; try { map = JSON.parse(localStorage.getItem(tokensKey))||{}; } catch { map = {}; }
    const token = Math.random().toString(36).slice(2,8).toUpperCase();
    map[u] = token;
    localStorage.setItem(tokensKey, JSON.stringify(map));
    const info = el.querySelector('#tokenInfo');
    info.style.display='block'; info.textContent = `Token generado (mock): ${token}`;
    notify.info('Token generado (mock)');
  });
  el.querySelector('#applyReset').addEventListener('click', ()=>{
    const u = el.querySelector('#resetUser').value.trim();
    const token = el.querySelector('#resetToken').value.trim();
    const newPass = el.querySelector('#newPass').value;
    if (!u || !token || !newPass) return notify.warn('Complete los campos');
    let map; try { map = JSON.parse(localStorage.getItem('SCANIX_RESET_TOKENS'))||{}; } catch { map = {}; }
    if (map[u] !== token) return notify.error('Token inválido');
    const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
    const user = db.users.find(x=>x.username===u);
    if (!user) return notify.error('Usuario no existe');
    user.password = newPass; localStorage.setItem('SCANIX_DB', JSON.stringify(db));
    notify.success('Contraseña actualizada');
    // eslint-disable-next-line no-undef
    bootstrap.Modal.getInstance(el.querySelector('#modalReset')).hide();
  });
  return el;
}

