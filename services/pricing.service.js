export function applyPricing(product, qty) {
  const n = Number(qty) || 0;
  if (!product || !Array.isArray(product.priceRules) || n <= 0) {
    return { unitPrice: 0, rule: null };
  }
  const rules = product.priceRules.map(r => ({ ...r, max: r.max == null ? Infinity : Number(r.max) }))
    .filter(r => n >= r.min && n <= r.max)
    .sort((a,b) => b.min - a.min);
  const rule = rules[0] || null;
  const unitPrice = rule ? Number(rule.price) : 0;
  return { unitPrice, rule };
}

export function computeLine(product, qty) {
  const { unitPrice, rule } = applyPricing(product, qty);
  const subtotal = unitPrice * (Number(qty)||0);
  return { unitPrice, rule, subtotal };
}

