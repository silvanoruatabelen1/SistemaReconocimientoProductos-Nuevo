import { getCart, updateQty, totals, confirmOrder } from '../services/orders.service.js';
import { getProductBySKU } from '../services/products.service.js';
import { notify } from '../services/notify.service.js';

export default function OrderEdit(){
  const el = document.createElement('div');
  el.className = 'container py-3 vstack';
  el.innerHTML = `
    <div class="hstack space-between">
      <h2 class="mb-0">Editar Orden</h2>
      <div>
        <a href="#/scan" class="btn btn-outline-light"><i class="bi bi-qr-code-scan me-1"></i> Seguir Scanneando</a>
      </div>
    </div>
    <div class="card-scanix p-3 rounded-2xl">
      <div class="row g-2 mb-2">
        <div class="col"><input class="form-control" id="sku" placeholder="Agregar por SKU"></div>
        <div class="col-auto"><button class="btn btn-primary" id="btnAdd">Agregar</button></div>
      </div>
      <div class="table-responsive" style="max-height:420px">
        <table class="table table-scanix align-middle">
          <thead><tr><th>SKU</th><th>Producto</th><th class="text-end">Cant.</th><th class="text-end">Unit.</th><th class="text-end">Total</th><th></th></tr></thead>
          <tbody id="lines"></tbody>
        </table>
      </div>
      <div class="hstack space-between">
        <div class="muted small" id="ruleHint">&nbsp;</div>
        <div class="hstack">
          <div class="me-3"><strong>Subtotal:</strong> <span id="subtotal">$0</span></div>
          <a class="btn btn-success" id="btnConfirm"><i class="bi bi-check2-circle me-1"></i> Confirmar Venta</a>
        </div>
      </div>
    </div>`;

  function render(){
    const cart = getCart();
    const t = totals(cart);
    const tbody = el.querySelector('#lines');
    tbody.innerHTML = '';
    if (!t.lines.length){
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="icon">🛒</div>Sin productos</div></td></tr>`;
    }
    for (const l of t.lines){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${l.sku}</td>
        <td>${l.name} ${l.rule?`<span class='badge-scanix badge-stock-high ms-2'>x${l.rule.min}${l.rule.max?`-${l.rule.max}`:''}</span>`:''}</td>
        <td class="text-end"><div class="hstack justify-content-end"><button class="btn btn-sm btn-outline-secondary" data-dec>-</button><input class="form-control" style="width:80px" value="${l.qty}"><button class="btn btn-sm btn-outline-secondary" data-inc>+</button></div></td>
        <td class="text-end">${l.unit.toFixed(2)}</td>
        <td class="text-end">${l.lineTotal.toFixed(2)}</td>
        <td class="text-end"><button class="btn btn-sm btn-outline-danger" data-del><i class="bi bi-x"></i></button></td>`;
      tr.querySelector('[data-dec]').onclick = ()=>{ updateQty(l.sku, l.qty-1); render(); };
      tr.querySelector('[data-inc]').onclick = ()=>{ updateQty(l.sku, l.qty+1); render(); };
      tr.querySelector('[data-del]').onclick = ()=>{ updateQty(l.sku, 0); render(); };
      tr.querySelector('input').onchange = (ev)=>{ updateQty(l.sku, Number(ev.target.value||1)); render(); };
      tbody.appendChild(tr);
    }
    el.querySelector('#subtotal').textContent = `$${t.subtotal.toFixed(2)}`;
  }

  el.querySelector('#btnAdd').addEventListener('click', ()=>{
    const sku = el.querySelector('#sku').value.trim();
    if (!sku) return;
    const p = getProductBySKU(sku);
    if (!p) return notify.warn('SKU no encontrado');
    updateQty(p.sku, (getCart().lines.find(l=>l.sku===p.sku)?.qty||0)+1);
    el.querySelector('#sku').value='';
    render();
  });

  el.querySelector('#btnConfirm').addEventListener('click', ()=>{
    try {
      const id = confirmOrder();
      notify.success('Venta confirmada');
      location.hash = `#/ticket/${id}`;
    } catch (e) { notify.error(e.message||'Error'); }
  });

  render();
  return el;
}

