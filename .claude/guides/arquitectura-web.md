# Arquitectura — Web React (`web-plataformas-de-desarrollo`)

Cómo está organizada la web y cómo se construye una feature de punta a punta.

Stack: React 19, Vite (`rolldown-vite`), JavaScript/JSX sin TypeScript, Tailwind CSS 4, react-router-dom 7, zustand, axios, Firebase (login con Google), Pusher (tiempo real), recharts.

## 1. Estructura

```
src/
  App.jsx          tabla de rutas central
  guards/          ProtectedRoute: redirige a /login sin sesión
  layouts/         AppLayout: sidebar + Outlet; carga entidades, categorías y sesión de cuentas al montar
  pages/<feature>/ una carpeta por pantalla: <Feature>.jsx + components/ + hooks/
  components/      componentes compartidos entre pantallas (y modals/)
  hooks/           hooks compartidos (use-pusher-channel, use-settlement, use-exchange-rates)
  services/        api.js (instancia única de axios + todas las llamadas), error-handler.js
  store/           stores de zustand, uno por dominio
  lib/             singletons de clientes de terceros (pusher.js)
  utils/           formateo, enums, catálogo de errores, armado de textos
```

Rutas (`App.jsx`): `/login`, `/register` y, bajo `/app` con `ProtectedRoute`: `dashboard`, `entidades`, `entidades/:id`, `gastos/:id`, `compartidos`, `settlement`, `settlement/:id`, `configuracion`.

## 2. Capas

```
Página (<Feature>.jsx)        compone; no pide datos ni guarda estado de negocio
  ↓
hooks/use-<feature>-data.js   datos: llamadas a la API, stores, suscripción a Pusher
hooks/use-<feature>-ui.js     interfaz: modales abiertos, filtros, pestañas, loaders
  ↓
store/ (zustand)              estado compartido entre pantallas
  ↓
services/api.js               única puerta a HTTP
```

- **Separación data / ui por pantalla.** Al agregar una pantalla, respetar los dos hooks; no juntar todo en uno.
- **Un store solo para estado que comparten varias pantallas** (auth, entidades, categorías, sesión de cuentas, contadores de compartidos, snackbar, diálogo, preferencias de UI). El estado de una sola pantalla vive en su hook de datos.
- Los componentes no importan `axios` ni llaman a `fetch` contra la API propia.

## 3. Capa de API

Todas las llamadas HTTP pasan por la instancia de axios de `src/services/api.js`. Cada función:

- recibe el token como argumento y lo manda en `Authorization: Bearer <token>` (no hay header por defecto en axios);
- devuelve `data.data`, es decir, el contenido ya desenvuelto.

El interceptor de respuesta, para **toda** request fallida:

1. Normaliza el error con `error-handler.js` + `utils/error-catalog.js` → `{ code, status, message, variant, tone, … }`.
2. Lo muestra como snackbar o diálogo según el catálogo.
3. Ante 401: cierra la sesión y redirige a `/login` (una sola vez, por el flag `sessionExpiredHandled`). Como la redirección recarga la página, el aviso no puede ser un diálogo: `markSessionExpired()` (`utils/session-expired.js`) deja una marca en `sessionStorage` y la pantalla de login muestra el cartel "Tu sesión venció".
4. Re-lanza el error normalizado, para que el `catch` local pueda revertir estado.

Excepción: los `SILENT_PATHS` (`/auth/login`, `/auth/register`), cuyo formulario muestra el error en línea.

Consecuencias:

- **No** mostrar el error otra vez en un `catch`: ya lo mostró el interceptor. El `catch` local solo revierte estado optimista o corta el flujo.
- **No** saltear el interceptor con manejo ad hoc fuera de `SILENT_PATHS`.
- Código de error nuevo en la API → entrada nueva en `ERROR_PRESENTATION` (`utils/error-catalog.js`).

## 4. Estado y feedback

- **Feedback global**: `GlobalFeedback.jsx` monta una vez el snackbar y el diálogo. Se disparan desde cualquier lado con `useSnackbarStore.getState().show(mensaje, tipo, icono)` y `useDialogStore.getState().alert({ title, message, tone })`. Sin prop drilling.
- **Auth con persistencia manual**: `use-auth-store.js` lee y escribe `user` / `token` en `localStorage` dentro de sus acciones (no usa el middleware `persist`). Un campo persistido nuevo requiere tocar `getStoredAuthData()`, las acciones que lo setean y la limpieza de `logout()`.
- **Preferencias de UI**: `use-ui-store.js`, persistidas en `localStorage` bajo `ui:prefs`.
- **Actualización optimista** para cambios de un solo campo (favorito, postergar, marcar en la sesión): aplicar en pantalla, llamar a la API y revertir en el `catch`.
- **Evitar recargas completas**: tras una mutación puntual, aplicar la respuesta del endpoint al estado local en lugar de volver a pedir toda la pantalla.

## 5. Tiempo real

`src/hooks/use-pusher-channel.js` lleva un conteo de referencias de las suscripciones en un `Map` a nivel de módulo, para que varios componentes en el mismo canal no provoquen una desuscripción prematura cuando uno se desmonta. No "simplificarlo" sin conservar ese conteo.

Canal: `compartidos-<userId>`. Eventos: `compartido.nuevo`, `compartido.aprobado`, `compartido.rechazado`, `pago.pendiente`, `pago.confirmado`, `pago.rechazado`. El mapa de handlers que se pasa al hook debe estar memoizado (`useMemo`).

## 6. Modo "hacer cuentas"

Flujo transversal, no una pantalla: `store/use-settlement-store.js` (caché del estado del servidor), `hooks/use-settlement.js` (estado derivado) y `hooks/use-settlements.js` (confirmación de pagos), contra los endpoints `/settlement/*`.

- La sesión y las marcas viven en la base; el store solo las cachea. `AppLayout` la carga al entrar.
- Con sesión abierta, pagar **marca** el gasto; el pago real se registra al terminar.
- Desde el dashboard no se puede pagar sin sesión: `ensureSettlementActive()` lo frena en el cliente y la API responde 409 `SETTLEMENT_REQUIRED` en el pago en lote.
- Desde el detalle de un gasto, sin sesión, el pago es directo. Desde el detalle de una entidad es siempre directo (`settleQuota(id, token, { direct: true })`).

Las reglas completas están en `docs/requerimientos-funcionales.md` (módulos PAG y CTA).

## 7. Convenciones

- Alias `@/*` → `src/*`. Debe coincidir en tres archivos: `vite.config.js` (`resolve.alias`), `jsconfig.json` (`compilerOptions.paths`) y `eslint.config.js` (`import/resolver.alias`).
- Archivos de componentes en `PascalCase.jsx`; hooks, stores y utilidades en `kebab-case.js`.
- Carpetas de `pages/` y términos del dominio en español, igual que la API.
- Enums de dominio en `utils/enums.js`; no comparar contra strings sueltos.
- Variables de entorno con prefijo `VITE_` en `.env` (no versionado): `VITE_API_BASE_URL`, `VITE_FIREBASE_*`, `VITE_PUSHER_KEY`, `VITE_PUSHER_CLUSTER`.
- `npm run lint` y `npm run format` antes de dar por terminado un cambio.

## 8. Checklist: feature nueva de punta a punta

- [ ] Funciones en `services/api.js` para cada endpoint, con el token como argumento.
- [ ] Códigos de error nuevos en `utils/error-catalog.js`.
- [ ] Store en `store/` solo si el estado lo comparten varias pantallas.
- [ ] `pages/<feature>/<Feature>.jsx` + `hooks/use-<feature>-data.js` + `hooks/use-<feature>-ui.js` + `components/`.
- [ ] Ruta en `App.jsx`, dentro de `/app` si requiere sesión; entrada en `components/Sidebar.jsx` si es navegable.
- [ ] Componentes reutilizados por más de una pantalla en `src/components/`.
- [ ] Sin manejo de errores ad hoc: los muestra el interceptor.
- [ ] Suscripción a Pusher con `usePusherChannel` si la pantalla depende de acciones de otro usuario.
- [ ] `npm run lint` sin errores.
- [ ] **Paridad**: el mismo cambio funcional hecho en la app Flutter.
- [ ] **Documentación**: ver [documentacion.md](documentacion.md).

## 9. Trampas

- No hay framework de tests configurado. Si se agregan, vitest es lo natural con Vite.
- El `README.md` de la raíz describe una versión vieja, solo con `localStorage`. No usarlo como referencia de arquitectura.
- Los textos de interfaz están escritos en los componentes, solo en español: la web no tiene l10n.
