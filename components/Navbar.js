import { getSession, logout } from '../services/auth.service.js';

export function Navbar() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
  <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom" style="background: var(--card)">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" href="#/scan">
        <img data-logo src="./public/assets/logo.svg" alt="SCANIX – Sistema de Reconocimiento de Productos" width="24" height="24"/>
        <span class="fw-semibold">SCANIX</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMain">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0" id="menu">
          <li class="nav-item" data-role="VENDEDOR ADMIN"><a class="nav-link" href="#/scan"><i class="bi bi-qr-code-scan me-1"></i>Scan</a></li>
          <li class="nav-item" data-role="VENDEDOR ADMIN"><a class="nav-link" href="#/order-edit"><i class="bi bi-cart3 me-1"></i>Pedido</a></li>
          <li class="nav-item" data-role="ADMIN"><a class="nav-link" href="#/catalog"><i class="bi bi-box-seam me-1"></i>Catálogo</a></li>
          <li class="nav-item" data-role="VENDEDOR ADMIN"><a class="nav-link" href="#/orders"><i class="bi bi-receipt me-1"></i>Historial</a></li>
          <li class="nav-item" data-role="DEPOSITO ADMIN"><a class="nav-link" href="#/transfers"><i class="bi bi-arrow-left-right me-1"></i>Transferencias</a></li>
          <li class="nav-item" data-role="ADMIN"><a class="nav-link" href="#/reports"><i class="bi bi-graph-up me-1"></i>Reportes</a></li>
        </ul>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" data-action="toggle-theme" title="Toggle theme">
            <i class="bi bi-moon-stars"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger d-none" id="btn-logout" title="Salir"><i class="bi bi-box-arrow-right"></i></button>
        </div>
      </div>
    </div>
  </nav>`;
  const nav = wrap.firstElementChild;
  // Guard menu by role if login enabled
  if (window.SCANIX_LOGIN_ENABLED) {
    const sess = getSession();
    const role = sess?.role || '';
    nav.querySelectorAll('#menu [data-role]').forEach(li => {
      const allowed = (li.getAttribute('data-role')||'').split(/\s+/);
      if (!role || !allowed.includes(role)) li.classList.add('d-none');
    });
    const btnLogout = nav.querySelector('#btn-logout');
    if (sess) {
      btnLogout.classList.remove('d-none');
      btnLogout.addEventListener('click', () => { logout(); location.hash = '#/login'; });
    }
  }
  return nav;
}
