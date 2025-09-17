import { getById as getProductById } from './products.service.js';
import { computeLine } from './pricing.service.js';
import { adjustStockAtomic } from './stock.service.js';

const SS_DRAFT = 'orderDraft';
const LS_ORDERS = 'orders';

function loadDraft() { return JSON.parse(sessionStorage.getItem(SS_DRAFT) || 'null'); }
function saveDraft(d) { sessionStorage.setItem(SS_DRAFT, JSON.stringify(d)); }
function clearDraft() { sessionStorage.removeItem(SS_DRAFT); }

function loadOrders() { return JSON.parse(localStorage.getItem(LS_ORDERS) || '[]'); }
function saveOrders(list) { localStorage.setItem(LS_ORDERS, JSON.stringify(list)); }

export function startDraftFromDetections(grouped) {
  const lines = grouped.map(g => ({ productId: g.productId, sku: g.sku, name: g.name, qty: g.qty }));
  const draft = { id: 'DRAFT', createdAt: Date.now(), lines };
  saveDraft(draft);
  return draft;
}

export function getDraft() { return loadDraft(); }
export function ensureDraft() { return loadDraft() || saveDraft({ id: 'DRAFT', createdAt: Date.now(), lines: [] }) || loadDraft(); }

export function setDepotToDraft(depotId) {
  const d = ensureDraft();
  d.depotId = depotId;
  saveDraft(d);
  return d;
}

export function setOperatorToDraft(operator) {
  const d = ensureDraft();
  d.operator = (operator || '').trim();
  saveDraft(d);
  return d;
}

export function addLine(productId, qty=1) {
  const d = ensureDraft();
  const p = getProductById(productId);
  if (!p || p.deleted) throw new Error('Producto inválido');
  const i = d.lines.findIndex(l => l.productId === productId);
  if (i === -1) d.lines.push({ productId, sku: p.sku, name: p.name, qty: Number(qty)||1 });
  else d.lines[i].qty += Number(qty)||1;
  saveDraft(d);
  return d;
}

export function removeLine(productId) {
  const d = ensureDraft();
  d.lines = d.lines.filter(l => l.productId !== productId);
  saveDraft(d);
  return d;
}

export function setLineQty(productId, qty) {
  const d = ensureDraft();
  const i = d.lines.findIndex(l => l.productId === productId);
  if (i !== -1) d.lines[i].qty = Math.max(0, Number(qty)||0);
  saveDraft(d);
  return d;
}

export function computeTotals(draft = ensureDraft()) {
  let total = 0;
  const lines = draft.lines.map(l => {
    const p = getProductById(l.productId);
    const { unitPrice, rule, subtotal } = computeLine(p, l.qty);
    total += subtotal;
    return { ...l, unitPrice, subtotal, rule, version: p?.version || 1 };
  });
  return { lines, total };
}

export function confirmOrder(depotId) {
  const draft = ensureDraft();
  if (!depotId) throw new Error('Seleccione un depósito');
  const { lines, total } = computeTotals(draft);
  // validate lines qty > 0
  const finalLines = lines.filter(l => l.qty > 0);
  if (finalLines.length === 0) throw new Error('El pedido está vacío');
  // stock atomic
  const adj = adjustStockAtomic(finalLines, depotId);
  if (!adj.ok) return { ok: false, error: adj.error };
  // persist order
  const order = {
    id: 'V-' + Date.now(),
    at: Date.now(),
    depotId,
    operator: (draft.operator || '').trim() || null,
    lines: finalLines,
    total
  };
  const all = loadOrders();
  all.push(order);
  saveOrders(all);
  clearDraft();
  return { ok: true, order };
}

export function getOrderById(id) { return loadOrders().find(o => o.id === id); }
export function listOrders({ depotId = null } = {}) {
  let arr = loadOrders();
  if (depotId) arr = arr.filter(o => o.depotId === depotId);
  return arr.sort((a,b) => b.at - a.at);
}
