import { list, create, update, softDelete, restore, getById } from '../services/products.service.js';
import { notify } from '../services/notify.service.js';

export function CatalogPage() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h5 class="mb-0">Catálogo</h5>
      <button class="btn btn-primary" id="btn-new"><i class="bi bi-plus-lg me-1"></i>Nuevo</button>
    </div>
    <div class="row g-3">
      <div class="col-12 col-lg-4">
        <div class="card shadow-soft p-3">
          <h6 class="mb-3" id="form-title">Nuevo producto</h6>
          <form id="form">
            <input type="hidden" id="id" />
            <div class="mb-2">
              <label class="form-label">SKU</label>
              <input class="form-control" id="sku" required />
            </div>
            <div class="mb-2">
              <label class="form-label">Nombre</label>
              <input class="form-control" id="name" required />
            </div>
            <div class="mb-2">
              <label class="form-label">Imagen (URL)</label>
              <input class="form-control" id="image" />
            </div>
            <div class="mb-2">
              <label class="form-label">Tags (coma)</label>
              <input class="form-control" id="tags" />
            </div>
            <div class="mb-2">
              <label class="form-label">Price Rules</label>
              <div class="row g-2 align-items-end" id="rules"></div>
              <button type="button" class="btn btn-sm btn-outline-secondary mt-2" id="add-rule"><i class="bi bi-plus"></i> Regla</button>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-success" type="submit">Guardar</button>
              <button class="btn btn-outline-secondary" type="reset" id="btn-reset">Limpiar</button>
            </div>
          </form>
        </div>
      </div>
      <div class="col-12 col-lg-8">
        <div class="card shadow-soft p-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <input class="form-control w-auto" style="max-width: 340px" placeholder="Buscar nombre/SKU/tags" id="q" />
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="show-deleted">
              <label class="form-check-label" for="show-deleted">Ver eliminados</label>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-sm align-middle">
              <thead><tr>
                <th>SKU</th><th>Nombre</th><th>Tags</th><th>Versión</th><th class="text-end">Acciones</th>
              </tr></thead>
              <tbody id="tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;

  const tbody = el.querySelector('#tbody');
  const q = el.querySelector('#q');
  const showDeleted = el.querySelector('#show-deleted');
  const form = el.querySelector('#form');
  const formTitle = el.querySelector('#form-title');
  const rules = el.querySelector('#rules');

  function addRuleRow(data={min:'',max:'',price:''}){
    const row = document.createElement('div');
    row.className = 'row g-2 align-items-end mt-1';
    row.innerHTML = `
      <div class="col-4"><label class="form-label small">Min</label><input class="form-control form-control-sm" data-role="min" value="${data.min}"></div>
      <div class="col-4"><label class="form-label small">Max</label><input class="form-control form-control-sm" data-role="max" value="${data.max}"></div>
      <div class="col-4"><label class="form-label small">Precio</label><input class="form-control form-control-sm" data-role="price" value="${data.price}"></div>
    `;
    rules.appendChild(row);
  }
  el.querySelector('#add-rule').addEventListener('click', () => addRuleRow());

  function resetForm(){
    form.reset();
    form.querySelector('#id').value = '';
    formTitle.textContent = 'Nuevo producto';
    rules.innerHTML = '';
    addRuleRow();
  }
  resetForm();

  function renderList(){
    const items = list({ search: q.value||'', includeDeleted: showDeleted.checked });
    tbody.innerHTML = items.map(p => `
      <tr class="${p.deleted?'table-warning':''}">
        <td class="fw-semibold">${p.sku}</td>
        <td>${p.name}</td>
        <td>${(p.tags||[]).join(', ')}</td>
        <td>${p.version||1}</td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" data-edit="${p.id}"><i class="bi bi-pencil"></i></button>
            ${p.deleted
              ? `<button class="btn btn-outline-success" data-restore="${p.id}"><i class="bi bi-arrow-counterclockwise"></i></button>`
              : `<button class="btn btn-outline-danger" data-del="${p.id}"><i class="bi bi-trash"></i></button>`}
          </div>
        </td>
      </tr>`).join('');
  }

  el.addEventListener('click', (e) => {
    const btnE = e.target.closest('[data-edit]');
    const btnD = e.target.closest('[data-del]');
    const btnR = e.target.closest('[data-restore]');
    if (btnE) {
      const id = btnE.getAttribute('data-edit');
      const p = getById(id);
      if (!p) return;
      formTitle.textContent = `Editar ${p.sku}`;
      form.querySelector('#id').value = p.id;
      form.querySelector('#sku').value = p.sku;
      form.querySelector('#name').value = p.name;
      form.querySelector('#image').value = p.image || '';
      form.querySelector('#tags').value = (p.tags||[]).join(', ');
      rules.innerHTML='';
      (p.priceRules||[]).forEach(r => addRuleRow({ min:r.min, max:r.max ?? '', price:r.price }));
      if (!p.priceRules?.length) addRuleRow();
    }
    if (btnD) { softDelete(btnD.getAttribute('data-del')); notify.warn('Producto eliminado'); renderList(); }
    if (btnR) { restore(btnR.getAttribute('data-restore')); notify.success('Producto reactivado'); renderList(); }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = form.querySelector('#id').value || null;
    const data = {
      sku: form.querySelector('#sku').value.trim(),
      name: form.querySelector('#name').value.trim(),
      image: form.querySelector('#image').value.trim(),
      tags: form.querySelector('#tags').value.split(',').map(s=>s.trim()).filter(Boolean),
      priceRules: [...rules.querySelectorAll('.row')].map(r => ({
        min: r.querySelector('[data-role="min"]').value,
        max: r.querySelector('[data-role="max"]').value,
        price: r.querySelector('[data-role="price"]').value
      }))
    };
    try {
      if (id) { update(id, data); notify.success('Actualizado (version++)'); }
      else { create(data); notify.success('Creado'); }
      resetForm(); renderList();
    } catch (err) { notify.error(err.message || 'Error'); }
  });

  el.querySelector('#btn-reset').addEventListener('click', resetForm);
  el.querySelector('#btn-new').addEventListener('click', resetForm);
  q.addEventListener('input', renderList);
  showDeleted.addEventListener('change', renderList);

  renderList();
  return el;
}

