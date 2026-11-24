# Expense Manager — Web

Aplicación web para registrar y saldar deudas, créditos y gastos personales, organizados por persona o institución (**entidades financieras**) y compartidos con otros usuarios de la plataforma. Proyecto de la materia Plataformas de Desarrollo.

## Descripción del proyecto

Single Page Application en React 19 + Vite que consume una API REST, la cual persiste los datos y aplica las reglas de negocio.

Funcionalidades principales:

- **Autenticación** con email y contraseña o con Google (Firebase).
- **Dashboard**: gastos agrupados por entidad, filtros, totales y balance por moneda, equivalencia en la moneda preferida, gráficos y peso de los gastos sobre el sueldo.
- **Gastos** (egresos o ingresos) de pago único, en cuotas o fijos, en ARS y las 35 monedas extranjeras con cotización del BCRA, con categorías, historial y reversión de pagos.
- **Entidades financieras** (personas, tarjetas, bancos, comercios), con favoritos y vinculación con otro usuario.
- **Gastos compartidos**: al vincular una entidad con otro usuario, la contraparte aprueba o rechaza los gastos y confirma los pagos. Los cambios llegan en tiempo real (Pusher).
- **Modo "hacer cuentas"**: sesión de cierre periódico en la que se marcan los pagos; al finalizarla se registran todos juntos y queda un snapshot inmutable que se puede compartir.
- **Configuración**: perfil, moneda preferida, sueldo, tema claro/oscuro.

## Requisitos previos

- **Node.js** 20 o superior y **npm**.
- La **API REST** de la plataforma corriendo en local o desplegada.
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
| `VITE_FIREBASE_*` | Configuración web de Firebase (consola de Firebase → Configuración del proyecto → Tus apps). Se usa para el inicio de sesión con Google. Son opcionales: si falta `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID` o `APP_ID`, la web funciona con email y contraseña y el botón de Google queda deshabilitado. |
| `VITE_PUSHER_KEY`, `VITE_PUSHER_CLUSTER` | Key pública y cluster de la app de Pusher Channels. Son opcionales: si falta alguna, la web funciona sin tiempo real, avisa en la consola del navegador y los datos se actualizan al recargar o navegar. |

Después de cambiar el `.env` hay que reiniciar el servidor de desarrollo.

## Correr el proyecto en local

1. Tener la API disponible en la URL configurada en `VITE_API_BASE_URL`, con `http://localhost:5173` entre sus orígenes permitidos por CORS.
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
| `npm test` / `npm run test:watch` | Pruebas unitarias y de componentes con Vitest (una corrida / modo observador) |
| `npm run test:e2e` | Flujos completos en navegador con Playwright. Requiere PostgreSQL y `E2E_API_DIR` con la carpeta del repo de la API |

Las pruebas usan [Vitest](https://vitest.dev) y viven junto al archivo que prueban: `*.test.js` para lógica y `*.test.jsx` para componentes con Testing Library. Los flujos completos están en `e2e/` y levantan una API y una base temporales. Los resultados medidos están en [docs/evidencias](docs/evidencias/README.md).

### Despliegue

La web se despliega en **Vercel**. [vercel.json](vercel.json) reescribe todas las rutas a `index.html` para que funcione el ruteo del lado del cliente. Las variables de entorno se cargan en el panel del proyecto en Vercel.

## Arquitectura técnica

```
Navegador ──► Web (React SPA) ──HTTP/JSON + JWT──► API REST
                  ▲                                  │
                  └────── Pusher Channels ◄──────────┘  (eventos de compartidos)
```

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
  i18n/            configuración de i18next y traducciones (locales/es.json, locales/en.json)
  utils/           formateo, enums, catálogo de errores
```

- **Capas por pantalla**: la página solo compone; `use-<feature>-data.js` pide datos y se conecta a los stores, y `use-<feature>-ui.js` maneja el estado de interfaz (modales, filtros, pestañas).
- **Capa HTTP centralizada**: todas las llamadas pasan por `src/services/api.js`. Su interceptor normaliza los errores, los muestra como snackbar o diálogo y, ante un 401, cierra la sesión y redirige a `/login`.
- **Estado global** con zustand (sesión, entidades, categorías, sesión de "hacer cuentas", preferencias de UI, feedback global).
- **Tiempo real**: suscripción al canal privado de Pusher `private-notificaciones-<userId>`, autorizada por la API, cuyos eventos solo llevan identificadores, con conteo de referencias para compartir el canal entre componentes.
- **Responsive** desde 360 px de ancho; tema claro, oscuro o del sistema.
- **Internacionalización** en español e inglés, a elección en Configuración o según el idioma del navegador; si no está soportado, usa inglés.

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
| [i18next](https://www.i18next.com) + [react-i18next](https://react.i18next.com) | Traducciones (español e inglés) |
| [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) | Pruebas unitarias y de componentes |
| [Playwright](https://playwright.dev) | Pruebas de flujos completos |
| ESLint + Prettier | Linting y formato |

## Seguimiento

- [checklist_mis_cuentas.md](checklist_mis_cuentas.md) y [checklits_expense_manager.md](checklits_expense_manager.md): checklists informales de funcionalidades hechas y pendientes.

## Autores

- Gonzalo Rigoni
- Romina Herrera

Video y PDF de la entrega: [Google Drive](https://drive.google.com/drive/folders/1aWYYho0riHqlliThUd-Cn9B_s-Sy-b3Z?usp=sharing)
