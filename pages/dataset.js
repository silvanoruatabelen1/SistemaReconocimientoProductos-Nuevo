export default function Dataset(){
  const el = document.createElement('div');
  el.className = 'container py-3 vstack';
  el.innerHTML = `
    <h2>Dataset / Etiquetado</h2>
    <div class="surface p-3 rounded-xl vstack">
      <input type="file" accept="image/*" class="form-control" />
      <input type="text" class="form-control" placeholder="Tags (coma)" />
      <button class="btn btn-primary">Guardar (mock)</button>
    </div>`;
  return el;
}

