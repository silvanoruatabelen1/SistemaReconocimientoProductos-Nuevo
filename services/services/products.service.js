const LS_PRODUCTS = 'products';

function load() {
  return JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
}
function save(items) {
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(items));
}
export function list({ search = '', includeDeleted = false } = {}) {
  const q = search.trim().toLowerCase();
  let items = load();
  if (!includeDeleted) items = items.filter(p => !p.deleted);
  if (q) {
    items = items.filter(p =>
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }
  return items.sort((a,b) => a.sku.localeCompare(b.sku));
}
export function getById(id) { return load().find(p => p.id === id); }
export function getBySKU(sku) { return load().find(p => p.sku === sku); }
export function create(data) {
  const items = load();
  const id = cryptoRandomId();
  const product = {
    id,
    sku: data.sku,
    name: data.name,
    image: data.image || '',
    tags: data.tags || [],
    priceRules: normalizeRules(data.priceRules || []),
    version: 1,
    deleted: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  items.push(product);
  save(items);
  return product;
}
export function update(id, patch) {
  const items = load();
  const idx = items.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Producto no encontrado');
  const prev = items[idx];
  const next = {
    ...prev,
    ...patch,
    priceRules: patch.priceRules ? normalizeRules(patch.priceRules) : prev.priceRules,
    version: (prev.version || 1) + 1,
    updatedAt: Date.now()
  };
  items[idx] = next;
  save(items);
  return next;
}
export function softDelete(id) {
  return update(id, { deleted: true });
}
export function restore(id) {
  return update(id, { deleted: false });
}
function normalizeRules(rules) {
  return rules
    .map(r => ({
      min: Number(r.min) || 1,
      max: r.max == null || r.max === '' ? null : Number(r.max),
      price: Number(r.price) || 0
    }))
    .sort((a,b) => (a.min||0)-(b.min||0));
}
function cryptoRandomId() {
  try {
    return (self.crypto || window.crypto).getRandomValues(new Uint32Array(1))[0].toString(16) + Date.now().toString(16);
  } catch (_) {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
  }
}

