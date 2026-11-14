# Plataforma de Gestión de Deudas — Web

Aplicación web para registrar y saldar deudas, créditos y gastos personales, organizados por persona o institución (**entidades financieras**) y compartidos con otros usuarios de la plataforma. Proyecto de la materia Plataformas de Desarrollo.

## Descripción del proyecto

El sistema está formado por tres proyectos sobre un mismo backend:

| Proyecto | Repositorio | Tecnología | Rol |
| --- | --- | --- | --- |
| **Web (este repo)** | [web-plataformas-de-desarrollo](https://github.com/Gonn01/web-plataformas-de-desarrollo) | React 19 + Vite | Cliente para navegador |
| **API** | [api-plataformas-desarrollo](https://github.com/Gonn01/api-plataformas-desarrollo) | Node.js / Express 5 + PostgreSQL | Backend único: persiste los datos y aplica las reglas de negocio |
| **App móvil** | [app_expense_manager](https://github.com/Gonn01/app_expense_manager) | Flutter | Cliente para Android e iOS, con la misma funcionalidad que la web |

Funcionalidades principales:

- **Autenticación** con email y contraseña o con Google (Firebase).
- **Dashboard**: gastos agrupados por entidad, filtros, totales y balance por moneda, equivalencia en la moneda preferida, gráficos y peso de los gastos sobre el sueldo.
- **Gastos** (egresos o ingresos) de pago único, en cuotas o fijos, en ARS, USD, EUR, BRL, CLP y UYU, con categorías, historial y reversión de pagos.
- **Entidades financieras** (personas, tarjetas, bancos, comercios), con favoritos y vinculación con otro usuario.
- **Gastos compartidos**: al vincular una entidad con otro usuario, la contraparte aprueba o rechaza los gastos y confirma los pagos. Los cambios llegan en tiempo real (Pusher).
- **Modo "hacer cuentas"**: sesión de cierre periódico en la que se marcan los pagos; al finalizarla se registran todos juntos y queda un snapshot inmutable que se puede compartir.
- **Configuración**: perfil, moneda preferida, sueldo, tema claro/oscuro.

La documentación funcional completa del sistema (web + app + API) está en [docs/](docs/). La entrada es [docs/descripcion-general.md](docs/descripcion-general.md).

## Requisitos previos

- **Node.js** 20 o superior y **npm**.
- La **API** corriendo en local o desplegada (ver [Backend](#backend-api)).
- Un proyecto de **Firebase** con Authentication y el proveedor Google habilitado (solo para el login con Google).
- Una app de **Pusher Channels** (solo para las notificaciones en tiempo real).

## Instalar dependencias

```bash
git clone https://github.com/Gonn01/web-plataformas-de-desarrollo.git
cd web-plataformas-de-desarrollo
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto (está en `.gitignore`, no se versiona). Vite solo expone al cliente las variables con prefijo `VITE_`.

```env
VITE_API_BASE_URL=http://localhost:3000/api

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_PUSHER_KEY=
VITE_PUSHER_CLUSTER=sa1
```

| Variable | Para qué se usa |
| --- | --- |
| `VITE_API_BASE_URL` | URL base de la API, incluido el prefijo `/api`. En local: `http://localhost:3000/api`. |
| `VITE_FIREBASE_*` | Configuración web de Firebase (consola de Firebase → Configuración del proyecto → Tus apps). Se usa para el inicio de sesión con Google. |
| `VITE_PUSHER_KEY`, `VITE_PUSHER_CLUSTER` | Key pública y cluster de la app de Pusher; deben ser los mismos que usa la API. |

Después de cambiar el `.env` hay que reiniciar el servidor de desarrollo.

## Correr el proyecto en local

1. Levantar la API (por defecto en `http://localhost:3000`). Su CORS ya permite `http://localhost:5173`.
2. Levantar la web:

```bash
npm run dev
```

La app queda en `http://localhost:5173`.

### Scripts disponibles

| Comando | Qué hace |
| --- | --- |
| `npm run dev` / `npm start` | Servidor de desarrollo de Vite con recarga en caliente |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de `dist/` para probarlo |
| `npm run lint` / `npm run lint:fix` | ESLint (y corrección automática) |
| `npm run format` | Formatea el código con Prettier |

No hay framework de tests configurado en la web; los tests unitarios del sistema están en la API.

### Despliegue

La web se despliega en **Vercel**. [vercel.json](vercel.json) reescribe todas las rutas a `index.html` para que funcione el ruteo del lado del cliente. Las variables de entorno se cargan en el panel del proyecto en Vercel.

## Arquitectura técnica

```
Navegador ──► Web (React SPA) ──HTTP/JSON + JWT──► API (Express) ──SQL──► PostgreSQL
                  ▲                                     │
                  └──────── Pusher Channels ◄───────────┘  (eventos de compartidos)
```

### Frontend (este repo)

```
src/
  App.jsx          tabla de rutas (react-router-dom)
  guards/          ProtectedRoute: redirige a /login sin sesión
  layouts/         AppLayout: sidebar + barra superior móvil + Outlet
  pages/<feature>/ una carpeta por pantalla: <Feature>.jsx + components/ + hooks/
  components/      componentes compartidos y modales
  hooks/           hooks compartidos (Pusher, hacer cuentas, cotizaciones, tema, media queries)
  services/        api.js (instancia única de axios + todas las llamadas) y error-handler.js
  store/           stores de zustand, uno por dominio
  lib/             singletons de clientes de terceros (Pusher)
  utils/           formateo, enums, catálogo de errores
```

- **Capas por pantalla**: la página solo compone; `use-<feature>-data.js` pide datos y se conecta a los stores, y `use-<feature>-ui.js` maneja el estado de interfaz (modales, filtros, pestañas).
- **Capa HTTP centralizada**: todas las llamadas pasan por `src/services/api.js`. Su interceptor normaliza los errores, los muestra como snackbar o diálogo y, ante un 401, cierra la sesión y redirige a `/login`.
- **Estado global** con zustand (sesión, entidades, categorías, sesión de "hacer cuentas", preferencias de UI, feedback global).
- **Tiempo real**: suscripción al canal de Pusher `compartidos-<userId>`, con conteo de referencias para compartir el canal entre componentes.
- **Responsive** desde 360 px de ancho; tema claro, oscuro o del sistema.

Detalle completo en [.claude/guides/arquitectura-web.md](.claude/guides/arquitectura-web.md).

### Backend (API)

API REST en Node.js (ESM) con Express 5 sobre PostgreSQL, sin ORM. Cada recurso tiene cuatro capas: `routes → controller → service → repository`, armadas a mano en `factories/`. Las reglas de negocio viven en los services y el acceso a datos es SQL plano. La autenticación es con JWT (`Authorization: Bearer <token>`), y los eventos de gastos compartidos se publican en Pusher después del commit de la transacción.

Grupos de rutas bajo `/api`: `/auth`, `/health` (públicos), `/user`, `/entidades-financieras`, `/dashboard`, `/gastos`, `/categorias`, `/compartidos`, `/settlement`.

Instalación, variables de entorno y comandos de la API: ver su [README](https://github.com/Gonn01/api-plataformas-desarrollo#readme).

## Librerías principales

| Librería | Uso |
| --- | --- |
| [React 19](https://react.dev) | Interfaz de usuario |
| [Vite](https://vite.dev) (`rolldown-vite`) | Servidor de desarrollo y build |
| [Tailwind CSS 4](https://tailwindcss.com) | Estilos (tema claro/oscuro con la variante `dark:`) |
| [react-router-dom 7](https://reactrouter.com) | Ruteo del lado del cliente |
| [zustand](https://zustand.docs.pmnd.rs) | Estado global |
| [axios](https://axios-http.com) | Cliente HTTP hacia la API |
| [Firebase](https://firebase.google.com/docs/auth) | Inicio de sesión con Google |
| [pusher-js](https://github.com/pusher/pusher-js) | Notificaciones en tiempo real |
| [recharts](https://recharts.org) | Gráficos del dashboard |
| ESLint + Prettier | Linting y formato |

En la API: Express 5, postgres.js, jsonwebtoken, bcrypt, Pusher (servidor), dayjs y Vitest para los tests.

## Documentación

- [docs/](docs/): descripción general, misión/visión/valores, requerimientos funcionales y no funcionales, casos de uso y diagramas.
- [.claude/guides/arquitectura-web.md](.claude/guides/arquitectura-web.md): arquitectura de esta web.
- [checklist_mis_cuentas.md](checklist_mis_cuentas.md) y [checklits_expense_manager.md](checklits_expense_manager.md): checklists informales de funcionalidades hechas y pendientes.

## Autores

- Gonzalo Rigoni
- Agustin Masa
- Romina Herrera

Video y PDF de la entrega: [Google Drive](https://drive.google.com/drive/folders/1aWYYho0riHqlliThUd-Cn9B_s-Sy-b3Z?usp=sharing)
