import { router } from './router.js';
import { Navbar } from './components/Navbar.js';
import { ensureToastContainer } from './components/Toast.js';
import './mocks/seed.js';

// Feature flag para futuro login (placeholder)
const LOGIN_ENABLED = false;
window.SCANIX_LOGIN_ENABLED = LOGIN_ENABLED;

function mountLayout() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header id="app-navbar"></header>
    <main class="container my-4" id="app-view"></main>
    <div id="toast-container" aria-live="polite" aria-atomic="true"></div>
  `;
  document.getElementById('app-navbar').appendChild(Navbar());
  ensureToastContainer();
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function initTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  setTheme(theme);
}

function bindThemeToggle() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="toggle-theme"]');
    if (!btn) return;
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  mountLayout();
  bindThemeToggle();
  router.start();
});
