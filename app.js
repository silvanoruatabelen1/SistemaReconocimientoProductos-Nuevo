// SCANIX - App bootstrap (file:// compatible)
// - Inicializa seed (localStorage), router, navbar y tema

import { initSeed } from './mocks/seed.js';
import { Router } from './router.js';
import { getCurrentUser } from './auth.js';
import { Navbar } from './components/Navbar.js';

// Seed de datos locales si no existe
initSeed();

// Montar Navbar
const navbarMount = document.getElementById('navbar');
Navbar(navbarMount);

// Tema (persistencia)
const root = document.documentElement;
const savedTheme = localStorage.getItem('SCANIX_THEME') || 'dark';
root.setAttribute('data-theme', savedTheme);
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t && t.matches('[data-toggle-theme]')) {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('SCANIX_THEME', next);
  }
});

// SPA Router
const router = new Router({
  mountId: 'app',
  routes: {
    '#/login': () => import('./pages/login.js').then(m => m.default),
    '#/scan': () => import('./pages/scan.js').then(m => m.default),
    '#/order-edit': () => import('./pages/orderEdit.js').then(m => m.default),
    '#/ticket/:id': () => import('./pages/ticket.js').then(m => m.default),
    '#/catalog': () => import('./pages/catalog.js').then(m => m.default),
    '#/orders': () => import('./pages/orders.js').then(m => m.default),
    '#/transfers': () => import('./pages/transfers.js').then(m => m.default),
    '#/reports': () => import('./pages/reports.js').then(m => m.default),
    '#/admin/users': () => import('./pages/users.js').then(m => m.default),
    '#/dataset': () => import('./pages/dataset.js').then(m => m.default),
  },
  defaultRoute: '#/scan',
  onRouteChange: (hash) => {
    // Activar link en navbar
    document.querySelectorAll('[data-route]').forEach(el => el.classList.remove('active'));
    const a = document.querySelector(`[data-route][href="${hash}"]`);
    if (a) a.classList.add('active');
  }
});

// Arranque: si no logueado, ir a login
if (!getCurrentUser()) {
  location.hash = '#/login';
} else if (!location.hash) {
  location.hash = '#/scan';
} else {
  router.handleHashChange();
}
