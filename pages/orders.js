export default function Orders(){
  const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
  const el = document.createElement('div');
  el.className = 'container py-3';
  el.innerHTML = `
    <h2>Ventas</h2>
    <div class="table-responsive surface rounded-xl p-2">
      <table class="table table-scanix">
        <thead><tr><th>ID</th><th>Fecha</th><th>Depósito</th><th>Vendedor</th><th class="text-end">Total</th><th></th></tr></thead>
        <tbody>
          ${db.orders.slice().reverse().map(o=>`<tr><td>${o.id}</td><td>${dayjs(o.createdAt).format('YYYY-MM-DD HH:mm')}</td><td>${o.depot}</td><td>${o.seller}</td><td class='text-end'>$${o.total.toFixed(2)}</td><td class='text-end'><a class='btn btn-sm btn-outline-secondary' href='#/ticket/${o.id}'>Ticket</a></td></tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  return el;
}

