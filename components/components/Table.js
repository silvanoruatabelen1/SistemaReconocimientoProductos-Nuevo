export function Table({ head=[], rows=[] }={}){
  const el = document.createElement('div');
  el.className = 'table-responsive surface rounded-xl p-2';
  const thead = `<thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
  el.innerHTML = `<table class="table table-scanix">${thead}${tbody}</table>`;
  return el;
}

