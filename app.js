const API = (location.protocol.startsWith('http') ? (location.origin.replace(/\/$/, "") + "/api") : null);
let USE_MOCK = false;

const SEED = [
  { id:'1', name:'Aceite de Oliva Extra Virgen 500ml', sku:'AOL-500', category:'Aceites', currentStock:45, minStock:20, maxStock:100, price:8.5, lastMovement:'2024-01-15', movementType:'salida', warehouse:'Depósito Central' },
  { id:'2', name:'Arroz Integral 1kg', sku:'ARR-1000', category:'Granos', currentStock:8, minStock:15, maxStock:80, price:3.2, lastMovement:'2024-01-14', movementType:'salida', warehouse:'Depósito Central' },
  { id:'3', name:'Pasta Italiana 500g', sku:'PAS-500', category:'Pastas', currentStock:67, minStock:25, maxStock:120, price:2.9, lastMovement:'2024-01-13', movementType:'entrada', warehouse:'Depósito Norte' },
  { id:'4', name:'Conserva de Tomate 400g', sku:'CON-400', category:'Conservas', currentStock:2, minStock:10, maxStock:60, price:1.8, lastMovement:'2024-01-12', movementType:'salida', warehouse:'Depósito Central' },
];

let state = { items: [], search:'', warehouse:'all', stock:'all' };

function fmtCurrency(n){
  return new Intl.NumberFormat('es-AR',{style:'currency',currency:'USD'}).format(n);
}

function stockInfo(current, min, max){
  const pct = Math.max(0, Math.min(100, (current/max)*100));
  if (current <= min) return {label:'Crítico', cls:'low', pct};
  if (current >= max*0.8) return {label:'Alto', cls:'high', pct};
  return {label:'Normal', cls:'normal', pct};
}

async function loadInventory(){
  if (!API) {
    USE_MOCK = true;
    state.items = SEED.map(x=>({ ...x }));
    return render();
  }
  try {
    const res = await fetch(`${API}/inventory`, { cache:'no-store' });
    if (!res.ok) throw new Error('no ok');
    const data = await res.json();
    state.items = Array.isArray(data) ? data : [];
    USE_MOCK = false;
  } catch {
    state.items = SEED.map(x=>({ ...x }));
    USE_MOCK = true;
  }
  render();
}

function uniqueWarehouses(items){
  const set = new Set(items.map(i=>i.warehouse));
  return ["all", ...Array.from(set)];
}

function filtered(){
  return state.items.filter(i=>{
    const s = state.search.toLowerCase();
    const matchSearch = i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s);
    const matchWh = state.warehouse === 'all' || i.warehouse === state.warehouse;
    let matchStock = true;
    if (state.stock === 'low') matchStock = i.currentStock <= i.minStock;
    else if (state.stock === 'normal') matchStock = i.currentStock > i.minStock && i.currentStock < i.maxStock*0.8;
    else if (state.stock === 'high') matchStock = i.currentStock >= i.maxStock*0.8;
    return matchSearch && matchWh && matchStock;
  });
}

function renderSummary(list){
  document.getElementById('statProducts').textContent = list.length;
  const low = state.items.filter(i=>i.currentStock <= i.minStock).length;
  document.getElementById('statLow').textContent = low;
  const total = list.reduce((a,i)=>a + (i.currentStock*i.price),0);
  document.getElementById('statValue').textContent = fmtCurrency(total);
}

function renderWarehouses(){
  const sel = document.getElementById('selWarehouse');
  const opts = uniqueWarehouses(state.items);
  sel.innerHTML = '';
  for (const w of opts){
    const opt = document.createElement('option');
    opt.value = w; opt.textContent = w === 'all' ? 'Todos los depósitos' : w;
    sel.appendChild(opt);
  }
  sel.value = state.warehouse;
}

function card(item){
  const info = stockInfo(item.currentStock, item.minStock, item.maxStock);
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <div class="card-content list-card">
      <div class="list-head">
        <div class="grow">
          <h3 style="margin:0;font-weight:600">${item.name}</h3>
          <div class="muted-line">SKU: ${item.sku} • ${item.category} • ${item.warehouse}</div>
        </div>
        <div class="right">
          <span class="badge ${info.cls}">${info.label}</span>
          <div class="stat">${item.currentStock}</div>
          <div class="muted-line">de ${item.maxStock}</div>
        </div>
      </div>
      <div>
        <div class="row" style="justify-content:space-between">
          <span class="muted small">Mínimo: ${item.minStock}</span>
          <span class="muted small">Máximo: ${item.maxStock}</span>
        </div>
        <div class="bar"><span style="width:${info.pct}%"></span></div>
      </div>
      <div class="list-footer">
        <div class="muted small">
          <span>Precio: ${fmtCurrency(item.price)}</span>
          <span style="margin-left:12px">Valor: ${fmtCurrency(item.price*item.currentStock)}</span>
          <span style="margin-left:12px">Último: ${item.lastMovement}</span>
        </div>
        <div>
          <button class="btn small outline" data-act="adjust" data-id="${item.id}">Ajustar Stock</button>
          <button class="btn small outline" data-act="history" data-id="${item.id}" style="margin-left:8px">Ver Historial</button>
        </div>
      </div>
    </div>`;

  el.addEventListener('click', async (ev)=>{
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    const act = t.getAttribute('data-act');
    const id = t.getAttribute('data-id');
    if (!act || !id) return;
    if (act === 'adjust'){
      const val = prompt('Ingrese ajuste de stock (ej. 5 o -3):', '1');
      if (val==null) return;
      const delta = Number(val);
      if (Number.isNaN(delta)) return alert('Valor inválido');
      if (USE_MOCK || !API){
        const idx = state.items.findIndex(x=>String(x.id)===String(id));
        if (idx>-1){
          const it = {...state.items[idx]};
          it.currentStock = Math.max(0, (it.currentStock||0)+delta);
          it.lastMovement = new Date().toISOString().slice(0,10);
          it.movementType = delta>=0 ? 'entrada':'salida';
          state.items[idx]=it;
          render();
          alert('Stock actualizado (modo sin backend)');
        }
      } else {
        try{
          await fetch(`${API}/inventory/adjust`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id, delta})});
          await loadInventory();
          alert('Stock actualizado');
        }catch(e){ alert('Error al ajustar stock'); }
      }
    }
    if (act === 'history'){
      alert('Historial en desarrollo');
    }
  });
  return el;
}

function renderList(list){
  const listEl = document.getElementById('list');
  const emptyEl = document.getElementById('empty');
  listEl.innerHTML = '';
  if (!list.length){
    emptyEl.classList.remove('hidden');
  } else {
    emptyEl.classList.add('hidden');
    for (const it of list){
      listEl.appendChild(card(it));
    }
  }
}

function render(){
  const list = filtered();
  renderSummary(list);
  renderWarehouses();
  renderList(list);
}

function wire(){
  document.getElementById('txtSearch').addEventListener('input', (e)=>{
    state.search = e.target.value || '';
    render();
  });
  document.getElementById('selWarehouse').addEventListener('change', (e)=>{
    state.warehouse = e.target.value;
    render();
  });
  document.getElementById('selStock').addEventListener('change', (e)=>{
    state.stock = e.target.value;
    render();
  });
  document.getElementById('btnExport').addEventListener('click', ()=>{
    alert('Exportación en desarrollo');
  });
  document.getElementById('btnFilters').addEventListener('click', ()=>{
    alert('Filtros avanzados en desarrollo');
  });
  document.getElementById('btnClear').addEventListener('click', ()=>{
    state = { ...state, search:'', warehouse:'all', stock:'all' };
    document.getElementById('txtSearch').value='';
    document.getElementById('selStock').value='all';
    render();
  });
}

wire();
loadInventory();

