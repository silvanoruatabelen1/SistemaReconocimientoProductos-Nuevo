import { getOrderById } from '../services/orders.service.js';
import { listDepots } from '../services/stock.service.js';

export function TicketPage(id) {
  const order = getOrderById(id);
  const el = document.createElement('div');
  if (!order) {
    el.innerHTML = `<div class="alert alert-warning">Ticket no encontrado</div>`;
    return el;
  }
  const depot = listDepots().find(d => d.id === order.depotId);
  const fmt = (n) => new Intl.NumberFormat('es-AR',{ style:'currency', currency:'ARS' }).format(n||0);
  el.innerHTML = `
    <div class="print-area">
    <div class="card shadow-soft p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Ticket ${order.id}</h5>
        <div class="d-flex gap-2">
          <a class="btn btn-outline-secondary btn-sm" href="#/orders"><i class="bi bi-arrow-left"></i> Volver</a>
          <button class="btn btn-outline-secondary btn-sm" id="btn-print"><i class="bi bi-printer"></i> Imprimir</button>
          <button class="btn btn-primary btn-sm" id="btn-pdf"><i class="bi bi-filetype-pdf"></i> PDF</button>
        </div>
      </div>
      <div class="small text-muted mb-1">Fecha: ${new Date(order.at).toLocaleString()} | Depósito: ${depot?.name || '-'}</div>
      ${order.operator ? `<div class="small">Operador: <span class="fw-semibold">${order.operator}</span></div>` : ''}
      <div class="table-responsive">
        <table class="table table-sm">
          <thead><tr><th>SKU</th><th>Producto</th><th class="text-end">Qty</th><th class="text-end">Unit</th><th class="text-end">Subtotal</th></tr></thead>
          <tbody>
            ${order.lines.map(l => `<tr><td>${l.sku}</td><td>${l.name}${l.version?` <span class=\"badge text-bg-light\">v${l.version}</span>`:''}</td><td class="text-end">${l.qty}</td><td class="text-end">${fmt(l.unitPrice)}</td><td class="text-end">${fmt(l.subtotal)}</td></tr>`).join('')}
          </tbody>
          <tfoot><tr><th colspan="4" class="text-end">Total</th><th class="text-end">${fmt(order.total)}</th></tr></tfoot>
        </table>
      </div>
    </div>
    </div>`;

  el.querySelector('#btn-print').addEventListener('click', () => window.print());
  el.querySelector('#btn-pdf').addEventListener('click', () => downloadPDF(order));
  return el;
}

function downloadPDF(order) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  doc.setFontSize(14);
  doc.text(`Ticket ${order.id}`, 10, y); y+=8;
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date(order.at).toLocaleString()}`, 10, y); y+=6;
  if (order.operator) { doc.text(`Operador: ${order.operator}`, 10, y); y+=6; }
  doc.line(10, y, 200, y); y+=6;
  doc.text(`SKU`, 10, y); doc.text(`Producto`, 40, y); doc.text(`Qty`, 140, y, { align: 'right' }); doc.text(`Unit`, 170, y, { align: 'right' }); doc.text(`Subtotal`, 200, y, { align: 'right' }); y+=6;
  order.lines.forEach(l => {
    doc.text(l.sku, 10, y);
    doc.text(l.name, 40, y);
    doc.text(String(l.qty), 140, y, { align: 'right' });
    doc.text(formatCurrency(l.unitPrice), 170, y, { align: 'right' });
    doc.text(formatCurrency(l.subtotal), 200, y, { align: 'right' });
    y+=6;
  });
  y+=4; doc.line(10, y, 200, y); y+=8;
  doc.setFontSize(12);
  doc.text(`Total: ${formatCurrency(order.total)}`, 200, y, { align: 'right' });
  doc.save(`${order.id}.pdf`);
}

function formatCurrency(n){
  return new Intl.NumberFormat('es-AR',{ style:'currency', currency:'ARS' }).format(n||0);
}
