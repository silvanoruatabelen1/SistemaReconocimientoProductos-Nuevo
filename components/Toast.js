let toastId = 0;
export function toast(message, variant='info'){
  let container = document.getElementById('toast-container');
  if (!container){
    container = document.createElement('div');
    container.id='toast-container';
    container.style.position='fixed';
    container.style.top='16px';
    container.style.right='16px';
    container.style.zIndex='2000';
    document.body.appendChild(container);
  }
  const id = `t-${++toastId}`;
  const el = document.createElement('div');
  el.id = id;
  el.className = 'surface rounded-xl shadow-md p-3 mb-2 transition';
  el.innerHTML = `<div><strong>${variant.toUpperCase()}</strong> - ${message}</div>`;
  container.appendChild(el);
  setTimeout(()=>{
    el.style.opacity='0';
    el.style.transform='translateX(10px)';
    setTimeout(()=>el.remove(),200);
  }, 2500);
}

