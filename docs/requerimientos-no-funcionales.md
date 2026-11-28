# Requerimientos no funcionales

Describen **cómo** debe comportarse el sistema: atributos de calidad y restricciones. Cada uno indica a qué proyecto aplica (**API**, **Web**, **App** móvil, o **Todos**).

- Identificador: `RNF-<categoría>-NN`.
- Los marcados como *Limitación conocida* describen un incumplimiento actual del requerimiento, no un comportamiento deseado.

Categorías: [SEG](#seg--seguridad) · [CON](#con--consistencia-entre-clientes) · [USA](#usa--usabilidad) · [REN](#ren--rendimiento) · [DIS](#dis--disponibilidad-y-tolerancia-a-fallos) · [INT](#int--integridad-y-auditoría) · [MAN](#man--mantenibilidad) · [POR](#por--portabilidad-y-entorno) · [LOC](#loc--localización)

## SEG — Seguridad

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-SEG-01 | Con Firebase configurado en la API, las contraseñas las guarda Firebase Authentication y la base no guarda ninguna. Sin Firebase, y en las cuentas anteriores hasta su primer inicio de sesión (RF-AUT-15), se almacenan únicamente como hash bcrypt (factor de costo 12). Nunca en texto plano. El hash nunca se incluye en las respuestas de la API. | API |
| RNF-SEG-02 | La sesión se representa con un JWT firmado, con vigencia de 7 días, que viaja en el encabezado `Authorization: Bearer <token>`. Incluye la versión de sesión del usuario, que la API compara con la base en cada petición (RNF-SEG-17). | Todos |
| RNF-SEG-03 | Toda ruta de la API fuera de `/api/auth/*` y `/api/health` exige un token válido. Sin token, o con un token inválido o vencido, responde 401. El 403 se reserva para un usuario autenticado que no tiene permiso sobre el recurso (`NO_AUTORIZADO`). | API |
| RNF-SEG-04 | El usuario que opera se toma siempre del token, nunca de un dato enviado por el cliente. Toda lectura o modificación de entidades, gastos, categorías, sesiones y snapshots se restringe al dueño. | API |
| RNF-SEG-05 | El inicio de sesión no revela si el email existe: email inexistente y contraseña incorrecta producen la misma respuesta y ejecutan la misma comparación bcrypt. | API |
| RNF-SEG-06 | Los secretos (`JWT_SECRET`, `DATABASE_URL`, credenciales de Pusher y Firebase) se leen de variables de entorno y no se versionan. | Todos |
| RNF-SEG-07 | La app móvil guarda el token en almacenamiento seguro del dispositivo. La web lo guarda en `localStorage`. | App, Web |
| RNF-SEG-08 | Todas las consultas a la base usan parámetros posicionales (`$1, $2…`); no se concatenan valores en el SQL. | API |
| RNF-SEG-09 | En producción, la comunicación entre clientes y API es por HTTPS, y la conexión con Pusher usa TLS. | Todos |
| RNF-SEG-10 | La API solo acepta peticiones de navegador (CORS) desde los orígenes de la web: producción y dev en Vercel, y `http://localhost:5173` para desarrollo local. La app móvil no está sujeta a CORS. | API, Web |
| RNF-SEG-11 | La API no expone la tecnología del servidor: las respuestas no llevan el encabezado `X-Powered-By`. | API |
| RNF-SEG-12 | Las notificaciones push se dirigen a usuarios autenticados de Pusher Beams: la API solo emite el token de Beams para el usuario de la sesión. Su contenido no incluye montos ni nombres de gastos. | API, App |
| RNF-SEG-13 | El inicio de sesión con Google solo confía en un ID token de Firebase verificado por la API contra el proyecto de `FIREBASE_PROJECT_ID`. La identidad y el email nunca se toman de datos enviados por el cliente. | API, Web, App |
| RNF-SEG-14 | Vincular Google a una cuenta con contraseña exige esa contraseña o eliminarla, para que nadie conserve acceso a una cuenta creada de antemano con un email ajeno. | API, Web, App |
| RNF-SEG-15 | Las notificaciones en tiempo real viajan por un canal privado de Pusher por usuario (`private-notificaciones-<userId>`). Para suscribirse, el cliente pide la firma a `POST /user/realtime-auth` con su token, y la API solo firma el canal del usuario de la sesión. Los eventos publicados llevan solo identificadores: los nombres se obtienen de `GET /notificaciones`, que exige sesión. | API, Web, App |
| RNF-SEG-16 | La API limita los intentos con contadores atómicos en PostgreSQL, que guardan claves con hash: 5 por email e IP y 30 por IP cada 15 minutos en el inicio de sesión, 10 registros por IP por hora, 30 ingresos con Google por IP cada 15 minutos, 5 contraseñas incorrectas por cuenta cada 15 minutos al cambiarla o vincular Google, y 3 por email cada 15 minutos y 20 por IP por hora tanto en el reenvío de la verificación como en el pedido de recuperación de la contraseña. Al superarlos, o si Firebase bloquea temporalmente los intentos, responde 429 `DEMASIADOS_INTENTOS`. | API, Web, App |
| RNF-SEG-17 | Cambiar la contraseña, eliminarla al vincular Google o elegir "Cerrar todas las sesiones" invalida los tokens anteriores del usuario. Al cambiar la contraseña, el dispositivo que la cambió recibe un token nuevo y sigue conectado. | API, Web, App |
| RNF-SEG-18 | Con Firebase configurado, una cuenta con email y contraseña solo puede iniciar sesión con el email verificado (`EMAIL_NO_VERIFICADO`). La API habla con Firebase con una cuenta de servicio y la clave web del proyecto, que se leen de variables de entorno. El pedido de recuperación responde lo mismo exista o no la cuenta, y los mails los manda Firebase, sin servidor de correo propio. | API, Web, App |

**Limitaciones conocidas**

- Sin Firebase configurado en la API (entorno local y pruebas), el registro con email y contraseña no verifica que el correo pertenezca a quien se registra. RNF-SEG-14 protege al dueño real cuando entra con Google.
- Pedir la recuperación de una cuenta que todavía tenía la contraseña en la base la prepara en Firebase y esa contraseña deja de servir, aunque el pedido lo haga otra persona. El dueño recupera el acceso con el enlace que le llega por mail.
- Un cambio de contraseña hecho desde la página de Firebase no invalida los tokens de sesión ya emitidos por la API: siguen valiendo hasta vencer o hasta "Cerrar todas las sesiones".
- La autorización del canal se valida al suscribirse: una conexión ya suscrita sigue recibiendo eventos, que solo llevan identificadores, hasta desconectarse, aunque su token venza o se revoque.
- Las notificaciones push de Android nombran a quien actuó, por lo que ese nombre pasa por Pusher Beams y Firebase Cloud Messaging.
- El límite de inicio de sesión se aplica por email e IP para que un tercero no pueda bloquear una cuenta ajena. Un ataque distribuido entre muchas IP contra una misma cuenta no queda limitado.

## CON — Consistencia entre clientes

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-CON-01 | La web y la app móvil ofrecen la misma funcionalidad y las mismas reglas de negocio. Solo pueden diferir en lo visual: layout, navegación y componentes. | Web, App |
| RNF-CON-02 | Las reglas de negocio se hacen cumplir en la API. Las validaciones en los clientes son una ayuda para el usuario, no la garantía. | Todos |
| RNF-CON-03 | Todo error de dominio de la API lleva un `code` estable, separado del mensaje. Los clientes deciden cómo reaccionar según el `code`, nunca según el texto. | Todos |
| RNF-CON-04 | El catálogo de códigos de error de la API es la única fuente de verdad; cada cliente mantiene un catálogo espejo con su presentación. Un código nuevo se agrega en los tres. | Todos |
| RNF-CON-05 | Las respuestas exitosas de la API tienen la forma `{ data: … }` y las de error `{ error, code, details? }`. | API |

## USA — Usabilidad

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-USA-01 | Todo error de una operación se comunica al usuario con un mensaje comprensible, sin exponer detalles técnicos. | Web, App |
| RNF-USA-02 | Los errores recuperables se muestran como aviso transitorio; los que requieren atención (sin conexión, sesión expirada, sin permiso, error del servidor) como diálogo que el usuario debe aceptar. | Web, App |
| RNF-USA-03 | El mismo mensaje de error no se muestra dos veces dentro de una ventana de 4 segundos. | Web |
| RNF-USA-04 | Los formularios de inicio de sesión y registro muestran sus errores dentro del propio formulario, no como aviso global. | Web, App |
| RNF-USA-05 | Toda acción destructiva o irreversible (eliminar, desvincular, cerrar sesión, descartar sesión de cuentas) pide confirmación. | Web, App |
| RNF-USA-06 | Las acciones de un solo campo (favorito, postergar, marcar en la sesión) se aplican en pantalla recién cuando responde el servidor, sin recargar todo. Mientras tanto la acción muestra que está en curso; si el servidor la rechaza, no hay nada que revertir y se muestra el error. | Web, App |
| RNF-USA-07 | Toda carga de datos muestra un indicador de progreso. | Web, App |
| RNF-USA-08 | Las preferencias de interfaz se recuerdan entre sesiones en el dispositivo: el tema (claro, oscuro o el del sistema), el idioma y, por usuario, si ya vio el tutorial de bienvenida, en la web y en la app; la barra lateral colapsada, los balances ocultos y la vista en lista o grilla, solo en la web. | Web, App |
| RNF-USA-09 | Todas las pantallas se pueden usar en tema claro y oscuro: cada color de fondo, texto y borde tiene su variante para los dos temas, y los colores de acento usados como texto (ingresos, egresos, advertencias) se oscurecen en el tema claro para mantener el contraste. | Web, App |
| RNF-USA-10 | Un formulario con datos faltantes o inválidos no deshabilita el botón de guardar sin explicación: al intentar guardar marca cada campo con error con un mensaje concreto y muestra un resumen siempre visible, sin necesidad de scrollear. Los avisos globales se muestran por encima de los modales. | Web, App (formularios de gasto) |
| RNF-USA-11 | Cerrar un formulario con datos cargados y sin guardar (con el botón de cerrar o cancelar, tocando afuera, con Escape o con el botón atrás del sistema) pide confirmación para descartarlos. Un formulario sin cambios se cierra directamente. Aplica a crear y editar gasto, crear entidad, renombrar y vincular entidad, y aprobar gasto compartido. | Web, App |

## REN — Rendimiento

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-REN-01 | Las cotizaciones de moneda se cachean 5 minutos; no se consultan en cada render ni en cada navegación. | Web, App |
| RNF-REN-02 | El dashboard y el listado de entidades se resuelven con una única consulta agregada cada uno, no con una consulta por entidad. | API |
| RNF-REN-03 | Una mutación puntual actualiza el estado local con la respuesta del servidor; se evita recargar la pantalla completa. | Web, App |
| RNF-REN-04 | Varios componentes suscritos al mismo canal de tiempo real comparten una única suscripción. | Web |
| RNF-REN-05 | Las operaciones sobre varios gastos (marcar o desmarcar en lote, pagar desde el dashboard una entidad entera, finalizar la sesión de cuentas, eliminar una entidad, compartir un gasto con pagos previos) usan una cantidad fija de consultas a la base, no una o más por gasto. Las notificaciones que generan se envían en paralelo después de guardar, sin demorar la respuesta. | API |
| RNF-REN-06 | La web descarga el código de cada pantalla de la aplicación recién cuando se navega a ella: las pantallas de inicio de sesión y registro no cargan el código del dashboard, los gráficos ni el resto de las pantallas privadas. | Web |
| RNF-REN-07 | Al volver a un módulo principal (dashboard, entidades, compartidos, historial de cuentas) ya visitado en la sesión, sus datos se muestran de inmediato, sin el indicador de carga de pantalla completa, y se actualizan en segundo plano. Los datos guardados se conservan solo en memoria y se descartan al cambiar la sesión. | Web, App |
| RNF-REN-08 | Con 25 conexiones simultáneas, las operaciones medidas de la API responden con un percentil 97,5 menor a 500 ms y sin errores. Evidencia local en [evidencias](evidencias/README.md); no mide Vercel ni Supabase. | API |

*Limitación conocida*: las acciones de compartidos actualizan la tarjeta afectada al instante, pero después vuelven a pedir todo el listado en segundo plano, sin el loader. Cuando la otra persona aprueba o rechaza un gasto, el dashboard también se vuelve a pedir completo en segundo plano. Plan en [limitaciones-y-trabajo-futuro.md](limitaciones-y-trabajo-futuro.md#rendimiento).

## DIS — Disponibilidad y tolerancia a fallos

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-DIS-01 | Un fallo al emitir una notificación en tiempo real no hace fallar la operación que la originó. La notificación se guarda y se emite solo después de que la operación se guardó, y nunca si se deshizo. Un fallo al guardarla tampoco hace fallar la operación. La respuesta espera a que se guarde y se emita, porque la API corre en funciones de Vercel, con un límite de 5 segundos: si se supera, la operación responde igual y el aviso puede perderse. | API |
| RNF-DIS-02 | Un fallo al escribir el historial de una entidad no hace fallar la operación que lo originó. | API |
| RNF-DIS-03 | Un error no previsto en la API se registra y devuelve un 500 genérico, sin tumbar el servidor ni filtrar el detalle interno. | API |
| RNF-DIS-04 | Sin servicio de tiempo real, los clientes siguen funcionando; los datos y las notificaciones guardadas se actualizan al recargar o navegar. En la web esto incluye que falten `VITE_PUSHER_KEY` o `VITE_PUSHER_CLUSTER`: no se crea el cliente de Pusher y se avisa en la consola. | Web, App |
| RNF-DIS-05 | Sin el servicio de cotizaciones, la aplicación sigue funcionando sin mostrar equivalencias. | Web, App |
| RNF-DIS-06 | Los clientes arrancan y funcionan aunque Firebase no esté configurado: el botón de inicio con Google queda deshabilitado y email y contraseña siguen disponibles. En la app móvil, además, la analítica no hace nada. | Web, App |
| RNF-DIS-07 | La app móvil reintenta automáticamente las peticiones que fallan por corte de conexión. | App |
| RNF-DIS-08 | Finalizar una sesión de cuentas es una sola transacción: pagos, snapshot, cierre de la sesión y liberación de postergados se guardan juntos o no se guarda nada. Si falla, la sesión sigue abierta para reintentar. Dos cierres simultáneos de la misma sesión no pagan dos veces: el segundo espera al primero y encuentra la sesión ya cerrada. Los gastos compartidos marcados y sus copias también quedan bloqueados durante el cierre (y al confirmar, rechazar, retirar o revertir un pago compartido), así dos usuarios que cierran a la vez no generan pagos pendientes cruzados. Aprobar o rechazar un gasto compartido, y solicitar, aceptar, rechazar o cancelar una reversión, bloquean las dos copias, validan el estado después del bloqueo y escriben solo si sigue vigente: entre solicitudes simultáneas gana una y las demás reciben un error, sin dejar historial ni avisos. | API |
| RNF-DIS-09 | Sin Pusher Beams configurado o disponible, la operación de origen y el tiempo real siguen funcionando. Si el dispositivo no pudo registrarse, la app Flutter usa la notificación local mientras su proceso siga activo. | API, App |
| RNF-DIS-10 | Ante una caída de la base, la API sigue en marcha, informa 503 en `/health`, no expone detalles internos y se recupera sin reiniciarse. Un pago confirmado al usuario sobrevive a una caída abrupta y no se duplica. Un backup de la base se puede restaurar con los datos idénticos. Evidencia local en [evidencias](evidencias/README.md). | API |

## INT — Integridad y auditoría

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-INT-01 | Entidades y gastos se eliminan con baja lógica; sus datos se conservan y pueden restaurarse, salvo los gastos que son o fueron compartidos, que quedan guardados sin opción de restaurar para que las dos copias no se desincronicen. Los movimientos del historial nunca se borran: un pago revertido queda marcado como tal. Las categorías no se pueden eliminar. | API |
| RNF-INT-02 | Las cuotas pagas de un gasto no se guardan como contador: se derivan de la cantidad de movimientos de pago. | API |
| RNF-INT-03 | Toda operación relevante sobre un gasto o una entidad deja un movimiento en su historial, con tipo y fecha. Un cambio de estado de un pago o gasto compartido agrega una línea y no borra la anterior del historial. | API |
| RNF-INT-04 | Un snapshot de cuentas es inmutable y autocontenido: guarda nombres y montos al momento del cierre y no cambia si después se editan o eliminan los gastos. | API |
| RNF-INT-05 | Los montos se guardan en su moneda original. Las conversiones son solo de presentación y nunca se persisten. | Todos |
| RNF-INT-06 | Toda operación que escribe más de una fila se ejecuta en una transacción de base de datos: si algo falla a mitad de camino, no queda nada a medias. Por ejemplo, crear un gasto con su espejo y su copia compartida, editarlo o eliminarlo junto con su espejo, aprobar o rechazar un compartido, o reemplazar las categorías de un gasto. La única excepción es el historial de entidades (RNF-DIS-02), que es best-effort. | API |

**Limitaciones conocidas**

- Las fechas se muestran con un corrimiento de 3 horas respecto de la hora local.
- Una base que todavía no ejecutó `migrations/manual/2026-11-21_monedas_bcra.sql` puede rechazar con un 500 las monedas que le falten. La migración agrega todas las monedas soportadas y se puede ejecutar más de una vez.

## MAN — Mantenibilidad

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-MAN-01 | La API respeta la separación en capas `route → factory → controller → service → repository`. La lógica de negocio vive solo en los services. | API |
| RNF-MAN-02 | La web centraliza todas las llamadas HTTP y el manejo de errores en un único módulo, y separa por pantalla los hooks de datos de los de interfaz. | Web |
| RNF-MAN-03 | La app móvil respeta la dependencia unidireccional `app → services → repositories → providers → core` y la regla de una clase por archivo. | App |
| RNF-MAN-04 | La API cuenta con pruebas unitarias, ejecutables sin base de datos, de sus controllers, del middleware de autenticación y de las reglas de pertenencia y de pago del service de gastos. Además tiene pruebas de integración por HTTP contra un Postgres local temporal, que cubren pagos, sesión de cuentas, compartidos, concurrencia, límites de intentos, revocación de sesiones y bajas en cascada. | API |
| RNF-MAN-05 | El código pasa el linter configurado en cada proyecto (ESLint en web y API, `flutter analyze` en la app). | Todos |
| RNF-MAN-06 | Todo cambio funcional se implementa en ambos clientes y se refleja en esta documentación y en las guías de `.claude/` dentro del mismo cambio. | Todos |
| RNF-MAN-07 | La web tiene pruebas de componentes y flujos completos en navegador contra una API y una base temporales. La app tiene pruebas de widgets y un flujo completo en Android. | Web, App |
| RNF-MAN-08 | Cada repo define un pipeline de GitHub Actions que ejecuta lint y pruebas en cada push a `master` y en cada pull request. | Todos |

**Limitaciones conocidas**

- Las pruebas de componentes y widgets cubren los flujos de autenticación, compartidos y sesión de cuentas, no todas las pantallas.
- El flujo completo de la app en Android se ejecuta a mano, porque requiere un emulador; no forma parte del pipeline.
- En la API no tienen pruebas unitarias los services de categorías y dashboard.

## POR — Portabilidad y entorno

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-POR-01 | La web funciona en las versiones actuales de los navegadores modernos, como aplicación de una sola página. | Web |
| RNF-POR-02 | La app móvil funciona en Android e iOS. | App |
| RNF-POR-03 | La URL de la API, y las credenciales de Firebase y Pusher, son configurables por entorno sin modificar código. | Web, App |
| RNF-POR-04 | La API persiste en PostgreSQL. El esquema se administra fuera del repositorio. | API |
| RNF-POR-05 | La web se adapta al tamaño de pantalla, desde celulares (360px de ancho) hasta monitores de escritorio: en pantallas de menos de 1024px el menú lateral se abre desde una barra superior y el contenido se reacomoda en una columna, sin scroll horizontal. | Web |

**Servicios externos de los que depende el sistema**

| Servicio | Uso | Si no está disponible |
| --- | --- | --- |
| Firebase Authentication | Inicio de sesión con Google y, si está configurado en la API, registro, inicio de sesión con email, verificación del email y recuperación de la contraseña | Sin configurar en los clientes: no se puede entrar con Google y email y contraseña sigue funcionando (RNF-DIS-06). Sin configurar en la API: las contraseñas se guardan en la base y no hay verificación ni recuperación. Si no responde, la API devuelve un error al registrarse o entrar con email |
| Pusher Channels | Notificaciones en tiempo real | RNF-DIS-04 |
| Pusher Beams + Firebase Cloud Messaging | Notificaciones push en Android | RNF-DIS-09 |
| API de Estadísticas Cambiarias del BCRA | Cotización de las 35 monedas extranjeras soportadas | RNF-DIS-05 |
| Firebase Analytics | Registro de errores de la app móvil | RNF-DIS-06 |

## LOC — Localización

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-LOC-01 | La interfaz y los mensajes de error de los clientes están en español rioplatense y en inglés. Los términos del dominio en código y API están en español. | Todos |
| RNF-LOC-02 | Los clientes no contienen textos fijos en el código de interfaz: todos provienen de los archivos de localización, en español e inglés. | Web, App |
| RNF-LOC-03 | Los montos se muestran con el formato y el símbolo o código de su moneda. | Web, App |
| RNF-LOC-04 | Los campos de monto (monto del gasto, sueldo) agregan los puntos de miles mientras se escribe y usan la coma como separador decimal, en cualquier idioma. | Web, App |
| RNF-LOC-05 | Salvo que el usuario elija un idioma (RF-CFG-06), se toma del navegador o del dispositivo: se usa el primero de sus idiomas preferidos que esté soportado y, si ninguno lo está, inglés. | Web, App |
| RNF-LOC-06 | Las fechas, los números y los montos se muestran con el formato del idioma activo (`es-AR` o `en-US`). | Web, App |

*Limitación conocida*: los textos que redacta la API (mensajes de error sin traducción en el catálogo del cliente y detalle de algunos movimientos) llegan en español aunque la interfaz esté en inglés. En la app Flutter, los errores de validación de los formularios de inicio de sesión y registro están escritos en el código, en español y sin tildes, así que incumplen RNF-LOC-02.
