export function Navbar(mount) {
  mount.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark navbar-scanix surface-2">
    <div class="container">
      <a class="navbar-brand hstack" href="#/scan" data-route>
        <i class="bi bi-qr-code-scan me-2"></i>
        <strong>SCANIX</strong>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMain">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link" href="#/scan" data-route>Scan</a></li>
          <li class="nav-item"><a class="nav-link" href="#/order-edit" data-route>Orden</a></li>
          <li class="nav-item"><a class="nav-link" href="#/catalog" data-route>Catálogo</a></li>
          <li class="nav-item"><a class="nav-link" href="#/orders" data-route>Ventas</a></li>
          <li class="nav-item"><a class="nav-link" href="#/transfers" data-route>Transferencias</a></li>
          <li class="nav-item"><a class="nav-link" href="#/reports" data-route>Reportes</a></li>
          <li class="nav-item"><a class="nav-link" href="#/dataset" data-route>Dataset</a></li>
          <li class="nav-item"><a class="nav-link" href="#/admin/users" data-route>Usuarios</a></li>
        </ul>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" data-toggle-theme>
            <i class="bi bi-moon-stars me-1"></i><span>Tema</span>
          </button>
          <a class="btn btn-sm btn-outline-light" href="#/login">
            <i class="bi bi-person-circle me-1"></i> Cuenta
          </a>
        </div>
      </div>
    </div>
  </nav>`;
}

