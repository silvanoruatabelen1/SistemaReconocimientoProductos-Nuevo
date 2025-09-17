import { listOrders } from '../services/orders.service.js';
import { listDepots } from '../services/stock.service.js';

export function OrdersPage() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card shadow-soft p-3">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="mb-0">Historial de Ventas</h5>
        <select class="form-select form-select-sm" id="depot"></select>
      </div>
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead><tr><th>Fecha</th><th>Ticket</th><th>Depósito</th><th class="text-end">Total</th><th></th></tr></thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
    </div>`;

  const tbody = el.querySelector('#tbody');
  const depotSel = el.querySelector('#depot');
  const depots = listDepots();
  depotSel.innerHTML = `<option value="">Todos</option>` + depots.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

  function fmt(n) { return new Intl.NumberFormat('es-AR',{ style:'currency', currency:'ARS' }).format(n||0); }

  function render(){
    const depotId = depotSel.value || null;
    const orders = listOrders({ depotId });
    if (!orders.length) { tbody.innerHTML = `<tr><td colspan="5" class="text-muted">Sin ventas</td></tr>`; return; }
    tbody.innerHTML = orders.map(o => {
      const d = depots.find(x => x.id === o.depotId);
      return `<tr>
        <td>${new Date(o.at).toLocaleString()}</td>
        <td class="fw-semibold">${o.id}</td>
        <td>${d?.name || '-'}</td>
        <td class="text-end">${fmt(o.total)}</td>
        <td class="text-end"><a class="btn btn-sm btn-outline-primary" href="#/ticket/${o.id}"><i class="bi bi-receipt"></i> Ver</a></td>
      </tr>`;
    }).join('');
  }
  depotSel.addEventListener('change', render);
  render();
  return el;
}

