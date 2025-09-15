export function listProducts({ search='' }={}){
  const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
  const q = search.toLowerCase();
  return db.products.filter(p => !p.deleted && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)));
}

export function getProductBySKU(sku){
  const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
  return db.products.find(p => p.sku === sku && !p.deleted) || null;
}

export function upsertProduct(prod){
  const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
  const idx = db.products.findIndex(p => p.id === prod.id);
  if (idx>-1) db.products[idx] = { ...db.products[idx], ...prod };
  else db.products.push({ ...prod, id: String(Date.now()) });
  localStorage.setItem('SCANIX_DB', JSON.stringify(db));
}

