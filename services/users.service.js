export function getDB(){
  return JSON.parse(localStorage.getItem('SCANIX_DB'));
}

function saveDB(db){ localStorage.setItem('SCANIX_DB', JSON.stringify(db)); }

export function listUsers(){
  const db = getDB();
  return db.users || [];
}

export function listPending(){
  const db = getDB();
  return db.pendingUsers || [];
}

export function createUser({ role, name, username, password }){
  const db = getDB();
  if (db.users.some(u=>u.username===username) || (db.pendingUsers||[]).some(u=>u.username===username)) throw new Error('Usuario ya existe');
  db.users.push({ role, name, username, password });
  saveDB(db); return { role, name, username };
}

export function requestRegistration({ role, name, username, password }){
  const db = getDB();
  db.pendingUsers = db.pendingUsers || [];
  if (db.users.some(u=>u.username===username) || db.pendingUsers.some(u=>u.username===username)) throw new Error('Usuario ya existe');
  db.pendingUsers.push({ role, name, username, password });
  saveDB(db); return { role, name, username };
}

export function approveUser(username){
  const db = getDB();
  db.pendingUsers = db.pendingUsers || [];
  const idx = db.pendingUsers.findIndex(u=>u.username===username);
  if (idx===-1) throw new Error('No encontrado');
  const u = db.pendingUsers.splice(idx,1)[0];
  db.users.push(u);
  saveDB(db); return u;
}

export function rejectUser(username){
  const db = getDB();
  db.pendingUsers = db.pendingUsers || [];
  db.pendingUsers = db.pendingUsers.filter(u=>u.username!==username);
  saveDB(db);
}

