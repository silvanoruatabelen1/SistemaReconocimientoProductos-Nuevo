import { list as listProducts, create as createProduct } from '../services/products.service.js';
import { __seedDepotsAndStock } from '../services/stock.service.js';

(function seed() {
  // Seed depots and stock
  const depots = [
    { id: 'D1', name: 'Depósito Central' },
    { id: 'D2', name: 'Sucursal Norte' }
  ];

  const existing = listProducts({ includeDeleted: true });
  if (!existing.length) {
    const p1 = createProduct({ sku: 'SKU-001', name: 'Café 250g', image: '', tags: ['cafe','alimentos'], priceRules: [
      { min: 1, max: 4, price: 1200 },
      { min: 5, max: 9, price: 1100 },
      { min: 10, max: null, price: 1000 }
    ]});
    const p2 = createProduct({ sku: 'SKU-002', name: 'Té Verde 20u', image: '', tags: ['te','infusiones'], priceRules: [
      { min: 1, max: 9, price: 800 },
      { min: 10, max: null, price: 700 }
    ]});
    const p3 = createProduct({ sku: 'SKU-003', name: 'Azúcar 1kg', image: '', tags: ['azucar','alimentos'], priceRules: [
      { min: 1, max: null, price: 900 }
    ]});

    const stock = [
      { productId: p1.id, depotId: 'D1', qty: 100 },
      { productId: p1.id, depotId: 'D2', qty: 40 },
      { productId: p2.id, depotId: 'D1', qty: 200 },
      { productId: p2.id, depotId: 'D2', qty: 80 },
      { productId: p3.id, depotId: 'D1', qty: 150 },
      { productId: p3.id, depotId: 'D2', qty: 60 }
    ];
    __seedDepotsAndStock({ depots, stock });
  } else {
    // Ensure depots exist even if products already there
    __seedDepotsAndStock({ depots });
  }
})();

