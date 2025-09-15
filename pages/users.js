export default function Users(){
  const db = JSON.parse(localStorage.getItem('SCANIX_DB'));
  const el = document.createElement('div');
  el.className = 'container py-3';
  el.innerHTML = `
    <h2>Usuarios</h2>
    <div class="table-responsive surface rounded-xl p-2">
      <table class="table table-scanix">
        <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th></tr></thead>
        <tbody>${db.users.map(u=>`<tr><td>${u.username}</td><td>${u.name}</td><td><span class='badge-scanix'>${u.role}</span></td></tr>`).join('')}</tbody>
      </table>
    </div>`;
  return el;
}

