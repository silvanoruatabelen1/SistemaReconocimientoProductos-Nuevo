// Detección simulada (sku, name, qty, confidence)
export function detectFromImage(file){
  const delay = 500 + Math.random()*1000;
  return new Promise(res=>setTimeout(()=>{
    const samples = [
      { sku:'AOL-500', name:'Aceite de Oliva 500ml', qty: 1, confidence: 0.78 },
      { sku:'ARR-1000', name:'Arroz Integral 1kg', qty: 2, confidence: 0.66 },
      { sku:'PAS-500', name:'Pasta Italiana 500g', qty: 1, confidence: 0.59 },
    ];
    // Aleatorio 1-3 detecciones
    const count = Math.ceil(Math.random()*3);
    res(samples.slice(0,count));
  }, delay));
}

