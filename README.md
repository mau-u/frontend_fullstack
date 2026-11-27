# Pastelería Mil Sabores
## Frontend — Plataforma de comercio electrónico

Aplicación web de comercio electrónico desarrollada para **Pastelería Mil Sabores**, orientada a la venta y administración de productos de pastelería mediante una plataforma digital.

El proyecto implementa una interfaz moderna e interactiva que permite a los usuarios explorar productos, gestionar sus compras y realizar pedidos. También incorpora funcionalidades administrativas y herramientas de gestión diferenciadas según el rol del usuario.

El frontend consume una API REST desarrollada con Java y Spring Boot, manteniendo una arquitectura desacoplada entre la interfaz de usuario y la lógica del negocio.

---

## 1. Tecnologías utilizadas

| Tecnología | Descripción |
|---|---|
| React 19 | Desarrollo de interfaces de usuario mediante componentes |
| JavaScript | Lenguaje de programación principal |
| Vite 7 | Herramienta de desarrollo y construcción |
| Bootstrap 5 | Diseño responsivo y componentes visuales |
| Fetch API | Comunicación con los servicios REST |
| Jasmine | Framework para pruebas unitarias |
| Karma | Ejecución de pruebas automatizadas |

---

## 2. Requisitos previos

Para instalar y ejecutar correctamente el proyecto se requiere:

- Node.js 22 o superior (recomendado).
- npm 10 o superior.
- Google Chrome para ejecutar las pruebas automatizadas.
- Backend de Pastelería Mil Sabores en funcionamiento.

**Dirección local del backend:**

```text
http://localhost:8082
```

---

## 3. Instalación y ejecución

### 3.1. Clonar el repositorio

```bash
git clone https://github.com/mau-u/frontend_fullstack.git
```

### 3.2. Ingresar al directorio del proyecto

```bash
cd frontend_fullstack
```

### 3.3. Instalar las dependencias

```bash
npm ci
```

Este comando instala las dependencias definidas en `package-lock.json`.

### 3.4. Configurar las variables de entorno

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

En Git Bash o Linux:

```bash
cp .env.example .env
```

### 3.5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Una vez iniciado, Vite mostrará la dirección local de la aplicación. Normalmente corresponde a:

```text
http://localhost:5173
```

Abre esta dirección en el navegador para acceder a la plataforma.

---

## 4. Configuración del entorno

El proyecto utiliza variables de entorno para configurar la comunicación con el backend.

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | Ruta base de la API REST. Su valor predeterminado es `/api/v1`. |
| `VITE_API_PROXY_TARGET` | Dirección del servidor backend al que Vite redirige las solicitudes `/api`. |

### Configuración de conexión con el backend

La configuración predeterminada del proxy de Vite utiliza:

```text
http://localhost:8081
```

Si el backend se encuentra ejecutándose en el puerto `8082`, configura el archivo `.env` de la siguiente manera:

```env
VITE_API_URL=/api/v1
VITE_API_PROXY_TARGET=http://localhost:8082
```

Después de modificar las variables de entorno, es necesario reiniciar el servidor de desarrollo.

**Importante:** el archivo `.env` contiene configuración local y no debe publicarse en el repositorio.

---

## 5. Funcionalidades del sistema

La plataforma incorpora funcionalidades diferenciadas según el tipo de usuario.

### 5.1. Visitantes y clientes

- Navegación por la tienda en línea.
- Visualización del catálogo de productos.
- Consulta del detalle de los productos.
- Gestión del carrito de compras.
- Proceso de checkout.
- Realización de pedidos.
- Registro de nuevos clientes.
- Consulta del historial de compras para clientes autenticados.

### 5.2. Vendedores

- Acceso a la página de inicio.
- Consulta y visualización de productos.
- Acceso al panel de vendedor.
- Consulta de órdenes.
- Visualización del detalle de las órdenes.

Los vendedores tienen restricciones para acceder al carrito de compras y al proceso de checkout.

### 5.3. Administradores

- Gestión de productos.
- Administración de categorías.
- Gestión de órdenes.
- Administración de usuarios.

**Control de acceso:** la interfaz restringe las opciones de navegación según el rol del usuario autenticado. La autorización de las operaciones también se valida en el backend.

---

## 6. Cuentas de demostración

El sistema dispone de cuentas locales para probar las funcionalidades correspondientes a los roles de administrador y vendedor.

| Rol | Correo electrónico | Contraseña |
|---|---|---|
| Administrador | `admin.ep3@duoc.cl` | `Admin123!` |
| Vendedor | `vendedor.ep3@duoc.cl` | `Vendedor123!` |

Los usuarios con rol de cliente pueden registrarse directamente desde la aplicación.

**Consideración de seguridad:** las credenciales indicadas son exclusivamente para demostraciones locales. Deben modificarse antes de utilizar el sistema en un entorno compartido o productivo.

---

## 7. Integración y comunicación con el backend

La comunicación con la API REST se encuentra centralizada en el siguiente archivo:

```text
src/services/api.js
```

Este servicio utiliza `fetch` para gestionar las solicitudes HTTP entre el frontend y el backend.

La aplicación utiliza la siguiente configuración:

```javascript
credentials: 'include'
```

Esto permite incluir las cookies de sesión durante las solicitudes al servidor, incluyendo la cookie `HttpOnly` utilizada para la autenticación.

### Rutas de navegación

La aplicación utiliza rutas basadas en hash para gestionar la navegación.

Ejemplos:

```text
http://localhost:5173/#/productos
http://localhost:5173/#/vendedor
```

### Configuración para despliegues independientes

Cuando el frontend y el backend se encuentran desplegados en servidores diferentes, se debe configurar `VITE_API_URL` con la dirección pública de la API.

Además, el backend debe permitir el origen del frontend mediante la configuración de `FRONTEND_URL`.

---

## 8. Construcción y pruebas

### 8.1. Generar la versión de producción

Para generar los archivos optimizados de la aplicación:

```bash
npm run build
```

Los archivos resultantes se almacenan en el directorio:

```text
dist/
```

### 8.2. Ejecutar las pruebas automatizadas

```bash
npm test
```

### 8.3. Ejecutar las pruebas con cobertura

```bash
npm run test:coverage
```

El proyecto utiliza Jasmine y Karma para ejecutar las pruebas automatizadas mediante Google Chrome Headless.

El reporte de cobertura se genera en:

```text
coverage/
```

El porcentaje de cobertura debe corresponder al resultado real obtenido al ejecutar las pruebas del proyecto.

---

## 9. Despliegue con Docker

El repositorio incorpora archivos de referencia para el despliegue integrado del frontend:

- `Dockerfile`: configuración para construir la imagen del frontend.
- `nginx.conf`: configuración del servidor Nginx.

La configuración de Nginx considera que el servicio backend puede resolverse mediante el nombre:

```text
backend
```

Para que esta configuración funcione, ambos servicios deben encontrarse conectados a la misma red Docker.

---

## 10. Estructura del proyecto

La organización general del frontend es la siguiente:

```text
frontend_fullstack/
│
├── public/
│
├── src/
│   ├── services/
│   │   └── api.js
│   │
│   └── ...
│
├── .env.example
├── .gitignore
├── Dockerfile
├── index.html
├── nginx.conf
├── package.json
├── package-lock.json
└── README.md
```

---

## 11. Repositorios relacionados

El proyecto se encuentra dividido en dos repositorios independientes:

| Componente | Repositorio |
|---|---|
| Frontend | [frontend_fullstack](https://github.com/mau-u/frontend_fullstack) |
| Backend | [backend_fullstack](https://github.com/mau-u/backend_fullstack) |

Esta separación permite mantener y desarrollar la interfaz de usuario y los servicios del servidor de manera independiente.

---

## 12. Información del proyecto

**Nombre:** Pastelería Mil Sabores

**Institución:** Duoc UC

**Tipo de proyecto:** Proyecto académico semestral

**Área:** Desarrollo de aplicaciones Full Stack

**Descripción:** Desarrollo de una plataforma de comercio electrónico para una pastelería, incorporando funcionalidades de catálogo, gestión de usuarios, administración de productos, carrito de compras y procesamiento de pedidos.

### Desarrolladores

- Mauricio Vega
- Kevin Angulo
- Damián Galaz

---

**Pastelería Mil Sabores — Plataforma de comercio electrónico.**