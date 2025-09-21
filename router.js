import { ScanPage } from './pages/scan.js';
import { OrderEditPage } from './pages/orderEdit.js';
import { TicketPage } from './pages/ticket.js';
import { CatalogPage } from './pages/catalog.js';
import { OrdersPage } from './pages/orders.js';
import { TransfersPage } from './pages/transfers.js';
import { ReportsPage } from './pages/reports.js';
import { LoginPage } from './pages/login.js';
import { getSession } from './services/auth.service.js';

function parseHash() {
  const hash = location.hash.slice(1) || '/scan';
  const [path, queryString] = hash.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString || ''));
  const parts = path.split('/').filter(Boolean);
  return { path, parts, query };
}

function mount(view) {
  const el = document.getElementById('app-view');
  // soporta: string | Node | { html, mount }
  if (typeof view === 'string') { el.innerHTML = view; return; }
  if (view && typeof view.html === 'string' && typeof view.mount === 'function') {
    el.innerHTML = view.html;
    try { view.mount(el); } catch {}
    return;
  }
  if (view instanceof Node) { el.replaceChildren(view); return; }
  el.innerHTML = '';
}

function navigate(path) {
  if (location.hash !== '#' + path) location.hash = path;
}

function render() {
  const { parts } = parseHash();
  if (window.SCANIX_LOGIN_ENABLED) {
    const sess = getSession();
    if (!sess && parts[0] !== 'login') return navigate('/login');
    if (parts[0] === 'login') return mount(LoginPage());
  }
  if (parts.length === 0 || parts[0] === 'scan') return mount(ScanPage());
  if (parts[0] === 'order-edit') return mount(OrderEditPage());
  if (parts[0] === 'ticket') return mount(TicketPage(parts[1]));
  if (parts[0] === 'catalog') return mount(CatalogPage());
  if (parts[0] === 'orders') return mount(OrdersPage());
  if (parts[0] === 'transfers') return mount(TransfersPage());
  if (parts[0] === 'reports') return mount(ReportsPage());
  return navigate('/scan');
}

export function initRouter() {
  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);
  render();
}
export const router = { navigate };
