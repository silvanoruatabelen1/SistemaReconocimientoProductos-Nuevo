// Inicializa localStorage con datos de ejemplo si vacío
const BASE = {
  users: [
    { username:'admin', password:'admin', role:'Admin', name:'Admin' },
    { username:'vendedor', password:'vendedor', role:'Vendedor', name:'Vendedor 1' },
    { username:'operario', password:'operario', role:'Operario', name:'Operario 1' },
  ],
  products: [
    { id:'1', sku:'AOL-500', name:'Aceite de Oliva Extra Virgen 500ml', price:8.5, priceRules:[{min:1,max:5,price:8.5},{min:6,max:11,price:8.1},{min:12,price:7.8}], deleted:false },
    { id:'2', sku:'ARR-1000', name:'Arroz Integral 1kg', price:3.2, priceRules:[{min:1,max:10,price:3.2},{min:11,max:49,price:3.0},{min:50,price:2.8}], deleted:false },
    { id:'3', sku:'PAS-500', name:'Pasta Italiana 500g', price:2.9, priceRules:[{min:1,max:11,price:2.9},{min:12,price:2.7}], deleted:false },
  ],
  stock: [
    { sku:'AOL-500', depot:'Depósito Central', qty:45 },
    { sku:'ARR-1000', depot:'Depósito Central', qty:8 },
    { sku:'PAS-500', depot:'Depósito Norte', qty:67 },
  ],
  orders: []
};

export function initSeed(){
  if (!localStorage.getItem('SCANIX_DB')){
    localStorage.setItem('SCANIX_DB', JSON.stringify(BASE));
  }
  // mock por defecto
  if (localStorage.getItem('SCANIX_USE_MOCK')===null){
    localStorage.setItem('SCANIX_USE_MOCK','true');
  }
}

