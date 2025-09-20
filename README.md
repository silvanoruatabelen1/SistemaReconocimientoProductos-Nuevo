# SCANIX – Sistema de Reconocimiento de Productos

Aplicación web que reconoce productos desde una imagen y permite generar pedidos con precios escalados, tickets PDF/print, control de stock por depósito, transferencias y reportes. Funciona en modo file:// (doble click a index.html).

## HUs implementadas (22)
1) Captura de foto desde cámara y subida de imagen.
2) Reconocimiento simulado (mock) y agrupación por SKU/cantidades.
3) Validación de baja confianza (marcado “Revisar”).
4) Edición manual del pedido (ajustar cantidades, agregar/eliminar por autocomplete).
5) Cálculo de precio por cantidad (escalas) por línea + regla visible.
6) Subtotales por producto y total general.
7) Generación de Ticket (PDF e imprimible) con Operador (opcional).
8) Selección de depósito de origen para la venta.
9) Confirmación de venta con descuento de stock atómico por depósito (valida stock suficiente).
10) Alerta de stock bajo en UI.
11) Transferencias O→D (destino no lista origen; si coinciden, se resetea) con remito PDF/print y Operador (opcional).
12) Historial de ventas + reimpresión/descarga de tickets; botón Volver en Ticket.
13) Reportes básicos: ventas por día con selector de depósito y estado “sin datos”.
14) Versión de producto: versionado mínimo en Catálogo; versión usada (vN) queda en cada línea del ticket.

## Stack
- HTML + CSS + JavaScript (ES Modules)
- Bootstrap 5 + Bootstrap Icons + Google Fonts (Inter)
- dayjs, jsPDF, Chart.js (CDN)
- Persistencia mock en localStorage (services/*)

## Estructura
- index.html, design/tokens.css, styles.css
- app.js, router.js
- components/: Navbar, Toast, Modal
- pages/: scan, orderEdit, ticket, catalog, orders, transfers, reports
- services/: api (stubs), products, pricing, orders, stock, reports, notify
- mocks/: seed (depósitos, productos y stock), vision.mock (detecciones)
- public/assets/logo.svg
  - Se usa en modo claro; en modo oscuro se usa `public/assets/logo-dark.svg` automáticamente.

## Impresión
- Ticket y Remito se imprimen solos: contenidos envueltos en `.print-area` y reglas `@media print` ocultan el resto de la UI.

## Autocomplete
- Dropdowns en contenedor posicionado con z-index alto para evitar mezclas con tablas/contenido.

## Cómo abrir
1. Clonar este repositorio.
2. Abrir `index.html` con doble click (modo `file://`).
3. Flujo: Scan → Pedido → Confirmar → Ticket.

## Preparado para backend (futuro)
- Editar `services/api.js` y configurar `BASE_URL`.
- Reemplazar lógicas de `services/*` por llamadas a `apiGet/apiPost/apiPut/apiDel` según corresponda.
## Impresión

- Solo se imprime el contenido de Ticket y Remito (contenedores con clase `print-area`). El resto de la interfaz se oculta durante la impresión.

## Autocomplete

- Los dropdowns de sugerencias se muestran por encima de la UI (z-index alto) y dentro de un contenedor posicionado para evitar mezclas visuales en Pedido y Transferencias.

## Catálogo – botón “+ Nuevo”

- Funcional: limpia y resetea el formulario a “Nuevo producto”.

## Transferencias – selector de Depósitos

- El combo de Destino filtra el depósito seleccionado en Origen. Si al cambiar Origen quedan iguales, se limpia Destino automáticamente.

## Reportes – filtro por Depósito

- El gráfico se filtra por depósito; si no hay datos se muestra “Sin ventas para este depósito/periodo”.
