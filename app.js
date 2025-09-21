import { initRouter } from './router.js';
import { Navbar } from './components/Navbar.js';
import { ensureToastContainer } from './components/Toast.js';
import './mocks/seed.js';
import { FEATURE } from './config.js';

window.SCANIX_LOGIN_ENABLED = FEATURE.LOGIN_ENABLED;

function updateThemeAssets() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const src = theme === 'dark' ? './public/assets/logo-dark.svg' : './public/assets/logo.svg';
  document.querySelectorAll('img[data-logo]').forEach(img => { img.setAttribute('src', src); });
}

function mountLayout() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header id="app-navbar"></header>
    <main class="container my-4" id="app-view"></main>
    <div id="toast-container" aria-live="polite" aria-atomic="true"></div>
  `;
  document.getElementById('app-navbar').appendChild(Navbar());
  ensureToastContainer();
  updateThemeAssets();
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
    updateThemeAssets();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  mountLayout();
  bindThemeToggle();
  // Forzar hash inicial según flags
  if (FEATURE.LOGIN_ENABLED) {
    if (!location.hash) location.replace('#/login');
  } else {
    if (!location.hash) location.replace('#/scan');
  }
  initRouter();
});
