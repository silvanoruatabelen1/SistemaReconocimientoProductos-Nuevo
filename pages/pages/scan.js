import { detectFromImage } from '../mocks/vision.mock.js';
import { getBySKU } from '../services/products.service.js';
import { startDraftFromDetections } from '../services/orders.service.js';

export function ScanPage() {
  const el = document.createElement('div');
  el.innerHTML = `
  <div class="row g-4">
    <div class="col-12 col-lg-5">
      <div class="card shadow-soft p-3 h-100">
        <h5 class="mb-3">Captura/Reconocimiento</h5>
        <div class="border border-dashed rounded-3 p-4 text-center">
          <input type="file" accept="image/*" capture="environment" class="form-control mb-3" id="scan-file" />
          <button class="btn btn-primary" id="btn-detect"><i class="bi bi-magic me-1"></i>Simular reconocimiento</button>
        </div>
        <div class="small text-muted mt-2">Usa vision.mock.js para detecciones simuladas</div>
      </div>
    </div>
    <div class="col-12 col-lg-7">
      <div class="card shadow-soft p-3">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h5 class="mb-0">Resultados</h5>
          <button class="btn btn-success" id="to-order" disabled>Ir a Pedido</button>
        </div>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead><tr>
              <th>SKU</th><th>Nombre</th><th>Qty</th><th>Flags</th>
            </tr></thead>
            <tbody id="scan-tbody"><tr><td colspan="4" class="text-muted">Sin resultados</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`;

  const tbody = el.querySelector('#scan-tbody');
  const toOrder = el.querySelector('#to-order');

  let grouped = [];

  async function runDetect() {
    const file = el.querySelector('#scan-file').files?.[0] || null;
    const dets = await detectFromImage(file);
    const bySku = new Map();
    dets.forEach(d => {
      const prev = bySku.get(d.sku) || { sku: d.sku, name: d.name, qty: 0, low: false };
      prev.qty += d.qty;
      if (d.confidence < 0.6) prev.low = true;
      bySku.set(d.sku, prev);
    });
    grouped = Array.from(bySku.values()).map(g => {
      const p = getBySKU(g.sku);
      return { ...g, productId: p?.id || null };
    });
    renderResults();
  }

  function renderResults() {
    if (!grouped.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-muted">Sin resultados</td></tr>`;
      toOrder.disabled = true;
      return;
    }
    tbody.innerHTML = grouped.map(g => `
      <tr>
        <td class="fw-semibold">${g.sku}</td>
        <td>${g.name}</td>
        <td>${g.qty}</td>
        <td>${g.low ? '<span class="badge text-bg-warning">Revisar</span>' : ''}</td>
      </tr>`).join('');
    toOrder.disabled = false;
  }

  el.querySelector('#btn-detect').addEventListener('click', runDetect);
  toOrder.addEventListener('click', () => {
    const onlyKnown = grouped.filter(g => g.productId);
    startDraftFromDetections(onlyKnown);
    location.hash = '#/order-edit';
  });

  return el;
}
