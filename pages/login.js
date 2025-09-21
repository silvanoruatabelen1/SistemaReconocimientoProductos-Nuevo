import { login, getSession } from '../services/auth.service.js';

export function LoginPage() {
  const html = `
    <div class="row justify-content-center">
      <div class="col-12 col-md-5">
        <div class="card shadow-soft p-4">
          <h5 class="mb-3">Iniciar sesión</h5>
          <div class="alert alert-info">Usuarios demo: admin@scanix / vendedor@scanix / deposito@scanix (pass: 1234)</div>
          <div class="mb-2"><label class="form-label">Email</label><input class="form-control" id="email" placeholder="usuario@scanix"></div>
          <div class="mb-3"><label class="form-label">Contraseña</label><input type="password" class="form-control" id="pass" placeholder="1234"></div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary" id="btn-login">Ingresar</button>
            <p id="msg" class="text-danger small ms-2 mb-0"></p>
          </div>
        </div>
      </div>
    </div>`;
  const mount = (root) => {
    // Redirigir si la sesión existe
    const sess = getSession();
    if (sess?.role === 'ADMIN') return location.replace('#/catalog');
    if (sess?.role === 'VENDEDOR') return location.replace('#/scan');
    if (sess?.role === 'DEPOSITO') return location.replace('#/transfers');
    const msg = root.querySelector('#msg');
    root.querySelector('#btn-login').addEventListener('click', () => {
      const email = root.querySelector('#email').value.trim();
      const pass = root.querySelector('#pass').value.trim();
      try {
        const s = login({ user: email, pass });
        if (s.role === 'ADMIN') location.replace('#/catalog');
        else if (s.role === 'VENDEDOR') location.replace('#/scan');
        else location.replace('#/transfers');
      } catch(e) {
        msg.textContent = e.message || 'Error';
      }
    });
  };
  return { html, mount };
}
