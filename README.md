# SCANIX – Sistema de Reconocimiento de Productos

Aplicación web que permite reconocer productos a partir de una foto y generar pedidos con precios escalados, tickets y control de stock por depósito.

## Funcionalidades (HUs nuevas implementadas)
- HU01: Catálogo de productos con SKU, imagen, tags, priceRules, soft-delete y versionado mínimo.
- HU02: Escaneo simulado de productos por foto.
- HU03: Edición del pedido (ajustar cantidades, agregar/quitar productos con autocomplete).
- HU04: Motor de precios por cantidad y cálculo de totales.
- HU05: Confirmación de venta y generación de ticket (vista imprimible + PDF).
- HU06: Descuento de stock por depósito (atómico).
- HU07: Transferencias entre depósitos con remito (vista imprimible + PDF).
- HU08: Historial de ventas y reimpresión de tickets.
- Campo **Operador (opcional)** en ventas y transferencias para trazabilidad mínima.

## Tecnologías
- HTML + CSS + JavaScript (ES Modules)
- Bootstrap 5 + Bootstrap Icons
- dayjs, jsPDF, Chart.js (CDN)
- Almacenamiento en localStorage (mock)

## Cómo usar
1. Clonar este repositorio.
2. Abrir `index.html` con doble click (funciona en modo `file://`).
3. Probar el flujo: **Scan → Pedido → Confirmar → Ticket**.
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
