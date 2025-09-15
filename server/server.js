// Simple backend using Node's built-in http module (no dependencies)
// Endpoints:
// - GET  /api/inventory              -> list inventory items
// - POST /api/inventory/adjust       -> { id, delta } adjust stock
// - GET  /health                     -> health check

import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join, normalize } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', 'data');
const STATIC_DIR = join(__dirname, '..', 'vanilla');
const INVENTORY_FILE = join(DATA_DIR, 'inventory.json');

function ensureDataFiles() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(INVENTORY_FILE)) {
    const seed = [
      {
        id: '1',
        name: 'Aceite de Oliva Extra Virgen 500ml',
        sku: 'AOL-500',
        category: 'Aceites',
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        price: 8.5,
        lastMovement: '2024-01-15',
        movementType: 'salida',
        warehouse: 'Depósito Central'
      },
      {
        id: '2',
        name: 'Arroz Integral 1kg',
        sku: 'ARR-1000',
        category: 'Granos',
        currentStock: 8,
        minStock: 15,
        maxStock: 80,
        price: 3.2,
        lastMovement: '2024-01-14',
        movementType: 'salida',
        warehouse: 'Depósito Central'
      },
      {
        id: '3',
        name: 'Pasta Italiana 500g',
        sku: 'PAS-500',
        category: 'Pastas',
        currentStock: 67,
        minStock: 25,
        maxStock: 120,
        price: 2.9,
        lastMovement: '2024-01-13',
        movementType: 'entrada',
        warehouse: 'Depósito Norte'
      },
      {
        id: '4',
        name: 'Conserva de Tomate 400g',
        sku: 'CON-400',
        category: 'Conservas',
        currentStock: 2,
        minStock: 10,
        maxStock: 60,
        price: 1.8,
        lastMovement: '2024-01-12',
        movementType: 'salida',
        warehouse: 'Depósito Central'
      }
    ];
    writeFileSync(INVENTORY_FILE, JSON.stringify(seed, null, 2), 'utf8');
  }
}

function readJSON(path) {
  try {
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

function send(res, status, data, headers = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': typeof data === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

ensureDataFiles();

function contentTypeFor(pathname) {
  if (pathname.endsWith('.html')) return 'text/html; charset=utf-8';
  if (pathname.endsWith('.css')) return 'text/css; charset=utf-8';
  if (pathname.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

function tryServeStatic(url, res) {
  const pathname = (url || '/').split('?')[0] || '/';
  const relative = pathname === '/' ? '/index.html' : pathname;
  const target = normalize(join(STATIC_DIR, relative));
  // Prevent path traversal
  if (!target.startsWith(STATIC_DIR)) {
    return false;
  }
  if (existsSync(target)) {
    const data = readFileSync(target);
    res.writeHead(200, {
      'Content-Type': contentTypeFor(target),
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
    return true;
  }
  return false;
}

const server = createServer(async (req, res) => {
  const { method, url } = req;

  if (method === 'OPTIONS') {
    return send(res, 204, '');
  }

  if (url === '/health' && method === 'GET') {
    return send(res, 200, { ok: true });
  }

  if (url === '/api/inventory' && method === 'GET') {
    const items = readJSON(INVENTORY_FILE) || [];
    return send(res, 200, items);
  }

  if (url === '/api/inventory/adjust' && method === 'POST') {
    const body = await parseBody(req);
    const { id, delta } = body || {};
    if (!id || typeof delta !== 'number') {
      return send(res, 400, { error: 'id y delta son requeridos' });
    }
    const items = readJSON(INVENTORY_FILE) || [];
    const idx = items.findIndex((i) => i.id === String(id));
    if (idx === -1) {
      return send(res, 404, { error: 'Producto no encontrado' });
    }
    const updated = { ...items[idx] };
    updated.currentStock = Math.max(0, (updated.currentStock || 0) + delta);
    updated.lastMovement = new Date().toISOString().slice(0, 10);
    updated.movementType = delta >= 0 ? 'entrada' : 'salida';
    items[idx] = updated;
    writeJSON(INVENTORY_FILE, items);
    return send(res, 200, updated);
  }

  // Static files fallback (vanilla UI)
  if (method === 'GET') {
    const served = tryServeStatic(url, res);
    if (served) return;
  }

  // Not found
  send(res, 404, { error: 'Not Found' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
