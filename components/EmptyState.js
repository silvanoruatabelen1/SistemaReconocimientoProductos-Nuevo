export function EmptyState({ icon='⌀', title='Sin datos', message='' }={}){
  const el = document.createElement('div');
  el.className = 'empty-state';
  el.innerHTML = `<div class="icon">${icon}</div><div><strong>${title}</strong></div>${message?`<div class='muted small'>${message}</div>`:''}`;
  return el;
}

