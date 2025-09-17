import { listDepots } from '../services/stock.service.js';
import { salesByDay } from '../services/reports.service.js';

export function ReportsPage() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card shadow-soft p-3">
      <div class="d-flex align-items-center justify-content-between">
        <h5 class="mb-0">Reportes</h5>
        <select class="form-select form-select-sm" id="depot"></select>
      </div>
      <div class="mt-3">
        <div id="empty" class="text-center text-muted py-5 d-none">Sin ventas para este depósito/periodo</div>
        <canvas id="chart" height="120"></canvas>
      </div>
    </div>`;

  const depotSel = el.querySelector('#depot');
  const depots = listDepots();
  depotSel.innerHTML = `<option value="">Todos</option>` + depots.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

  let chart;
  function render() {
    const depotId = depotSel.value || null;
    const { labels, data } = salesByDay({ depotId });
    const ctx = el.querySelector('#chart');
    const empty = el.querySelector('#empty');
    if (chart) chart.destroy();
    if (!labels.length) {
      empty.classList.remove('d-none');
      ctx.classList.add('d-none');
      return;
    }
    empty.classList.add('d-none');
    ctx.classList.remove('d-none');
    chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Ventas', data, borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,.15)', tension: .3 }] },
      options: { plugins: { legend: { display: false } } }
    });
  }
  depotSel.addEventListener('change', render);
  render();
  return el;
}
