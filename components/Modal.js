export function confirmDialog({ title = 'Confirmar', body = '', okText = 'Confirmar', cancelText = 'Cancelar' } = {}) {
  return new Promise((resolve) => {
    const id = 'm' + Date.now();
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="modal fade" id="${id}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">${body}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">${cancelText}</button>
              <button type="button" class="btn btn-primary" data-role="ok">${okText}</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap.firstElementChild);
    const modalEl = document.getElementById(id);
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalEl.querySelector('[data-role="ok"]').addEventListener('click', () => {
      resolve(true);
      modal.hide();
    });
    modalEl.addEventListener('hidden.bs.modal', () => {
      resolve(false);
      modalEl.remove();
    });
    modal.show();
  });
}

