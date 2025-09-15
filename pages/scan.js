import { detectFromImage } from '../mocks/vision.mock.js';
import { addLine } from '../services/orders.service.js';
import { notify } from '../services/notify.service.js';

export default function ScanPage(){
  const el = document.createElement('div');
  el.className = 'container py-3 vstack';
  el.innerHTML = `
    <div class="hstack space-between">
      <div>
        <h2 class="mb-0">Scan</h2>
        <div class="muted small">Cámara o archivo (mock detección)</div>
      </div>
      <div>
        <a href="#/order-edit" class="btn btn-outline-light">
          <i class="bi bi-cart me-1"></i> Ver Orden
        </a>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-12 col-md-6">
        <div class="card-scanix p-3 rounded-xl vstack">
          <input class="form-control" type="file" accept="image/*" id="fileInput">
          <video id="cam" playsinline autoplay muted style="width:100%;max-height:320px;background:#000;border-radius:12px"></video>
          <div class="hstack">
            <button class="btn btn-primary" id="btnStart"><i class="bi bi-camera-video me-1"></i> Iniciar cámara</button>
            <button class="btn btn-outline-secondary" id="btnStop">Detener</button>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="card-scanix p-3 rounded-xl vstack" id="results">
          <div class="muted">Sin detecciones aún</div>
        </div>
      </div>
    </div>`;

  const video = el.querySelector('#cam');
  let stream = null;
  el.querySelector('#btnStart').addEventListener('click', async ()=>{
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio:false });
      video.srcObject = stream;
    } catch { notify.error('No se pudo acceder a la cámara'); }
  });
  el.querySelector('#btnStop').addEventListener('click', ()=>{ if (stream) stream.getTracks().forEach(t=>t.stop()); });

  el.querySelector('#fileInput').addEventListener('change', async (e)=>{
    const f = e.target.files[0]; if (!f) return;
    const res = await detectFromImage(f);
    renderDetections(res);
  });

  function renderDetections(items){
    const box = el.querySelector('#results');
    box.innerHTML = '';
    if (!items.length) { box.innerHTML = '<div class="muted">Sin coincidencias</div>'; return; }
    const bySku = {};
    for (const it of items){ bySku[it.sku] = bySku[it.sku] || { ...it }; bySku[it.sku].qty += (bySku[it.sku]!==it ? 0 : 0); }
    for (const it of items){
      const row = document.createElement('div');
      row.className = 'hstack space-between surface rounded-xl p-2';
      row.innerHTML = `
        <div>
          <div><strong>${it.name}</strong> <span class="badge-scanix ${it.confidence<0.6?'badge-stock-low':'badge-stock-normal'}">${Math.round(it.confidence*100)}%</span></div>
          <div class="small muted">SKU: ${it.sku}</div>
        </div>
        <div class="hstack">
          <span class="small muted">Cantidad</span>
          <input type="number" min="1" value="${it.qty}" class="form-control" style="width:90px"/>
          <button class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Agregar</button>
        </div>`;
      row.querySelector('button').addEventListener('click', ()=>{
        const qty = Math.max(1, Number(row.querySelector('input').value||1));
        addLine({ sku: it.sku, name: it.name, price: 1, priceRules:[] }, qty);
        notify.success('Agregado a la orden');
      });
      box.appendChild(row);
    }
  }

  return el;
}

