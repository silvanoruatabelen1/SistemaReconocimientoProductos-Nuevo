export default function Reports(){
  const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
  const el = document.createElement('div');
  el.className = 'container py-3 vstack';
  el.innerHTML = `
    <h2>Reportes</h2>
    <div class="surface p-3 rounded-xl">
      <canvas id="chart" height="120"></canvas>
    </div>`;
  setTimeout(()=>{
    const ctx = el.querySelector('#chart');
    const byDay = {};
    for (const o of db.orders){
      const d = o.createdAt.slice(0,10); byDay[d]=(byDay[d]||0)+o.total;
    }
    const labels = Object.keys(byDay).sort();
    const data = labels.map(k=>byDay[k]);
    // eslint-disable-next-line no-undef
    new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'Ventas', data, borderColor:'#6ea8fe'}] }, options:{ plugins:{legend:{display:false}} } });
  },50);
  return el;
}

