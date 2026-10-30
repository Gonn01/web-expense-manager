# Arquitectura — Web React (`web-plataformas-de-desarrollo`)

Cómo está organizada la web y cómo se construye una feature de punta a punta.

Stack: React 19, Vite (`rolldown-vite`), JavaScript/JSX sin TypeScript, Tailwind CSS 4, react-router-dom 7, zustand, axios, Firebase (login con Google), Pusher (tiempo real), recharts.

## 1. Estructura

```
src/
  App.jsx          tabla de rutas central
  guards/          ProtectedRoute: redirige a /login sin sesión
  layouts/         AppLayout: sidebar + barra superior móvil + Outlet; carga entidades, categorías y sesión de cuentas al montar
  pages/<feature>/ una carpeta por pantalla: <Feature>.jsx + components/ + hooks/
  components/      componentes compartidos entre pantallas (y modals/)
  hooks/           hooks compartidos (use-pusher-channel, use-settlement, use-exchange-rates, use-theme-sync, use-media-query)
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

- **No** mostrar el error otra vez en un `catch`: ya lo mostró el interceptor. El `catch` local solo corta el flujo (no hay estado optimista que revertir).
- **No** saltear el interceptor con manejo ad hoc fuera de `SILENT_PATHS`.
- Código de error nuevo en la API → entrada nueva en `ERROR_PRESENTATION` (`utils/error-catalog.js`).
- **Campos bloqueados al editar un gasto**: la API los manda en `gasto.edit_locks` (`{ campo: motivo }`). `UpdateExpenseModal` los envuelve en `LockedField` (o les pasa el motivo como prop, p. ej. `amountLock`), que los deshabilita y muestra el motivo. El cliente no decide qué se bloquea: solo lee `edit_locks`. La acción **Transferir** del detalle (`TransferExpenseModal`) usa `utils/expense-transfer.js`: `transferBlockReason` toma el bloqueo de `edit_locks.financial_entity_id` y agrega el caso de la entidad actual vinculada a otro usuario (la API lo rechaza al guardar, no lo manda en `edit_locks`), y `transferTargets` filtra las entidades de destino válidas, también para el selector de entidad de `UpdateExpenseModal`.

## 4. Estado y feedback

- **Feedback global**: `GlobalFeedback.jsx` monta una vez el snackbar y el diálogo. Se disparan desde cualquier lado con `useSnackbarStore.getState().show(mensaje, tipo, icono)` y `useDialogStore.getState().alert({ title, message, tone })`. Sin prop drilling. Para pedir confirmación se usa `await useDialogStore.getState().confirm({ title, message, tone, confirmLabel })`, que resuelve `true`/`false`; no se usan `window.alert`/`window.confirm` nativos. Si la acción confirmada tarda (p. ej. terminar o descartar la sesión de cuentas), se pasa como `onConfirm: async () => …`: el diálogo queda abierto y bloqueado, con el spinner en su botón, hasta que termina. El snackbar (`z-[70]`) queda por encima de los modales (`z-50`) y del diálogo (`z-[60]`).
- **Validación de formularios de gasto**: `components/modals/Expenses/validate-expense.js` devuelve `{ campo: mensaje }` y lo usan los modales de alta y edición. El botón de guardar nunca se deshabilita por datos faltantes: al tocarlo con errores, cada campo los muestra (prop `error` de `TextInput` y de los selectores; los contenedores llevan `data-field`), la vista se lleva al primer campo con error y el footer fijo muestra el resumen (`ExpenseFormErrors`). Excepción: superar `MAX_INSTALLMENTS` (360 cuotas, chequeado con `exceedsMaxInstallments`) marca el campo de cuotas en el momento, sin esperar al primer intento de guardar.
- **Auth con persistencia manual**: `use-auth-store.js` lee y escribe `user` / `token` en `localStorage` dentro de sus acciones (no usa el middleware `persist`). Un campo persistido nuevo requiere tocar `getStoredAuthData()`, las acciones que lo setean y la limpieza de `logout()`.
- **Preferencias de UI**: `use-ui-store.js`, persistidas en `localStorage` bajo `ui:prefs` (barra lateral, balances ocultos, vista de entidades y `themeMode`). `mobileSidebarOpen` (menú abierto en pantallas chicas) vive en el mismo store pero no se persiste.
- **Responsive**: la web se usa desde 360px de ancho. El corte principal es `lg` (1024px, `DESKTOP_QUERY` de `hooks/use-media-query.js`): desde ahí la barra lateral queda fija y se puede colapsar; por debajo, `MobileTopBar` muestra un botón que la abre como menú lateral superpuesto (se cierra al navegar, con Escape o tocando afuera), y la preferencia de colapsada se ignora. Las pantallas con scroll interno (dashboard, historial de cuentas) lo usan solo desde `lg` (`lg:overflow-y-auto`, `lg:min-h-0`); por debajo scrollea la página entera. En el dashboard, los balances van en una columna lateral desde `lg` y arriba de la lista por debajo. Al maquetar: diseñar primero para celular y agregar `sm:`/`md:`/`lg:`; filas con varios botones usan `flex-wrap`; textos largos llevan `min-w-0` + `truncate` o `break-words`; los modales usan `max-h-[90dvh]` (o `max-h-full` dentro de un overlay con padding) con scroll propio; nada que dependa solo de hover (en táctil los controles quedan visibles con `[@media(hover:hover)]:`).
- **Tema claro/oscuro**: `themeMode` (`ThemeMode` de `utils/enums.js`: `system`, `light`, `dark`; por defecto `system`). `utils/theme.js` pone o saca la clase `dark` en `<html>`; `main.jsx` la aplica antes del primer render (para que no parpadee) y `useThemeSync()` (montado en `App.jsx`) la mantiene al día, escuchando `prefers-color-scheme` cuando el modo es `system`. El selector está en Configuración (`AparienciaCard`).
- **Sin actualizaciones optimistas**: ningún cambio se aplica en pantalla antes de que responda el servidor. El botón muestra un spinner mientras el pedido está en curso, sin cambiar de tamaño (el contenido queda `invisible` y el spinner va encima), y la pantalla se actualiza con la respuesta, sin recargar todo. Si falla, no hay nada que revertir.
    - Favorito y postergar en el dashboard: `busyKeys` de `use-dashboard-data.js` (claves `postpone:<id>`, `favGasto:<id>`, `favEntidad:<id>`).
    - Marcar y desmarcar en la sesión de cuentas: `pendingIds` de `use-settlement-store.js`, o `loadingSettleIds` del dashboard para el diálogo de pago. Después del diálogo, las marcas se toman de la respuesta del POST (`applyMarked`), sin volver a pedir la sesión.
- **Evitar recargas completas**: tras una mutación puntual, aplicar la respuesta del endpoint al estado local en lugar de volver a pedir toda la pantalla.

## 5. Tiempo real

`src/hooks/use-pusher-channel.js` lleva un conteo de referencias de las suscripciones en un `Map` a nivel de módulo, para que varios componentes en el mismo canal no provoquen una desuscripción prematura cuando uno se desmonta. No "simplificarlo" sin conservar ese conteo.

Canal: `compartidos-<userId>`. Eventos: `compartido.nuevo`, `compartido.aprobado`, `compartido.rechazado`, `pago.pendiente`, `pago.confirmado`, `pago.rechazado`. El mapa de handlers que se pasa al hook debe estar memoizado (`useMemo`).

## 6. Modo "hacer cuentas"

Flujo transversal, no una pantalla: `store/use-settlement-store.js` (caché del estado del servidor), `hooks/use-settlement.js` (estado derivado) y `hooks/use-settlements.js` (confirmación de pagos), contra los endpoints `/settlement/*`.

- La sesión y las marcas viven en la base; el store solo las cachea. `AppLayout` la carga al entrar.
- Con sesión abierta, pagar **marca** el gasto; el pago real se registra al terminar.
- Desde el dashboard no se puede pagar sin sesión: `ensureSettlementActive()` lo frena en el cliente y la API responde 409 `SETTLEMENT_REQUIRED` en el pago en lote.
- No se puede terminar una sesión sin gastos marcados: `SettlementBar` muestra un snackbar en vez de confirmar, y si la API responde 409 `SETTLEMENT_EMPTY` (porque al cerrar descartó todos los marcados), el store vuelve a cargar la sesión.
- Desde el detalle de un gasto, sin sesión, el pago es directo. Desde el detalle de una entidad es siempre directo (`settleQuota(id, token, { direct: true })`).

Las reglas completas están en `docs/requerimientos-funcionales.md` (módulos PAG y CTA).

## 7. Convenciones

- Alias `@/*` → `src/*`. Debe coincidir en tres archivos: `vite.config.js` (`resolve.alias`), `jsconfig.json` (`compilerOptions.paths`) y `eslint.config.js` (`import/resolver.alias`).
- Archivos de componentes en `PascalCase.jsx`; hooks, stores y utilidades en `kebab-case.js`.
- Carpetas de `pages/` y términos del dominio en español, igual que la API.
- Enums de dominio en `utils/enums.js`; no comparar contra strings sueltos.
- Campos de monto con `components/AmountInput.jsx` (o `TextInput` con `type="amount"`): muestra los puntos de miles y la coma decimal mientras se escribe, pero el valor del estado sigue siendo el número crudo (`"1234.5"`), listo para `Number(...)`. No usar `type="number"` para montos.
- **Colores en los dos temas**: la variante `dark:` de Tailwind depende de la clase `dark` (`@custom-variant` en `index.css`), no del sistema operativo. Todo color de fondo, texto o borde lleva su par: `bg-white dark:bg-[#111714]`, `text-slate-900 dark:text-white`, `text-slate-500 dark:text-[#9eb7a8]`, `border-slate-200 dark:border-[#29382f]`. Un color sin `dark:` solo vale si sirve en los dos temas (texto blanco sobre un botón rojo o verde, overlays `bg-black/60`). Lo que no se pinta con clases (ejes y grilla de recharts) usa las variables `--chart-grid` y `--chart-tick` de `index.css`.
- Desplegables con `components/Select.jsx`, nunca con `<select>` nativo: recibe `options` (`{ value, label }`), `value`, `onChange(valor)` (siempre string, como el `<select>`) y un `placeholder` opcional que funciona como opción vacía. Con más de 10 opciones muestra un buscador (sin distinguir mayúsculas ni tildes). La lista se abre en un portal, así que no la recorta el `overflow` de un modal, y se cierra si se hace scroll fuera de ella (si no, quedaría flotando sobre el encabezado del modal). Los encabezados y pies `sticky` de los modales llevan `z-10`, para que los campos con posición propia no se dibujen encima al hacer scroll.
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
