// Hash Router simple con soporte a rutas con parámetros (#/ticket/:id)

export class Router {
  constructor({ mountId, routes, defaultRoute = '#/scan', onRouteChange }) {
    this.mount = document.getElementById(mountId) || this._createMount(mountId);
    this.routes = routes;
    this.defaultRoute = defaultRoute;
    this.onRouteChange = onRouteChange;
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();
  }

  _createMount(id) {
    const el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
    return el;
  }

  parse(hash) {
    // Soporta #/ticket/:id
    const routeKeys = Object.keys(this.routes).sort((a,b)=>b.length-a.length);
    for (const key of routeKeys) {
      if (!key.includes(':')) continue;
      const pattern = new RegExp('^' + key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(':id','([^/]+)') + '$');
      const m = hash.match(pattern);
      if (m) return { key, params: { id: decodeURIComponent(m[1]) } };
    }
    return { key: hash, params: {} };
  }

  async handleHashChange() {
    let hash = location.hash || this.defaultRoute;
    const { key, params } = this.parse(hash);
    const loader = this.routes[key] || this.routes[this.defaultRoute];
    if (!loader) return;
    const page = await loader();
    this.mount.innerHTML = '';
    const el = await page(params);
    if (el instanceof HTMLElement) this.mount.appendChild(el);
    else if (typeof el === 'string') this.mount.innerHTML = el;
    this.onRouteChange && this.onRouteChange(hash);
  }
}

