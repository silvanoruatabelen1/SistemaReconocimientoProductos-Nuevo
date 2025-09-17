import { ScanPage } from './pages/scan.js';
import { OrderEditPage } from './pages/orderEdit.js';
import { TicketPage } from './pages/ticket.js';
import { CatalogPage } from './pages/catalog.js';
import { OrdersPage } from './pages/orders.js';
import { TransfersPage } from './pages/transfers.js';
import { ReportsPage } from './pages/reports.js';

function parseHash() {
  const hash = location.hash.slice(1) || '/scan';
  const [path, queryString] = hash.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString || ''));
  const parts = path.split('/').filter(Boolean);
  return { path, parts, query };
}

function mount(view) {
  const el = document.getElementById('app-view');
  if (typeof view === 'string') {
    el.innerHTML = view;
  } else if (view instanceof Node) {
    el.replaceChildren(view);
  } else {
    el.innerHTML = '';
  }
}

function navigate(path) {
  if (location.hash !== '#' + path) location.hash = path;
}

function resolve() {
  const { parts } = parseHash();
  if (window.SCANIX_LOGIN_ENABLED && parts[0] === 'login') return mount(LoginPlaceholder());
  if (parts.length === 0 || parts[0] === 'scan') return mount(ScanPage());
  if (parts[0] === 'order-edit') return mount(OrderEditPage());
  if (parts[0] === 'ticket') return mount(TicketPage(parts[1]));
  if (parts[0] === 'catalog') return mount(CatalogPage());
  if (parts[0] === 'orders') return mount(OrdersPage());
  if (parts[0] === 'transfers') return mount(TransfersPage());
  if (parts[0] === 'reports') return mount(ReportsPage());
  return navigate('/scan');
}

export const router = {
  start() {
    if (!location.hash) {
      location.hash = window.SCANIX_LOGIN_ENABLED ? '#/login' : '#/scan';
    }
    window.addEventListener('hashchange', resolve);
    resolve();
  },
  navigate
};

function LoginPlaceholder() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-12 col-md-5">
        <div class="card shadow-soft p-4 text-center">
          <h5 class="mb-3">Login (placeholder)</h5>
          <p class="text-muted">El login real está deshabilitado. Este es un placeholder activado por flag.</p>
          <button class="btn btn-primary" id="btn-enter"><i class="bi bi-box-arrow-in-right me-1"></i>Entrar</button>
        </div>
      </div>
    </div>`;
  const el = wrap.firstElementChild;
  el.querySelector('#btn-enter').addEventListener('click', () => navigate('/scan'));
  return el;
}
