export default function TicketPage({ id }){
  const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
  const t = db.orders.find(o => o.id === id);
  const el = document.createElement('div');
  el.className = 'container py-3';
  if (!t){ el.innerHTML = `<div class='empty-state'>Ticket no encontrado</div>`; return el; }
  el.innerHTML = `
    <div class="card-scanix p-4 rounded-2xl">
      <div class="hstack space-between">
        <div>
          <h2 class="mb-0">Ticket #${t.id}</h2>
          <div class="muted small">${dayjs(t.createdAt).format('YYYY-MM-DD HH:mm')}</div>
        </div>
        <div>
          <button class="btn btn-outline-secondary me-2" id="btnPrint"><i class="bi bi-printer"></i></button>
          <button class="btn btn-primary" id="btnPDF"><i class="bi bi-filetype-pdf me-1"></i> PDF</button>
        </div>
      </div>
      <hr/>
      <div class="vstack">
        <div><strong>Vendedor:</strong> ${t.seller}</div>
        <div><strong>Depósito:</strong> ${t.depot}</div>
      </div>
      <div class="table-responsive mt-3">
        <table class="table table-scanix">
          <thead><tr><th>SKU</th><th>Producto</th><th class="text-end">Cant.</th><th class="text-end">Unit.</th><th class="text-end">Total</th></tr></thead>
          <tbody>
            ${t.lines.map(l=>`<tr><td>${l.sku}</td><td>${l.name}</td><td class='text-end'>${l.qty}</td><td class='text-end'>${l.unit.toFixed(2)}</td><td class='text-end'>${l.lineTotal.toFixed(2)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="text-end"><strong>Total:</strong> $${t.total.toFixed(2)}</div>
    </div>`;
  el.querySelector('#btnPrint').onclick = ()=>window.print();
  el.querySelector('#btnPDF').onclick = ()=>{
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text(`Ticket #${t.id}`, 10, 10);
      doc.text(`Fecha: ${dayjs(t.createdAt).format('YYYY-MM-DD HH:mm')}`, 10, 18);
      let y=30;
      t.lines.forEach(l=>{ doc.text(`${l.qty} x ${l.name} (${l.sku}) - $${l.lineTotal.toFixed(2)}`, 10, y); y+=8; });
      doc.text(`Total: $${t.total.toFixed(2)}`, 10, y+6);
      doc.save(`ticket-${t.id}.pdf`);
    } catch { alert('jsPDF no disponible'); }
  };
  return el;
}

