import { listUsers, listPending, createUser, approveUser, rejectUser } from '../services/users.service.js';
import { notify } from '../services/notify.service.js';

export default function Users(){
  const el = document.createElement('div');
  el.className = 'container py-3 vstack gap-3';
  el.innerHTML = `
    <h2>Usuarios</h2>
    <div class="surface rounded-xl p-3">
      <h6>Crear usuario</h6>
      <div class="row g-2 align-items-end">
        <div class="col-md-2"><label class="form-label">Rol</label>
          <select class="form-select" id="role">
            <option>Admin</option>
            <option>Vendedor</option>
            <option>Operario</option>
          </select>
        </div>
        <div class="col-md-3"><label class="form-label">Nombre</label><input class="form-control" id="name"></div>
        <div class="col-md-3"><label class="form-label">Usuario</label><input class="form-control" id="username"></div>
        <div class="col-md-3"><label class="form-label">Contraseña</label><input type="password" class="form-control" id="password"></div>
        <div class="col-md-1"><button class="btn btn-primary w-100" id="btnCreate">Crear</button></div>
      </div>
    </div>
    <div class="surface rounded-xl p-3">
      <h6 class="mb-2">Registros pendientes</h6>
      <div id="pending"></div>
    </div>
    <div class="table-responsive surface rounded-xl p-2">
      <table class="table table-scanix">
        <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th></tr></thead>
        <tbody id="users"></tbody>
      </table>
    </div>`;

  function renderUsers(){
    const tbody = el.querySelector('#users');
    const users = listUsers();
    tbody.innerHTML = users.map(u=>`<tr><td>${u.username}</td><td>${u.name}</td><td><span class='badge-scanix'>${u.role}</span></td></tr>`).join('');
  }

  function renderPending(){
    const box = el.querySelector('#pending');
    const items = listPending();
    if (!items || !items.length) { box.innerHTML = '<div class="muted small">Sin pendientes</div>'; return; }
    box.innerHTML = items.map(u=>`<div class='hstack gap-2 mb-1'><div><strong>${u.username}</strong> <span class='badge-scanix'>${u.role}</span> <span class='muted'>${u.name}</span></div><div class='ms-auto'><button class='btn btn-sm btn-success' data-approve='${u.username}'>Aprobar</button> <button class='btn btn-sm btn-outline-danger' data-reject='${u.username}'>Rechazar</button></div></div>`).join('');
    box.querySelectorAll('[data-approve]').forEach(b=>b.addEventListener('click', ()=>{ try{ approveUser(b.getAttribute('data-approve')); notify.success('Aprobado'); render(); }catch(e){ notify.error(e.message);} }));
    box.querySelectorAll('[data-reject]').forEach(b=>b.addEventListener('click', ()=>{ try{ rejectUser(b.getAttribute('data-reject')); notify.info('Rechazado'); render(); }catch(e){ notify.error(e.message);} }));
  }

  el.querySelector('#btnCreate').addEventListener('click', ()=>{
    const role = el.querySelector('#role').value;
    const name = el.querySelector('#name').value.trim();
    const username = el.querySelector('#username').value.trim();
    const password = el.querySelector('#password').value;
    if (!name || !username || !password) return notify.warn('Complete los campos');
    try { createUser({ role, name, username, password }); notify.success('Usuario creado'); render(); }
    catch(e){ notify.error(e.message); }
  });

  function render(){ renderUsers(); renderPending(); }
  render();
  return el;
}

