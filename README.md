# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/237da71c-7115-4340-aaac-610b85b35107

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/237da71c-7115-4340-aaac-610b85b35107) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/237da71c-7115-4340-aaac-610b85b35107) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## SCANIX (HTML + CSS + JS ESM) - Frontend sin build

- Abrir con doble click `index.html` (modo mock, sin requests reales).
- Estilo premium: Bootstrap 5 + Icons (CDN), Inter (Google Fonts) + tokens en `design/tokens.css` y overrides en `styles.css`.
- Dark/Light: atributo `data-theme` persistido en `localStorage` con toggle en navbar.
- SPA hash router: `#/login`, `#/scan`, `#/order-edit`, `#/ticket/:id`, `#/catalog`, `#/orders`, `#/transfers`, `#/reports`, `#/admin/users`, `#/dataset`.
- Estado en localStorage con `mocks/seed.js` (inicializa si está vacío) y servicios en `services/*`.

### Estructura

- `public/assets/` (logo, placeholders)
- `design/tokens.css` (paleta, radios, sombras, utilidades)
- `styles.css` (overrides Bootstrap + componentes)
- `index.html` (CDNs + SPA)
- `app.js` (init, router, tema, seed)
- `router.js` (hash router)
- `auth.js` (estado auth local)
- `components/` (Navbar, Toast)
- `pages/` (login, scan, orderEdit, ticket, catalog, orders, transfers, reports, users, dataset)
- `services/` (api, auth.service, products.service, pricing.service, orders.service, notify.service)
- `mocks/` (seed y vision.mock)

### API (alineado a DRF)

En `services/api.js`:

```
export const BASE_URL = "http://localhost:8000"; // ajustar
let AUTH_TOKEN = localStorage.getItem("AUTH_TOKEN") || null;
export function setAuthToken(t) { ... }
const headers = () => AUTH_TOKEN ? { Authorization: `Token ${AUTH_TOKEN}` } : {};
export async function apiPost(path, body) { ... }
export async function apiGet(path)  { ... }
export async function apiPut(path, body) { ... }
export async function apiDel(path)  { ... }
```

Contratos previstos:
- Auth: `POST /login/` → `{ token }`
- Productos: CRUD `/api/producto/`, `GET /api/producto/?search=`
- Ventas: `POST /api/venta/`, `GET /api/venta/?from=&to=&depot=`, `GET /api/venta/:id`
- Reconocimiento: `POST /api/reconocimiento/` (imagen) → detecciones
- Stock/Transferencias: bajo `/api/`

Modo mock evita requests reales (luego para conectar API, pon `localStorage.SCANIX_USE_MOCK = 'false'`).

### Resetear datos

Borrar `localStorage.SCANIX_DB` y recargar.

### Pasar a API real

1. Ajustar `BASE_URL` en `services/api.js`.
2. Cambiar `localStorage.SCANIX_USE_MOCK = 'false'`.
3. Implementar endpoints en Django REST y respetar contratos.
4. `auth.service.js` ya usa `POST /login/` y token en header `Authorization: Token <token>`.


## Backend simple (sin dependencias)

Se agregó un backend mínimo en `server/server.js` usando solo Node `http` y archivos JSON para persistencia.

- Iniciar backend: `npm run start:server` (por defecto en `http://localhost:3001`)
- Endpoints:
  - `GET /api/inventory` → lista de productos
  - `POST /api/inventory/adjust` → cuerpo `{ id, delta }` para ajustar stock
  - `GET /health` → chequeo de salud

La data se guarda en `data/inventory.json` y se genera automáticamente si no existe.

## Plan de migración a HTML/CSS/JS

1. Mantener la estética exportando estilos desde `src/index.css` a CSS plano.
2. Crear páginas estáticas (HTML) para cada vista principal y usar `fetch` al backend.
3. Reemplazar componentes claves (filtros, tablas, modales) por utilidades ligeras sin framework.
4. Eliminar dependencias no esenciales y `vite` una vez completada la migración.

## Git y despliegue

Este repo ahora incluye `.gitignore`. Para publicar en GitHub:

1. `git init`
2. `git add . && git commit -m "chore: init with simple backend"`
3. Crear repo en GitHub y ejecutar:
   - `git branch -M main`
   - `git remote add origin <url_del_repo>`
   - `git push -u origin main`
