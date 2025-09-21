// API adapter (stubs). Uses fetch to call backend; returns mockish structures if unreachable.
import { API } from '../../config.js';
async function req(path, opts={}){
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), API.TIMEOUT_MS);
  try{
    const res = await fetch(API.BASE_URL + path, { ...opts, signal: ctrl.signal, headers: { 'Content-Type':'application/json', ...(opts.headers||{}) } });
    if (!res.ok) throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(e){
    return { ok:false, error:String(e.message||e), mock:true };
  }finally{ clearTimeout(t); }
}

export async function listProducts({ search='' }={}){ return (await req('/products?search='+encodeURIComponent(search)))?.data || []; }
export async function createProduct(payload){ return (await req('/products',{ method:'POST', body: JSON.stringify(payload)}))?.data || null; }
export async function updateProduct(id,payload){ return (await req(`/products/${id}`,{ method:'PUT', body: JSON.stringify(payload)}))?.data || null; }
export async function removeProduct(id){ await req(`/products/${id}`,{ method:'DELETE'}); return true; }

export async function listTranches(productId){ return (await req(`/products/${productId}/tranches`))?.data || []; }
export async function setTranches(productId,tranches){ return (await req(`/products/${productId}/tranches`,{ method:'PUT', body: JSON.stringify(tranches)}))?.data || []; }

export async function listDeposits(){ return (await req('/deposits'))?.data || []; }
export async function upsertDeposit(payload){ return (await req('/deposits',{ method:'POST', body: JSON.stringify(payload)}))?.data || null; }
export async function getStock(productId, depositId){ return (await req(`/stock?productId=${productId}&depositId=${depositId}`))?.qty || 0; }
export async function transferStock({ originId, destId, items }){ return (await req(`/transfers`,{ method:'POST', body: JSON.stringify({ originId, destId, items }) })) || { ok:true, mock:true }; }

export async function createOrder({ depositId, items }){ return (await req('/orders',{ method:'POST', body: JSON.stringify({ depositId, items }) }))?.data || { id:'V-'+Date.now(), total:0, items, mock:true }; }
export async function listOrders(params={}){ return (await req('/orders'))?.data || []; }
export async function listMovements({ from=null,to=null }={}){ return (await req('/movements'))?.data || []; }

