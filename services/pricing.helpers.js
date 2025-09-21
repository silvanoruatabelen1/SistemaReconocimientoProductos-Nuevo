export function unitPriceForQty(tranches, qty) {
  let candidate = null;
  for (const t of [...tranches].sort((a,b)=>a.desde_cant-b.desde_cant)) {
    if (qty >= Number(t.desde_cant)) candidate = t;
  }
  return candidate ? Number(candidate.precio_unit) : 0;
}

export function validateTranches(tranches) {
  const ts = [...tranches].sort((a,b)=>a.desde_cant-b.desde_cant);
  for (let i=1;i<ts.length;i++) {
    if (Number(ts[i].desde_cant) <= Number(ts[i-1].desde_cant)) {
      return { ok:false, reason:'Tramos solapados o desordenados' };
    }
  }
  return { ok:true };
}

