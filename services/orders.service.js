import { priceForQty } from './pricing.service.js';

const CART_KEY = 'SCANIX_CART';

export function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || { lines: [], depot: 'Depósito Central', seller:'Vendedor 1' }; } catch { return { lines: [] }; }
}

export function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

export function addLine(prod, qty=1){
  const cart = getCart();
  const idx = cart.lines.findIndex(l => l.sku === prod.sku);
  if (idx>-1) cart.lines[idx].qty += qty;
  else cart.lines.push({ sku: prod.sku, name: prod.name, qty, basePrice: prod.price, rules: prod.priceRules||[] });
  saveCart(cart); return cart;
}

export function updateQty(sku, qty){
  const cart = getCart();
  const line = cart.lines.find(l => l.sku===sku); if (!line) return cart;
  line.qty = Math.max(0, qty);
  if (line.qty===0) cart.lines = cart.lines.filter(l => l.sku!==sku);
  saveCart(cart); return cart;
}

export function totals(cart){
  let subtotal = 0; const detailed = cart.lines.map(l => {
    const { unit, rule } = priceForQty(l.basePrice, l.qty, l.rules);
    const lineTotal = unit * l.qty; subtotal += lineTotal;
    return { ...l, unit, rule, lineTotal };
  });
  return { lines: detailed, subtotal, total: subtotal };
}

export function confirmOrder(){
  const cart = getCart();
  const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
  // Descontar stock (válida disponibilidad simple)
  for (const line of cart.lines){
    const p = db.stock.find(s => s.sku===line.sku && s.depot===cart.depot);
    if (!p || p.qty < line.qty) throw new Error(`Stock insuficiente para ${line.sku}`);
  }
  for (const line of cart.lines){
    const p = db.stock.find(s => s.sku===line.sku && s.depot===cart.depot);
    p.qty -= line.qty;
  }
  // Crear ticket
  const ticketId = String(Date.now());
  const sum = totals(cart);
  const ticket = { id: ticketId, createdAt: new Date().toISOString(), depot: cart.depot, seller: cart.seller, lines: sum.lines, total: sum.total };
  db.orders.push(ticket);
  localStorage.setItem('SCANIX_DB', JSON.stringify(db));
  localStorage.removeItem(CART_KEY);
  return ticketId;
}

