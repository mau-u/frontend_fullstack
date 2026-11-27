
# Pastelería Mil Sabores | Frontend

Interfaz de tienda en línea desarrollada con React 19, JavaScript, Vite 7 y Bootstrap 5. El frontend consume la API REST del repositorio `mil-sabores-backend`.

## Requisitos

- Node.js 22 o superior (recomendado).
- npm 10 o superior.
- Backend levantado en `http://localhost:8082` para cargar datos y autenticar usuarios.
- Google Chrome para ejecutar las pruebas Jasmine/Karma.

## Instalación y ejecución

```bash
npm ci
cp .env.example .env
npm run dev
```

En Windows PowerShell, copia la configuración con `Copy-Item .env.example .env`. Abre la dirección local que indique Vite (normalmente `http://localhost:5173`). La configuración proxy predeterminada reenvía `/api` al backend `http://localhost:8081`. Puedes cambiar ese destino con `VITE_API_PROXY_TARGET`.

## Construcción y pruebas

```bash
npm run build
npm test
npm run test:coverage
```

Karma ejecuta Jasmine en Chrome Headless. La carpeta `coverage/` se genera al ejecutar `npm run test:coverage`; no se incluye un porcentaje de cobertura predeclarado. Debes adjuntar el reporte real generado por tu equipo.

## Vistas y roles

- Visitante/cliente: navegación de tienda, catálogo, detalle y flujo de carrito/checkout. El cliente autenticado puede consultar sus compras.
- Vendedor: solo Inicio, Productos y Panel vendedor. Puede consultar productos, detalle, órdenes y detalle de órdenes; no puede comprar ni ingresar al carrito/checkout.
- Administrador: panel para gestionar productos, categorías, órdenes y usuarios.

La interfaz restringe la navegación según el rol, pero la autorización definitiva se aplica también en el backend.

## Comunicación con el backend

`src/services/api.js` centraliza las solicitudes `fetch` y usa `credentials: 'include'` para enviar la cookie de sesión HttpOnly. La aplicación usa rutas hash (por ejemplo `#/productos` y `#/vendedor`). El valor por defecto de `VITE_API_URL` es `/api/v1`.

Para un despliegue independiente, configura `VITE_API_URL` con la URL pública del backend y habilita esa dirección en `FRONTEND_URL` del backend. El `Dockerfile` y `nginx.conf` se incluyen como referencia del despliegue integrado; el proxy Nginx supone que el servicio backend es resoluble como `backend` en la misma red Docker.

## Cuentas locales de demostración

- Administrador: `admin.ep3@duoc.cl` / `Admin123!`
- Vendedor: `vendedor.ep3@duoc.cl` / `Vendedor123!`
- Cliente: se registra desde la propia aplicación.

Estas credenciales son solo para demostración local; cámbialas antes de cualquier despliegue compartido.
=======
# frontend_fullstack
>>>>>>> origin/main
