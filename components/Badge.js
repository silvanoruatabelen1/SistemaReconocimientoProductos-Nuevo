export function Badge(text, variant='default'){
  const span = document.createElement('span');
  span.className = 'badge-scanix';
  if (variant==='low') span.classList.add('badge-stock-low');
  if (variant==='high') span.classList.add('badge-stock-high');
  if (variant==='normal') span.classList.add('badge-stock-normal');
  span.textContent = text;
  return span;
}

