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
    <div class="d-flex justify-content-end gap-2 mb-3">
      <button class="btn btn-outline-secondary btn-sm" id="btn-print"><i class="bi bi-printer"></i> Imprimir</button>
      <button class="btn btn-primary btn-sm" id="btn-pdf"><i class="bi bi-filetype-pdf"></i> PDF</button>
    </div>
    <div class="print-area">
    <div class="card shadow-soft p-4">
      <div class="text-center mb-3">
        <img data-logo src="./public/assets/logo.svg" alt="SCANIX – Sistema de Reconocimiento de Productos" class="mb-2" style="max-height:80px"/>
        <div class="fw-bold">SCANIX – Sistema de Reconocimiento de Productos</div>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Ticket ${order.id}</h5>
      </div>
      <div class="small text-muted mb-1">Fecha: ${new Date(order.confirmedAt || order.createdAt).toLocaleString()} | Depósito: ${depot?.name || '-'}</div>
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
      <div class="text-center mt-3">
        <div>Gracias por su compra</div>
      </div>
    </div>
    </div>`;

  el.querySelector('#btn-print').addEventListener('click', () => window.print());
  el.querySelector('#btn-pdf').addEventListener('click', () => downloadTicketPDF(order));
  // Ensure logo matches current theme when navigating directly here
  const logo = el.querySelector('img[data-logo]');
  if (logo) {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    logo.src = theme === 'dark' ? './public/assets/logo-dark.svg' : './public/assets/logo.svg';
  }
  return el;
}

export function downloadTicketPDF(order) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 10;
  // Header: logo + name (no subtitle)
  try {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const logoSrc = theme === 'dark' ? './public/assets/logo-dark.svg' : './public/assets/logo.svg';
    const img = new Image();
    img.onload = () => {
      const logoHeight = 14; // mm
      const logoWidth = 14; // mm (square logo)
      const x = (pageWidth - logoWidth) / 2;
      doc.addImage(img, 'PNG', x, y, logoWidth, logoHeight, undefined, 'FAST');
      y += logoHeight + 4;
      doc.setFontSize(12);
      doc.text('SCANIX – Sistema de Reconocimiento de Productos', pageWidth/2, y, { align: 'center' });
      y += 3; doc.line(10, y, 200, y); y += 6;
      // Body
      doc.setFontSize(14);
      doc.text(`Ticket ${order.id}`, 10, y); y+=8;
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date(order.confirmedAt || order.createdAt).toLocaleString()}`, 10, y); y+=6;
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
      y += 10;
      doc.setFontSize(10);
      doc.text('Gracias por su compra', pageWidth/2, y, { align: 'center' });
      doc.save(`${order.id}.pdf`);
    };
    img.src = logoSrc;
  } catch (e) {
    // Fallback without logo
    doc.setFontSize(12);
    doc.text('SCANIX – Sistema de Reconocimiento de Productos', pageWidth/2, y, { align: 'center' });
    y += 3; doc.line(10, y, 200, y); y += 6;
    doc.setFontSize(14);
    doc.text(`Ticket ${order.id}`, 10, y); y+=8;
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date(order.confirmedAt || order.createdAt).toLocaleString()}`, 10, y); y+=6;
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
    y += 10;
    doc.setFontSize(10);
    doc.text('Gracias por su compra', pageWidth/2, y, { align: 'center' });
    doc.save(`${order.id}.pdf`);
  }
}

function formatCurrency(n){
  return new Intl.NumberFormat('es-AR',{ style:'currency', currency:'ARS' }).format(n||0);
}
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
    <div class="d-flex justify-content-end gap-2 mb-3">
      <button class="btn btn-outline-secondary btn-sm" id="btn-print"><i class="bi bi-printer"></i> Imprimir</button>
      <button class="btn btn-primary btn-sm" id="btn-pdf"><i class="bi bi-filetype-pdf"></i> PDF</button>
    </div>
    <div class="print-area">
    <div class="card shadow-soft p-4">
      <div class="text-center mb-3">
        <img data-logo src="./public/assets/logo.svg" alt="SCANIX – Sistema de Reconocimiento de Productos" class="mb-2" style="max-height:80px"/>
        <div class="fw-bold">SCANIX – Sistema de Reconocimiento de Productos</div>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Ticket ${order.id}</h5>
      </div>
      <div class="small text-muted mb-1">Fecha: ${new Date(order.confirmedAt || order.createdAt).toLocaleString()} | Depósito: ${depot?.name || '-'}</div>
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
      <div class="text-center mt-3">
        <div>Gracias por su compra</div>
      </div>
    </div>
    </div>`;

  el.querySelector('#btn-print').addEventListener('click', () => window.print());
  el.querySelector('#btn-pdf').addEventListener('click', () => downloadTicketPDF(order));
  // Ensure logo matches current theme when navigating directly here
  const logo = el.querySelector('img[data-logo]');
  if (logo) {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    logo.src = theme === 'dark' ? './public/assets/logo-dark.svg' : './public/assets/logo.svg';
  }
  return el;
}

export function downloadTicketPDF(order) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 10;
  let done = false;

  const renderBody = () => {
    if (done) return; done = true;
    doc.setFontSize(12);
    doc.text('SCANIX – Sistema de Reconocimiento de Productos', pageWidth/2, y, { align: 'center' });
    y += 3; doc.line(10, y, 200, y); y += 6;
    doc.setFontSize(14);
    doc.text(`Ticket ${order.id}`, 10, y); y+=8;
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date(order.confirmedAt || order.createdAt).toLocaleString()}`, 10, y); y+=6;
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
    y += 10;
    doc.setFontSize(10);
    doc.text('Gracias por su compra', pageWidth/2, y, { align: 'center' });
    doc.save(`${order.id}.pdf`);
  };

  try {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const logoSrc = theme === 'dark' ? './public/assets/logo-dark.svg' : './public/assets/logo.svg';
    const img = new Image();
    img.onload = () => {
      try { const s=14; const x=(pageWidth - s)/2; doc.addImage(img, 'PNG', x, y, s, s, undefined, 'FAST'); y += s + 4; } catch (_) {}
      renderBody();
    };
    img.onerror = renderBody;
    setTimeout(renderBody, 400);
    img.src = logoSrc;
  } catch (_) {
    renderBody();
  }
}

function formatCurrency(n){
  return new Intl.NumberFormat('es-AR',{ style:'currency', currency:'ARS' }).format(n||0);
}
