export function Navbar() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
  <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom" style="background: var(--card)">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" href="#/scan">
        <img src="./public/assets/logo.svg" alt="logo" width="24" height="24"/>
        <span class="fw-semibold">SCANIX</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMain">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link" href="#/scan"><i class="bi bi-qr-code-scan me-1"></i>Scan</a></li>
          <li class="nav-item"><a class="nav-link" href="#/order-edit"><i class="bi bi-cart3 me-1"></i>Pedido</a></li>
          <li class="nav-item"><a class="nav-link" href="#/catalog"><i class="bi bi-box-seam me-1"></i>Catálogo</a></li>
          <li class="nav-item"><a class="nav-link" href="#/orders"><i class="bi bi-receipt me-1"></i>Historial</a></li>
          <li class="nav-item"><a class="nav-link" href="#/transfers"><i class="bi bi-arrow-left-right me-1"></i>Transferencias</a></li>
          <li class="nav-item"><a class="nav-link" href="#/reports"><i class="bi bi-graph-up me-1"></i>Reportes</a></li>
        </ul>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" data-action="toggle-theme" title="Toggle theme">
            <i class="bi bi-moon-stars"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>`;
  return wrap.firstElementChild;
}

