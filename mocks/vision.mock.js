// Simula detecciones desde una imagen: [{ sku, name, qty, confidence }]
import { list as listProducts } from '../services/products.service.js';

export async function detectFromImage(_file) {
  const prods = listProducts({});
  // Genera 3-6 detecciones al azar para demo
  const n = Math.min(6, Math.max(3, Math.round(Math.random()*6)));
  const picks = shuffle(prods).slice(0, n);
  return picks.map(p => ({
    sku: p.sku,
    name: p.name,
    qty: Math.max(1, Math.round(Math.random()*5)),
    confidence: Math.random().toFixed(2) * 1
  }));
}

function shuffle(arr){
  return arr.map(a => [Math.random(), a]).sort((a,b) => a[0]-b[0]).map(a => a[1]);
}

