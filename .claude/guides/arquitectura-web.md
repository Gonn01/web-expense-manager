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
  hooks/           hooks compartidos (use-pusher-channel, use-compartidos, use-settlement, use-exchange-rates, use-theme-sync, use-media-query)
  services/        api.js (instancia única de axios + todas las llamadas), error-handler.js
  store/           stores de zustand, uno por dominio
  lib/             singletons de clientes de terceros (pusher.js)
  i18n/            configuración de i18next y traducciones (locales/es.json, locales/en.json)
  utils/           formateo, enums, catálogo de errores, armado de textos
```

Rutas (`App.jsx`): `/login`, `/register`, `/forgot-password` y, bajo `/app` con `ProtectedRoute`: `dashboard`, `entidades`, `entidades/:id`, `gastos/:id`, `compartidos` (`notificaciones` redirige ahí), `settlement`, `settlement/:id`, `configuracion`. `Login`, `Register` y `ForgotPassword` se importan directo; `AppLayout` y todas las pantallas de `/app` se cargan con `lazy()` (un chunk por pantalla), con `Loader` como fallback de `Suspense` en `App.jsx` y alrededor del `Outlet` de `AppLayout`, así la barra lateral no desaparece mientras carga una pantalla.

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
- **Un store solo para estado que comparten varias pantallas** (auth, entidades, categorías, sesión de cuentas, contadores de compartidos, notificaciones, snackbar, diálogo, preferencias de UI). El estado de una sola pantalla vive en su hook de datos, salvo los datos del servidor de los módulos principales, que usan el cache de pantallas (sección 4).
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

Excepción: los `SILENT_PATHS` (`/auth/login`, `/auth/register`, `/auth/firebase-login`, `/auth/resend-verification`, `/auth/forgot-password`). Login, registro y recuperación muestran el error en su formulario. Ante `EMAIL_NO_VERIFICADO`, `use-login.js` guarda el email y la contraseña del intento y `Login` muestra `VerificationNotice`, que llama a `resendVerification` con esos datos. El registro navega a `/login` con `{ registeredEmail, verificationSent }` en el `state` de la ruta, y `Login` lo muestra con `RegistrationNotice`. `register`, `resendVerification` y `requestPasswordReset` mandan `language` (`getActiveLanguage()` de `@/i18n`) para que Firebase escriba el mail en el idioma de la interfaz. `/forgot-password` (`pages/auth/ForgotPassword/`) siempre muestra el mismo mensaje al enviar, exista o no la cuenta. `/auth/firebase-login` lo maneja `use-google-auth.js`: envía solo el ID token de Firebase, abre `GoogleLinkDialog` ante `VINCULACION_REQUIERE_CONTRASENA` y pasa el resto de los errores a `notifyError`.

Consecuencias:

- **No** mostrar el error otra vez en un `catch`: ya lo mostró el interceptor. El `catch` local solo corta el flujo (no hay estado optimista que revertir).
- **No** saltear el interceptor con manejo ad hoc fuera de `SILENT_PATHS`.
- Código de error nuevo en la API → entrada nueva en `ERROR_PRESENTATION` (`utils/error-catalog.js`).
- **Campos bloqueados al editar un gasto**: la API los manda en `gasto.edit_locks` (`{ campo: motivo }`). `UpdateExpenseModal` los envuelve en `LockedField` (o les pasa el motivo como prop, p. ej. `amountLock`), que los deshabilita y muestra el motivo. El cliente no decide qué se bloquea: solo lee `edit_locks`. La acción **Transferir** del detalle (`TransferExpenseModal`) usa `utils/expense-transfer.js`: `transferBlockReason` toma el bloqueo de `edit_locks.financial_entity_id` y agrega el caso de la entidad actual vinculada a otro usuario (la API lo rechaza al guardar, no lo manda en `edit_locks`), y `transferTargets` filtra las entidades de destino válidas, también para el selector de entidad de `UpdateExpenseModal`.

## 4. Estado y feedback

- **Feedback global**: `GlobalFeedback.jsx` monta una vez el snackbar y el diálogo. Se disparan desde cualquier lado con `useSnackbarStore.getState().show(mensaje, tipo, icono)` y `useDialogStore.getState().alert({ title, message, tone })`. Sin prop drilling. Para pedir confirmación se usa `await useDialogStore.getState().confirm({ title, message, tone, confirmLabel })`, que resuelve `true`/`false`; no se usan `window.alert`/`window.confirm` nativos. Si la acción confirmada tarda (p. ej. terminar o descartar la sesión de cuentas), se pasa como `onConfirm: async () => …`: el diálogo queda abierto y bloqueado, con el spinner en su botón, hasta que termina. Ningún diálogo o modal de confirmación se cierra antes de que responda el servidor: `ConfirmDeleteModal` y el modal de pago reciben `loading`, bloquean Cancelar, Escape y el click en el fondo, y muestran el spinner en el botón de confirmar. El snackbar (`z-[70]`) queda por encima de los modales (`z-50`) y del diálogo (`z-[60]`).
- **Descartar cambios** (RNF-USA-11): un modal con formulario no llama a `onClose` directo, sino a `requestClose = useDiscardGuard(dirty, onClose, { busy })` (`hooks/use-discard-guard.js`), desde la X, Cancelar, el click en el fondo y Escape. Si `dirty` (hay datos cargados distintos de los iniciales), pide confirmación con `useDialogStore.confirm`; con `busy` (guardando) no cierra. Si ya hay un diálogo global abierto no hace nada, así el Escape que cierra la confirmación no vuelve a abrirla. El guardado exitoso cierra con `onClose` directo.
- **Botón de guardar deshabilitado**: todo botón de guardar o confirmar lleva la clase `btn-save` (`index.css`), que al estar `disabled` lo muestra sin relleno, con texto apagado y contorno punteado, sea cual sea el motivo. No se le agregan `disabled:opacity-*` propios. Los spinners dentro de esos botones usan `border-current` para verse con cualquiera de los dos estilos.
- **Validación de formularios de gasto**: `components/modals/Expenses/validate-expense.js` devuelve `{ campo: mensaje }` y lo usan los modales de alta y edición. El botón de guardar nunca se deshabilita por datos faltantes: al tocarlo con errores, cada campo los muestra (prop `error` de `TextInput` y de los selectores; los contenedores llevan `data-field`), la vista se lleva al primer campo con error y el footer fijo muestra el resumen (`ExpenseFormErrors`). Excepción: superar `MAX_INSTALLMENTS` (360 cuotas, chequeado con `exceedsMaxInstallments`) marca el campo de cuotas en el momento, sin esperar al primer intento de guardar.
- **Auth con persistencia manual**: `use-auth-store.js` lee y escribe `user` / `token` en `localStorage` dentro de sus acciones (no usa el middleware `persist`). Un campo persistido nuevo requiere tocar `getStoredAuthData()`, las acciones que lo setean y la limpieza de `logout()`.
- **Preferencias de UI**: `use-ui-store.js`, persistidas en `localStorage` bajo `ui:prefs` (barra lateral, balances ocultos, vista de entidades y `themeMode`). `mobileSidebarOpen` (menú abierto en pantallas chicas) vive en el mismo store pero no se persiste.
- **Tutorial de bienvenida** (RF-CFG-05): `store/use-onboarding-store.js` (abierto o no) y `hooks/use-onboarding.js` (`useOnboardingAutoOpen`, montado en `AppLayout`, lo abre si `hasSeenOnboarding(user.id)` es falso; `useOnboarding` lleva el paso y el teclado: flechas, Escape para saltar y el foco atrapado dentro del diálogo). Los componentes están en `components/onboarding/` y los textos de los pasos, en `onboarding-steps.js`. Al cerrarlo se guarda en `localStorage` bajo `onboarding:seen:<userId>`, que `logout()` no borra. Configuración lo vuelve a abrir desde `TutorialCard`. Las animaciones se apagan con `prefers-reduced-motion` (`motion-reduce:` y la media query de `index.css`).
- **Responsive**: la web se usa desde 360px de ancho. El corte principal es `lg` (1024px, `DESKTOP_QUERY` de `hooks/use-media-query.js`): desde ahí la barra lateral queda fija y se puede colapsar; por debajo, `MobileTopBar` muestra un botón que la abre como menú lateral superpuesto (se cierra al navegar, con Escape o tocando afuera), y la preferencia de colapsada se ignora. Las pantallas con scroll interno (dashboard, historial de cuentas) lo usan solo desde `lg` (`lg:overflow-y-auto`, `lg:min-h-0`); por debajo scrollea la página entera. En el dashboard, los balances van en una columna lateral desde `lg` y arriba de la lista por debajo. Al maquetar: diseñar primero para celular y agregar `sm:`/`md:`/`lg:`; filas con varios botones usan `flex-wrap`; textos largos llevan `min-w-0` + `truncate` o `break-words`; los modales usan `max-h-[90dvh]` (o `max-h-full` dentro de un overlay con padding) con scroll propio; nada que dependa solo de hover (en táctil los controles quedan visibles con `[@media(hover:hover)]:`).
- **Tema claro/oscuro**: `themeMode` (`ThemeMode` de `utils/enums.js`: `system`, `light`, `dark`; por defecto `system`). `utils/theme.js` pone o saca la clase `dark` en `<html>`; `main.jsx` la aplica antes del primer render (para que no parpadee) y `useThemeSync()` (montado en `App.jsx`) la mantiene al día, escuchando `prefers-color-scheme` cuando el modo es `system`. El selector está en Configuración (`AparienciaCard`).
- **Sin actualizaciones optimistas**: ningún cambio se aplica en pantalla antes de que responda el servidor. El botón muestra un spinner mientras el pedido está en curso, sin cambiar de tamaño (el contenido queda `invisible` y el spinner va encima), y la pantalla se actualiza con la respuesta, sin recargar todo. Si falla, no hay nada que revertir.
    - Favorito y postergar en el dashboard: `busyKeys` de `use-dashboard-data.js` (claves `postpone:<id>`, `favGasto:<id>`, `favEntidad:<id>`).
    - Marcar y desmarcar en la sesión de cuentas: `pendingIds` de `use-settlement-store.js`, o `loadingSettleIds` del dashboard para el diálogo de pago. Después del diálogo, las marcas se toman de la respuesta del POST (`applyMarked`), sin volver a pedir la sesión. Al eliminar una entidad, sus gastos se desmarcan con `applyUnmarked(deleted_purchase_ids)` de la respuesta del DELETE.
- **Evitar recargas completas**: tras una mutación puntual, aplicar la respuesta del endpoint al estado local en lugar de volver a pedir toda la pantalla. Al crear un gasto, `POST /gastos` devuelve sus cuotas pagas reales y, si tiene entidad de pago, el espejo en `mirror`: el dashboard (`addCreatedToGroups` en `use-dashboard-data.js`) y el detalle de entidad los insertan donde corresponde. Si hace falta volver a pedir, hacerlo sin el loader de pantalla completa (`{ silent: true }`).
- **Cache de pantallas**: dashboard, entidades, compartidos e historial de cuentas guardan sus datos con `useCachedState(clave, inicial)` (`store/use-screen-cache-store.js`), que sobrevive al desmontar la página. La primera visita muestra el loader; al volver, la pantalla se pinta con los datos guardados y se actualiza en segundo plano. Cada carga llama a `beginScreenRequest(clave)` y descarta su respuesta si ya no es la última. El cache vive solo en memoria, se vacía cuando cambia el token e ignora escrituras de un token anterior, para que una cuenta nunca vea datos de otra. El valor `inicial` debe ser una constante estable. Los detalles (`entidades/:id`, `gastos/:id`, `settlement/:id`) no se cachean.

## 5. Tiempo real

`src/hooks/use-pusher-channel.js` lleva un conteo de referencias de las suscripciones en un `Map` a nivel de módulo, para que varios componentes en el mismo canal no provoquen una desuscripción prematura cuando uno se desmonta. No "simplificarlo" sin conservar ese conteo.

`lib/pusher.js` expone `pusherClient`, creado con `createPusherClient` (`lib/create-pusher-client.js`, con pruebas). Si faltan `VITE_PUSHER_KEY` o `VITE_PUSHER_CLUSTER`, vale `null`, se avisa en la consola y `usePusherChannel` no se suscribe: la web funciona sin tiempo real. Todo uso directo de `pusherClient` debe contemplar ese `null`. El canal es privado: `pusherClient` pide la firma con `authorizeRealtimeChannel` (`services/api.js`, silenciosa) usando el token actual, y el nombre del canal sale siempre de `userRealtimeChannel` (`utils/realtime-channel.js`). Los eventos solo llevan identificadores: `Sidebar` escucha `notificacion.nueva`, recarga las notificaciones y arma el aviso con `takeAnnounceable` y `buildNotification`.

En Compartidos (`hooks/use-compartidos.js`), cada acción aplica su resultado al estado con `applyCompartidoAction` (`utils/compartidos-actions.js`), actualiza los contadores con `compartidosCounters` y recarga en segundo plano (`load({ silent: true })` sin esperar), así la pantalla no vuelve a cargarse entera. Las acciones en curso viven en la lista `loadingActions`, con claves `gasto-<id>`, `movement-<id>` y `edicion-<id>`, para que varias tarjetas muestren su spinner a la vez sin pisarse.

Campana: `components/notifications/NotificationsBell.jsx` vive en `MobileTopBar` y `DesktopTopBar`, y abre por portal un panel con `NotificationsList`. `notificationTarget` (`utils/notifications.js`) decide a dónde lleva cada notificación. `Compartidos` solo muestra acciones pendientes.

Canal: `private-notificaciones-<userId>`. Eventos: `compartido.nuevo`, `compartido.aprobado`, `compartido.rechazado`, `compartido.descartado`, `compartido.desvinculado`, `pago.pendiente`, `pago.confirmado`, `pago.rechazado`, `pago.retirado`, `pago.reversion_solicitada`, `pago.reversion_cancelada`, `pago.reversion_aceptada`, `pago.reversion_rechazada`, `edicion.*`, `entidad.vinculada`, `entidad.desvinculada`, `gasto.postergado`, `gasto.postergacion_quitada` y `notificacion.nueva`. `Sidebar` carga `use-notificaciones-store` y lo refresca con `notificacion.nueva`; `utils/notifications.js` arma texto, ícono y tono de cada evento, calcula el contador (`navBadgeCount`) y fusiona la primera página sin perder las ya cargadas (`mergeFirstPage`). La pantalla sigue en `pages/compartidos/`: `Compartidos.jsx` muestra las pestañas Actividad (`components/ActividadTab.jsx`) y Pendientes. El historial y el detalle de un snapshot (`pages/cuentas/hooks/use-settlement-history.js`) también se suscriben, para refrescar el estado de los pagos compartidos. El detalle de un gasto (`pages/detalle_gasto/hooks/use-gasto-data.js`) escucha los eventos de pagos, ediciones y estado del compartido, y recarga solo si el gasto es o fue compartido (`was_shared`, porque `shared_counterparty` viene vacío hasta que la otra persona aprueba), ya que el `purchaseId` del evento puede ser la copia de la otra persona. Después de confirmar o rechazar un pago desde Compartidos se vuelve a pedir la sesión de cuentas (`loadSession`), porque la API puede haber desmarcado la copia. Al recibir `pago.pendiente`, el dashboard suma 1 a `counterparty_pending_quotas` de la tarjeta `copyId`, sin recargar; los demás eventos lo recargan en silencio (`loadDashboard({ silent: true })`), sin mostrar la carga. El mapa de handlers que se pasa al hook debe estar memoizado (`useMemo`). `compartido.descartado` llega a las dos partes: `Sidebar` compara `actorId` con el usuario para no avisarle su propia acción. `compartido.desvinculado` llega solo a la otra parte. El detalle del gasto usa `can_share` y `share_target_name` para ofrecer "Sincronizar con <nombre>", y `deleteExpenseNotice` (`utils/delete-expense-notice.js`) elige el aviso de eliminación con `was_shared`, `shared_partner_name` y `status`. La pestaña Eliminados oculta Restaurar cuando `can_restore` es `false`. El contador de gastos por resolver sale de `countGastosPorResolver` (`utils/compartidos-pending.js`): recibidos pendientes más emitidos rechazados.

**Responder desde los detalles** (RF-CMP-20): `components/compartidos/PendingResponsesSection.jsx` reutiliza las tarjetas y `AprobarModal` de `components/compartidos/`. `utils/pending-responses.js` selecciona desde los datos de `useCompartidos` lo que corresponde a cada pantalla: `pendingResponsesForEntity` (gastos recibidos de la persona vinculada) y `pendingResponsesForGasto` (aprobación, pagos, reversiones y edición del gasto). Después de cada respuesta, la pantalla se recarga en silencio.

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
- Enums de dominio en `utils/enums.js`; no comparar contra strings sueltos. `MovementType` copia el enum de la API: un tipo de movimiento nuevo se agrega ahí y en `utils/movement-styles.js`.
- **Dashboard**: qué entidades se muestran lo deciden `keepsGroupOnDashboard`, `buildDashboardGroups` y `filterDashboardGroups` (`pages/dashboard/utils/dashboard-groups.js`, con pruebas): una entidad con `pending_count > 0` se conserva aunque no tenga gastos activos, y los filtros de moneda, tipo y frecuencia y la sesión de cuentas no la ocultan (el buscador, solo si coincide su nombre). Sin gastos activos se muestra `PendingApprovalNotice`. Los pendientes nunca entran en `items`, así que no cuentan en balances ni contadores. La misma regla está en Flutter.
- **Historiales**: el del gasto y el de la entidad comparten ícono y tono por tipo de movimiento (`movementStyle()` y `TONES` de `utils/movement-styles.js`); cada pantalla pone solo sus etiquetas. En el gasto, `paymentNumbers()` da a las líneas de envío y de reversión el número del pago de su `paired_movement_id`, sin sumar cuotas, y `eventDate()` muestra los pagos compartidos resueltos en la fecha de resolución (`created_at`) y el envío en su fecha de pago. Los filtros de fecha usan `components/DateRangeFilter.jsx` + `inDateRange()` de `utils/date-range.js`, que incluye todo el día de «Hasta» e invierte el rango si «Desde» es posterior.
- **Alias de Mercado Pago** (RF-ENT-14): `MercadoPagoCard` y `MercadoPagoAliasModal` (`pages/detalle_entidad/components/`), con la validación y la URL en `utils/mercado-pago.js`. **Transferir** copia el alias y recién entonces abre Mercado Pago; no hay un enlace público documentado para precargar el destinatario.
- Campos de monto con `components/AmountInput.jsx` (o `TextInput` con `type="amount"`): muestra los puntos de miles y la coma decimal mientras se escribe, pero el valor del estado sigue siendo el número crudo (`"1234.5"`), listo para `Number(...)`. No usar `type="number"` para montos.
- **Colores en los dos temas**: la variante `dark:` de Tailwind depende de la clase `dark` (`@custom-variant` en `index.css`), no del sistema operativo. Todo color de fondo, texto o borde lleva su par: `bg-white dark:bg-[#111714]`, `text-slate-900 dark:text-white`, `text-slate-500 dark:text-[#9eb7a8]`, `border-slate-200 dark:border-[#29382f]`. Un color sin `dark:` solo vale si sirve en los dos temas (texto blanco sobre un botón rojo o verde, overlays `bg-black/60`). Lo que no se pinta con clases (ejes y grilla de recharts) usa las variables `--chart-grid` y `--chart-tick` de `index.css`.
- Desplegables con `components/Select.jsx`, nunca con `<select>` nativo: recibe `options` (`{ value, label }`), `value`, `onChange(valor)` (siempre string, como el `<select>`) y un `placeholder` opcional que funciona como opción vacía. Con más de 10 opciones muestra un buscador (sin distinguir mayúsculas ni tildes). La lista se abre en un portal, así que no la recorta el `overflow` de un modal, y se cierra si se hace scroll fuera de ella (si no, quedaría flotando sobre el encabezado del modal). Los encabezados y pies `sticky` de los modales llevan `z-10`, para que los campos con posición propia no se dibujen encima al hacer scroll.
- **Textos e idioma**: todo texto visible va en `src/i18n/locales/es.json` y `en.json`, con las mismas claves, variables y etiquetas (lo verifica `utils/locale-catalog.test.js`). Se usa `t` de `@/i18n`, también fuera de React; `<Trans>` para texto con marcado, y claves `_one`/`_other` para plurales. No se arman oraciones concatenando fragmentos. Para `Intl` y `toLocale*` se usa `getIntlLocale()`. El idioma es una preferencia por navegador (RF-CFG-06: `system`, `es`, `en`; clave `ui:language`, `IdiomaCard` en Configuración, `getLanguagePreference` y `setLanguagePreference` de `@/i18n`). `system` sigue al navegador (primer idioma soportado; si no hay, inglés). Cambiar el idioma activo recarga la app, porque algunas etiquetas se calculan al cargar el módulo. Los valores de datos de la API (`EGRESO`, `INGRESO`, estados) no se traducen.
- Variables de entorno con prefijo `VITE_` en `.env` (no versionado): `VITE_API_BASE_URL`, y opcionales `VITE_FIREBASE_*` (sin ellas `auth` de `firebase.js` vale `null`, por `lib/create-firebase-auth.js`, y `GoogleButton` queda deshabilitado), `VITE_PUSHER_KEY` y `VITE_PUSHER_CLUSTER` (sin ellas no hay tiempo real).
- `npm run lint` y `npm run format` antes de dar por terminado un cambio.
- Pruebas unitarias con Vitest (`npm test`): el archivo `<nombre>.test.js` va junto al que prueba (`utils/convert-currency.test.js`), con imports explícitos de `vitest` (`describe`, `it`, `expect`) y descripciones en español. Se prueban funciones puras de `utils/`, `lib/create-pusher-client.js`, `lib/create-firebase-auth.js`, `services/error-handler.js`, `store/use-settlement-store.js`, `store/use-screen-cache-store.js` y `store/use-dialog-store.js`, sin red ni DOM; no hay entorno `jsdom` configurado.
- `npm test` antes de dar por terminado un cambio que toque lógica cubierta por pruebas.

## 8. Checklist: feature nueva de punta a punta

- [ ] Funciones en `services/api.js` para cada endpoint, con el token como argumento.
- [ ] Códigos de error nuevos en `utils/error-catalog.js`.
- [ ] Store en `store/` solo si el estado lo comparten varias pantallas.
- [ ] `pages/<feature>/<Feature>.jsx` + `hooks/use-<feature>-data.js` + `hooks/use-<feature>-ui.js` + `components/`.
- [ ] Ruta en `App.jsx`, dentro de `/app` si requiere sesión, con la pantalla importada con `lazy()`; entrada en `components/Sidebar.jsx` si es navegable.
- [ ] Componentes reutilizados por más de una pantalla en `src/components/`.
- [ ] Textos nuevos en `locales/es.json` y `locales/en.json`.
- [ ] Sin manejo de errores ad hoc: los muestra el interceptor.
- [ ] Suscripción a Pusher con `usePusherChannel` si la pantalla depende de acciones de otro usuario.
- [ ] `npm run lint` sin errores y `npm test` en verde.
- [ ] Pruebas unitarias para las reglas nuevas que sean funciones puras.
- [ ] **Paridad**: el mismo cambio funcional hecho en la app Flutter.
- [ ] **Documentación**: ver [documentacion.md](documentacion.md).

## 9. Trampas

- Las pruebas son de Vitest (`npm test`), en archivos `*.test.js` junto al código. Los componentes se prueban con Testing Library en `*.test.jsx` (entorno jsdom, helpers en `src/test/`) y los flujos completos con Playwright en `e2e/` (`npm run test:e2e`, requiere `E2E_API_DIR`). Los hooks no tienen pruebas directas. Para probar lógica de una pantalla, sacarla a un `utils/` y probar esa función.
- No usar `vi.mock` con el alias `@/`: en Windows el mock se ignora si el directorio de trabajo tiene la unidad en minúscula (`d:\`, como lo abre VS Code), y la prueba pasa o falla según desde dónde se corra. Para reemplazar acciones de un store se usa `setState`; para simular HTTP, `axios.defaults.adapter` antes de importar el módulo con `await import` (ver `store/use-settlement-store.test.js`).
- Los textos que redacta la API (errores sin clave en `utils/error-catalog.js`, detalle de algunos movimientos) llegan en español aunque la interfaz esté en inglés.
- Los campos de monto usan punto de miles y coma decimal también en inglés (`utils/amount-input.js`).
