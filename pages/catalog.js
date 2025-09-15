import { listProducts } from '../services/products.service.js';

export default function Catalog(){
  const el = document.createElement('div');
  el.className = 'container py-3 vstack';
  el.innerHTML = `
    <div class="hstack space-between">
      <h2 class="mb-0">Catálogo</h2>
      <div class="w-50"><input class="form-control" id="q" placeholder="Buscar nombre o SKU"></div>
    </div>
    <div id="grid" class="row g-3"></div>`;
  const grid = el.querySelector('#grid');
  function render(){
    const items = listProducts({ search: el.querySelector('#q').value||'' });
    grid.innerHTML = '';
    if (!items.length){ grid.innerHTML = `<div class='empty-state'>Sin resultados</div>`; return; }
    for (const p of items){
      const col = document.createElement('div'); col.className='col-sm-6 col-md-4 col-lg-3';
      col.innerHTML = `
        <div class="card-scanix rounded-xl p-3 vstack">
          <div class="small muted">${p.sku}</div>
          <div><strong>${p.name}</strong></div>
          <div class="muted">$${p.price.toFixed(2)}</div>
        </div>`;
      grid.appendChild(col);
    }
  }
  el.querySelector('#q').addEventListener('input', render);
  render();
  return el;
}

