// Local storage adapter (mock). Keys are namespaced under scanix.*
import { unitPriceForQty } from '../pricing.helpers.js';

const NS = 'scanix.';
function read(key, fallback) {
  try { const raw = localStorage.getItem(NS+key); return raw ? JSON.parse(raw) : (fallback ?? null); } catch { return fallback ?? null; }
}
function write(key, value) {
  try { localStorage.setItem(NS+key, JSON.stringify(value)); } catch {}
}

// seed initialize if missing
function ensureArrays() {
  if (!read('products')) write('products', []);
  if (!read('tranches')) write('tranches', {}); // {productId: [{desde_cant, precio_unit}]}
  if (!read('deposits')) write('deposits', []);
  if (!read('stock')) write('stock', []); // [{productId, depositId, qty}]
  if (!read('orders')) write('orders', []);
  if (!read('movements')) write('movements', []);
}
ensureArrays();

// products
export function listProducts({ search='' } = {}) {
  const q = (search||'').toLowerCase();
  let items = read('products', []);
  if (q) items = items.filter(p => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
  return items;
}
export function createProduct(payload) {
  const items = read('products', []);
  const id = cryptoRandomId();
  const product = { id, sku: payload.sku, name: payload.name, image: payload.image||'', tags: payload.tags||[], deleted:false, version:1 };
  items.push(product); write('products', items); return product;
}
export function updateProduct(id, payload) {
  const items = read('products', []);
  const idx = items.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Producto no encontrado');
  items[idx] = { ...items[idx], ...payload, version: (items[idx].version||1)+1 };
  write('products', items); return items[idx];
}
export function removeProduct(id) {
  const items = read('products', []);
  const idx = items.findIndex(p => p.id === id);
  if (idx !== -1) { items[idx].deleted = true; write('products', items); }
  return true;
}

// pricing tranches
export function listTranches(productId) {
  const t = read('tranches', {}); return t[productId] || [];
}
export function setTranches(productId, tranches) {
  const { ok } = validateTranchesLocal(tranches);
  if (!ok) throw new Error('Tramos inválidos');
  const t = read('tranches', {}); t[productId] = [...tranches]; write('tranches', t); return t[productId];
}
function validateTranchesLocal(tranches) {
  const ts = [...tranches].sort((a,b) => a.desde_cant - b.desde_cant);
  for (let i=1;i<ts.length;i++) if (ts[i].desde_cant <= ts[i-1].desde_cant) return { ok:false };
  return { ok:true };
}

// deposits / stock
export function listDeposits() { return read('deposits', []); }
export function upsertDeposit(payload) {
  const ds = read('deposits', []);
  const id = payload.id || cryptoRandomId();
  const idx = ds.findIndex(d => d.id === id);
  const rec = { id, name: payload.name };
  if (idx === -1) ds.push(rec); else ds[idx] = rec;
  write('deposits', ds); return rec;
}
export function getStock(productId, depositId) {
  const s = read('stock', []);
  return s.find(r => r.productId === productId && r.depositId === depositId)?.qty || 0;
}

// orders / movements
export function createOrder({ depositId, items }) {
  if (!depositId) throw new Error('Depósito requerido');
  // compute prices from tranches snapshot
  const tranchesMap = read('tranches', {});
  const prods = read('products', []);
  const lines = items.map(it => {
    const p = prods.find(x => x.id === it.productId);
    const tr = tranchesMap[it.productId] || [];
    const unit = unitPriceForQty(tr, it.qty);
    return { productId: it.productId, sku: p?.sku, name: p?.name, qty: it.qty, unitPrice: unit, subtotal: unit*it.qty, productVersion: p?.version||1 };
  });
  // stock atomic validate
  const stock = read('stock', []);
  for (const l of lines) {
    const rec = stock.find(r => r.productId === l.productId && r.depositId === depositId);
    const avail = rec ? rec.qty : 0;
    if (avail < l.qty) throw new Error(`Sin stock para ${l.sku}`);
  }
  // deduct
  for (const l of lines) {
    const rec = stock.find(r => r.productId === l.productId && r.depositId === depositId);
    if (rec) rec.qty -= l.qty; else stock.push({ productId: l.productId, depositId, qty: -l.qty });
  }
  write('stock', stock);
  const order = { id: 'V-'+Date.now(), createdAt: Date.now(), confirmedAt: Date.now(), depositId, items: lines, total: lines.reduce((a,b)=>a+b.subtotal,0) };
  const orders = read('orders', []); orders.push(order); write('orders', orders);
  const movs = read('movements', []); movs.push({ id:'M-'+Date.now(), type:'VENTA', at: Date.now(), depositId, items }); write('movements', movs);
  return order;
}
export function listOrders(params={}) { return read('orders', []); }
export function listMovements({ from=null, to=null }={}) { return read('movements', []); }

export function transferStock({ originId, destId, items }) {
  const stock = read('stock', []);
  // validate
  for (const it of items) {
    const rec = stock.find(r => r.productId === it.productId && r.depositId === originId);
    if ((rec?.qty||0) < it.qty) throw new Error('Sin stock en origen');
  }
  // move
  for (const it of items) {
    const o = stock.find(r => r.productId === it.productId && r.depositId === originId); o.qty -= it.qty;
    const d = stock.find(r => r.productId === it.productId && r.depositId === destId); if (d) d.qty += it.qty; else stock.push({ productId: it.productId, depositId: destId, qty: it.qty });
  }
  write('stock', stock);
  const movs = read('movements', []);
  movs.push({ id:'M-'+Date.now(), type:'TRANSFER_SAL', at: Date.now(), depositId: originId, items });
  movs.push({ id:'M-'+(Date.now()+1), type:'TRANSFER_ENT', at: Date.now(), depositId: destId, items });
  write('movements', movs);
  return { ok:true };
}

function cryptoRandomId(){ try { return (crypto.getRandomValues(new Uint32Array(1))[0]).toString(16)+Date.now().toString(16);} catch{ return Math.random().toString(16).slice(2)+Date.now().toString(16);} }

