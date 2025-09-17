export function ensureToastContainer() {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
}

export function toast(message, variant = 'primary') {
  ensureToastContainer();
  const id = 't' + Date.now();
  const el = document.createElement('div');
  el.className = 'toast align-items-center show border-0 shadow-soft';
  el.role = 'alert';
  el.ariaLive = 'assertive';
  el.ariaAtomic = 'true';
  el.dataset.bsAutohide = 'true';
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body text-bg-${variant}">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;
  document.getElementById('toast-container').appendChild(el);
  try {
    const t = bootstrap.Toast.getOrCreateInstance(el, { delay: 2500 });
    t.show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
  } catch (_) {
    // fallback
    setTimeout(() => el.remove(), 3000);
  }
}

