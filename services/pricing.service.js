// Motor de precios por cantidad (rangos) simple
// priceRules: [{ min:1, max:9, price }, { min:10, max:49, price }, { min:50, price }]

export function priceForQty(basePrice, qty, rules=[]) {
  if (!rules || !rules.length) return { unit: basePrice, rule: null };
  const match = rules.find(r => qty >= (r.min||1) && (r.max ? qty <= r.max : true));
  if (match) return { unit: match.price, rule: match };
  return { unit: basePrice, rule: null };
}

