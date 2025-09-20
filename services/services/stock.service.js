const LS_DEPOTS = 'depots';
const LS_STOCK = 'stock'; // [{ productId, depotId, qty }]

function loadDepots() { return JSON.parse(localStorage.getItem(LS_DEPOTS) || '[]'); }
function saveDepots(x) { localStorage.setItem(LS_DEPOTS, JSON.stringify(x)); }
function loadStock() { return JSON.parse(localStorage.getItem(LS_STOCK) || '[]'); }
function saveStock(x) { localStorage.setItem(LS_STOCK, JSON.stringify(x)); }

export function listDepots() { return loadDepots(); }

export function getQty(productId, depotId) {
  const s = loadStock();
  return (s.find(r => r.productId === productId && r.depotId === depotId)?.qty) || 0;
}

export function setQty(productId, depotId, qty) {
  const s = loadStock();
  const idx = s.findIndex(r => r.productId === productId && r.depotId === depotId);
  if (idx === -1) s.push({ productId, depotId, qty: Number(qty)||0 });
  else s[idx].qty = Number(qty)||0;
  saveStock(s);
}

// Atomic discount for confirmation: all-or-nothing
export function adjustStockAtomic(lines, depotId) {
  const stock = loadStock();
  // Validate availability
  for (const ln of lines) {
    const rec = stock.find(r => r.productId === ln.productId && r.depotId === depotId);
    const available = rec ? rec.qty : 0;
    if (available < ln.qty) {
      return { ok: false, error: `Sin stock suficiente para SKU ${ln.sku} (${available} < ${ln.qty})` };
    }
  }
  // Apply deductions
  for (const ln of lines) {
    const rec = stock.find(r => r.productId === ln.productId && r.depotId === depotId);
    if (rec) rec.qty -= ln.qty; else stock.push({ productId: ln.productId, depotId, qty: 0 - ln.qty });
  }
  saveStock(stock);
  return { ok: true };
}

export function transferLines(lines, fromDepotId, toDepotId, operator = null) {
  if (fromDepotId === toDepotId) return { ok: false, error: 'Depósitos iguales' };
  const stock = loadStock();
  // Validate
  for (const ln of lines) {
    const rec = stock.find(r => r.productId === ln.productId && r.depotId === fromDepotId);
    const available = rec ? rec.qty : 0;
    if (available < ln.qty) return { ok: false, error: `Sin stock en origen para SKU ${ln.sku}` };
  }
  // Move
  for (const ln of lines) {
    const from = stock.find(r => r.productId === ln.productId && r.depotId === fromDepotId);
    from.qty -= ln.qty;
    const to = stock.find(r => r.productId === ln.productId && r.depotId === toDepotId);
    if (to) to.qty += ln.qty; else stock.push({ productId: ln.productId, depotId: toDepotId, qty: ln.qty });
  }
  saveStock(stock);
  const remito = {
    id: 'TR-' + Date.now(),
    at: Date.now(),
    fromDepotId,
    toDepotId,
    operator: (operator || '').trim() || null,
    lines
  };
  return { ok: true, remito };
}

// Utilities for seed
export function __seedDepotsAndStock({ depots, stock }) {
  if (depots) saveDepots(depots);
  if (stock) saveStock(stock);
}
