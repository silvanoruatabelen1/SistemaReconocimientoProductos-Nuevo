import { list as listProducts } from '../services/products.service.js';
import { listDepots, transferLines } from '../services/stock.service.js';
import { notify } from '../services/notify.service.js';
import { detectFromImage } from '../mocks/vision.mock.js';

export function TransfersPage() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card shadow-soft p-3">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-4">
          <label class="form-label">Operador (opcional)</label>
          <input id="operator" class="form-control" placeholder="Nombre del operador" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Origen</label>
          <select class="form-select" id="from"></select>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Destino</label>
          <select class="form-select" id="to"></select>
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Agregar producto</label>
          <div class="position-relative">
            <input type="text" class="form-control" id="q" placeholder="Buscar por nombre, SKU o tag" autocomplete="off"/>
            <div class="autocomplete-list d-none" id="ac"></div>
          </div>
        </div>
      </div>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-secondary" id="btn-vision"><i class="bi bi-magic me-1"></i> Sugerir por foto</button>
        <input type="file" accept="image/*" id="file" class="form-control form-control-sm" style="max-width:260px" />
        <div class="ms-auto">
          <button class="btn btn-success" id="btn-confirm"><i class="bi bi-arrow-left-right me-1"></i> Transferir</button>
        </div>
      </div>
      <div class="table-responsive mt-3">
        <table class="table table-sm align-middle">
          <thead><tr><th>SKU</th><th>Producto</th><th class="text-center">Qty</th><th class="text-end"></th></tr></thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
      <div id="remito" class="d-none"></div>
    </div>`;

  const from = el.querySelector('#from');
  const to = el.querySelector('#to');
  const tbody = el.querySelector('#tbody');
  const q = el.querySelector('#q');
  const ac = el.querySelector('#ac');
  const file = el.querySelector('#file');
  const operatorInput = el.querySelector('#operator');

  const depots = listDepots();
  from.innerHTML = depots.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  function renderToOptions() {
    const fromId = from.value;
    const options = depots.filter(d => d.id !== fromId).map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    const prev = to.value;
    to.innerHTML = options;
    if (prev === fromId) to.value = '';
  }
  renderToOptions();

  let lines = [];

  function render(){
    if (!lines.length) { tbody.innerHTML = `<tr><td colspan="4" class="text-muted">Sin líneas</td></tr>`; return; }
    tbody.innerHTML = lines.map(l => `
      <tr>
        <td class="fw-semibold">${l.sku}</td>
        <td>${l.name}</td>
        <td class="text-center">
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-secondary" data-dec="${l.productId}">-</button>
            <input class="form-control form-control-sm text-center" style="width:72px" value="${l.qty}" data-qty="${l.productId}">
            <button class="btn btn-outline-secondary" data-inc="${l.productId}">+</button>
          </div>
        </td>
        <td class="text-end"><button class="btn btn-sm btn-outline-danger" data-remove="${l.productId}"><i class="bi bi-x"></i></button></td>
      </tr>`).join('');
  }

  function runSearch(term) {
    const items = listProducts({ search: term }).slice(0, 10);
    if (!items.length) { ac.classList.add('d-none'); ac.innerHTML = ''; return; }
    ac.innerHTML = items.map((p, i) => `<div class="autocomplete-item ${i===0?'active':''}" data-id="${p.id}"><div class="small text-muted">${p.sku}</div>${p.name}</div>`).join('');
    ac.classList.remove('d-none');
  }
  function commitAutocomplete() {
    const item = ac.querySelector('.autocomplete-item.active');
    if (!item) return;
    const p = listProducts({}).find(x => x.id === item.getAttribute('data-id'));
    const i = lines.findIndex(x => x.productId === p.id);
    if (i === -1) lines.push({ productId: p.id, sku: p.sku, name: p.name, qty: 1 });
    else lines[i].qty += 1;
    q.value = ''; ac.classList.add('d-none'); render();
  }

  el.addEventListener('click', (e) => {
    const dec = e.target.closest('[data-dec]');
    const inc = e.target.closest('[data-inc]');
    const rem = e.target.closest('[data-remove]');
    if (dec) { const id = dec.getAttribute('data-dec'); const l = lines.find(x=>String(x.productId)===String(id)); l.qty = Math.max(0, l.qty-1); render(); }
    if (inc) { const id = inc.getAttribute('data-inc'); const l = lines.find(x=>String(x.productId)===String(id)); l.qty += 1; render(); }
    if (rem) { const id = rem.getAttribute('data-remove'); lines = lines.filter(x=>String(x.productId)!==String(id)); render(); }
  });
  from.addEventListener('change', renderToOptions);
  q.addEventListener('input', () => runSearch(q.value));
  q.addEventListener('keydown', (e) => {
    const items = [...ac.querySelectorAll('.autocomplete-item')];
    if (!items.length) return;
    const idx = Math.max(0, items.findIndex(x => x.classList.contains('active')));
    if (e.key === 'ArrowDown') { e.preventDefault(); items[idx]?.classList.remove('active'); (items[idx+1]||items[0]).classList.add('active'); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[idx]?.classList.remove('active'); (items[idx-1]||items[items.length-1]).classList.add('active'); }
    if (e.key === 'Enter') { e.preventDefault(); commitAutocomplete(); }
    if (e.key === 'Escape') { ac.classList.add('d-none'); }
  });
  ac.addEventListener('click', (e) => { const it = e.target.closest('.autocomplete-item'); if (it) { it.classList.add('active'); commitAutocomplete(); }});

  el.querySelector('#btn-vision').addEventListener('click', async () => {
    const fileObj = file.files?.[0] || null;
    const dets = await detectFromImage(fileObj);
    dets.forEach(d => {
      const p = listProducts({}).find(x => x.sku === d.sku);
      if (!p) return;
      const i = lines.findIndex(x => x.productId === p.id);
      if (i === -1) lines.push({ productId: p.id, sku: p.sku, name: p.name, qty: d.qty });
      else lines[i].qty += d.qty;
    });
    render();
  });

  el.querySelector('#btn-confirm').addEventListener('click', () => {
    const fromId = from.value, toId = to.value;
    if (fromId === toId) return notify.error('Origen y destino iguales');
    if (!lines.length) return notify.warn('Sin líneas');
    const res = transferLines(lines, fromId, toId, operatorInput.value || null);
    if (!res.ok) return notify.error(res.error);
    notify.success('Transferencia realizada');
    // Mostrar remito básico
    const rem = el.querySelector('#remito');
    rem.classList.remove('d-none');
    rem.innerHTML = `<div class="print-area mt-3 border rounded p-3">
      <div class="d-flex justify-content-between">
        <h6 class="mb-2">Remito ${res.remito.id}</h6>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-secondary" id="btn-print-rem">Imprimir</button>
          <button class="btn btn-sm btn-primary" id="btn-pdf-rem">PDF</button>
        </div>
      </div>
      <div class="small text-muted mb-1">${new Date(res.remito.at).toLocaleString()} | ${depots.find(d=>d.id===fromId)?.name} → ${depots.find(d=>d.id===toId)?.name}</div>
      ${res.remito.operator ? `<div class="small">Operador: <span class="fw-semibold">${res.remito.operator}</span></div>` : ''}
      <div class="table-responsive mt-2"><table class="table table-sm"><thead><tr><th>SKU</th><th>Producto</th><th class="text-end">Qty</th></tr></thead>
      <tbody>${lines.map(l=>`<tr><td>${l.sku}</td><td>${l.name}</td><td class="text-end">${l.qty}</td></tr>`).join('')}</tbody></table></div>
    </div>`;
    el.querySelector('#btn-print-rem').addEventListener('click', () => window.print());
    el.querySelector('#btn-pdf-rem').addEventListener('click', () => downloadRemitoPDF(res.remito, depots));
    lines = []; render();
  });

  render();
  return el;
}

function downloadRemitoPDF(remito, depots) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  const from = depots.find(d => d.id === remito.fromDepotId)?.name || '-';
  const to = depots.find(d => d.id === remito.toDepotId)?.name || '-';
  doc.setFontSize(14);
  doc.text(`Remito ${remito.id}`, 10, y); y+=8;
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date(remito.at).toLocaleString()}`, 10, y); y+=6;
  doc.text(`Origen: ${from}`, 10, y); y+=6;
  doc.text(`Destino: ${to}`, 10, y); y+=6;
  if (remito.operator) { doc.text(`Operador: ${remito.operator}`, 10, y); y+=6; }
  doc.line(10, y, 200, y); y+=6;
  doc.text(`SKU`, 10, y); doc.text(`Producto`, 40, y); doc.text(`Qty`, 200, y, { align: 'right' }); y+=6;
  remito.lines.forEach(l => {
    doc.text(l.sku, 10, y);
    doc.text(l.name, 40, y);
    doc.text(String(l.qty), 200, y, { align: 'right' });
    y+=6;
  });
  doc.save(`${remito.id}.pdf`);
}

// JSON download removed per requirements
