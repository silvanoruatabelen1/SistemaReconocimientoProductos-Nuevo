import { list as listProducts, getById as getProductById } from '../services/products.service.js';
import { getDraft, addLine, removeLine, setLineQty, setDepotToDraft, computeTotals, confirmOrder, setOperatorToDraft } from '../services/orders.service.js';
import { listDepots, getQty } from '../services/stock.service.js';
import { notify } from '../services/notify.service.js';

export function OrderEditPage() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card shadow-soft p-3">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h5 class="mb-0">Pedido</h5>
        <div class="d-flex gap-2 align-items-start">
          <div style="min-width:240px">
            <label class="form-label">Operador (opcional)</label>
            <input id="operator" class="form-control form-control-sm" placeholder="Nombre del operador" />
          </div>
          <div>
            <label class="form-label">Depósito</label>
            <select class="form-select form-select-sm" id="depot"></select>
          </div>
          <div class="pt-4">
            <button class="btn btn-success btn-sm" id="btn-confirm"><i class="bi bi-check2-circle me-1"></i>Confirmar</button>
          </div>
        </div>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-12 col-md-6 position-relative">
          <label class="form-label">Agregar producto</label>
          <input type="text" class="form-control" id="q" placeholder="Buscar por nombre, SKU o tag" autocomplete="off"/>
          <div class="autocomplete-list d-none" id="ac"></div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead><tr>
            <th>SKU</th><th>Producto</th><th class="text-end">Regla</th><th class="text-center">Qty</th><th class="text-end">Unit</th><th class="text-end">Subtotal</th><th></th>
          </tr></thead>
          <tbody id="tbody"></tbody>
          <tfoot>
            <tr><th colspan="5" class="text-end">Total</th><th class="text-end" id="total">$ 0.00</th><th></th></tr>
          </tfoot>
        </table>
      </div>
    </div>`;

  const tbody = el.querySelector('#tbody');
  const depotSel = el.querySelector('#depot');
  const operatorInput = el.querySelector('#operator');
  const q = el.querySelector('#q');
  const ac = el.querySelector('#ac');

  let draft = getDraft();

  function renderDepots() {
    const depots = listDepots();
    depotSel.innerHTML = depots.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    if (draft?.depotId) depotSel.value = draft.depotId;
    operatorInput.value = draft?.operator || '';
  }

  function fmt(n) { return new Intl.NumberFormat('es-AR',{ style:'currency', currency:'ARS' }).format(n||0); }

  function renderLines() {
    draft = getDraft() || { lines: [] };
    const { lines, total } = computeTotals(draft);
    if (!lines.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-muted">Sin productos</td></tr>`;
      el.querySelector('#total').textContent = fmt(0);
      return;
    }
    tbody.innerHTML = lines.map(l => {
      const ruleTxt = l.rule ? `[${l.rule.min}-${l.rule.max ?? '∞'}] $${l.rule.price}` : '-';
      const available = depotSel.value ? getQty(l.productId, depotSel.value) : null;
      const stockWarn = (available!=null && available <= 5) ? '<span class="badge text-bg-warning">stock bajo</span>' : '';
      return `
        <tr>
          <td class="fw-semibold">${l.sku}</td>
          <td>${l.name} ${available!=null?`<div class=\"small text-muted\">Disp: ${available} ${stockWarn}</div>`:''}</td>
          <td class="text-end"><span class="badge text-bg-light">${ruleTxt}</span></td>
          <td class="text-center">
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-outline-secondary" data-dec="${l.productId}">-</button>
              <input class="form-control form-control-sm text-center" style="width:72px" value="${l.qty}" data-qty="${l.productId}">
              <button class="btn btn-outline-secondary" data-inc="${l.productId}">+</button>
            </div>
          </td>
          <td class="text-end">${fmt(l.unitPrice)}</td>
          <td class="text-end">${fmt(l.subtotal)}</td>
          <td class="text-end"><button class="btn btn-sm btn-outline-danger" data-remove="${l.productId}"><i class="bi bi-x"></i></button></td>
        </tr>`;
    }).join('');
    el.querySelector('#total').textContent = fmt(total);
  }

  function handleQtyButtons(e) {
    const dec = e.target.closest('[data-dec]');
    const inc = e.target.closest('[data-inc]');
    const rem = e.target.closest('[data-remove]');
    if (dec) {
      const id = dec.getAttribute('data-dec');
      const cur = getDraft().lines.find(l => String(l.productId) === String(id))?.qty || 0;
      setLineQty(id, Math.max(0, cur - 1));
      renderLines();
    }
    if (inc) {
      const id = inc.getAttribute('data-inc');
      addLine(id, 1);
      renderLines();
    }
    if (rem) {
      const id = rem.getAttribute('data-remove');
      removeLine(id);
      renderLines();
    }
  }

  function runSearch(term) {
    const q = term.trim();
    if (!q) { ac.classList.add('d-none'); ac.innerHTML = ''; return; }
    const items = listProducts({ search: q }).slice(0, 10);
    if (!items.length) { ac.classList.add('d-none'); ac.innerHTML = ''; return; }
    ac.innerHTML = items.map((p, i) => `<div class="autocomplete-item ${i===0?'active':''}" data-id="${p.id}"><div class="small text-muted">${p.sku}</div>${p.name}</div>`).join('');
    ac.classList.remove('d-none');
  }

  function commitAutocomplete() {
    const item = ac.querySelector('.autocomplete-item.active');
    if (!item) return;
    addLine(item.getAttribute('data-id'), 1);
    q.value = '';
    ac.classList.add('d-none');
    renderLines();
  }

  // Bindings
  el.addEventListener('click', handleQtyButtons);
  depotSel.addEventListener('change', () => setDepotToDraft(depotSel.value));
  operatorInput.addEventListener('input', () => setOperatorToDraft(operatorInput.value));

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

  el.querySelector('#btn-confirm').addEventListener('click', () => {
    try {
      const depotId = depotSel.value;
      const res = confirmOrder(depotId);
      if (!res.ok) return notify.error(res.error);
      notify.success('Venta confirmada');
      location.hash = '#/ticket/' + res.order.id;
    } catch (e) { notify.error(e.message || 'Error'); }
  });

  renderDepots();
  renderLines();
  return el;
}
