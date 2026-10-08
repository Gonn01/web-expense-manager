# Requerimientos no funcionales

Describen **cómo** debe comportarse el sistema: atributos de calidad y restricciones. Cada uno indica a qué proyecto aplica (**API**, **Web**, **App** móvil, o **Todos**).

- Identificador: `RNF-<categoría>-NN`.
- Los marcados como *Limitación conocida* describen un incumplimiento actual del requerimiento, no un comportamiento deseado.

Categorías: [SEG](#seg--seguridad) · [CON](#con--consistencia-entre-clientes) · [USA](#usa--usabilidad) · [REN](#ren--rendimiento) · [DIS](#dis--disponibilidad-y-tolerancia-a-fallos) · [INT](#int--integridad-y-auditoría) · [MAN](#man--mantenibilidad) · [POR](#por--portabilidad-y-entorno) · [LOC](#loc--localización)

## SEG — Seguridad

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-SEG-01 | Las contraseñas se almacenan únicamente como hash bcrypt (factor de costo 12). Nunca en texto plano. | API |
| RNF-SEG-02 | La sesión se representa con un JWT firmado, con vigencia de 7 días, que viaja en el encabezado `Authorization: Bearer <token>`. | Todos |
| RNF-SEG-03 | Toda ruta de la API fuera de `/api/auth/*` exige un token válido. Sin token, o con un token inválido o vencido, responde 401. El 403 se reserva para un usuario autenticado que no tiene permiso sobre el recurso (`NO_AUTORIZADO`). | API |
| RNF-SEG-04 | El usuario que opera se toma siempre del token, nunca de un dato enviado por el cliente. Toda lectura o modificación de entidades, gastos, categorías, sesiones y snapshots se restringe al dueño. | API |
| RNF-SEG-05 | El inicio de sesión no revela si el email existe: email inexistente y contraseña incorrecta producen la misma respuesta. | API |
| RNF-SEG-06 | Los secretos (`JWT_SECRET`, `DATABASE_URL`, credenciales de Pusher y Firebase) se leen de variables de entorno y no se versionan. | Todos |
| RNF-SEG-07 | La app móvil guarda el token en almacenamiento seguro del dispositivo. La web lo guarda en `localStorage`. | App, Web |
| RNF-SEG-08 | Todas las consultas a la base usan parámetros posicionales (`$1, $2…`); no se concatenan valores en el SQL. | API |
| RNF-SEG-09 | En producción, la comunicación entre clientes y API es por HTTPS, y la conexión con Pusher usa TLS. | Todos |

**Limitaciones conocidas**

- La API acepta peticiones de cualquier origen (CORS abierto).
- Los canales de Pusher (`compartidos-<userId>`) son públicos: no hay autenticación de canal. Los eventos solo llevan identificadores y nombres, no montos.

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
| RNF-USA-06 | Las acciones de un solo campo (favorito, postergar, marcar en la sesión) se reflejan en pantalla de inmediato y se revierten si el servidor las rechaza. | Web, App |
| RNF-USA-07 | Toda carga de datos muestra un indicador de progreso. | Web, App |
| RNF-USA-08 | Las preferencias de interfaz (barra lateral colapsada, balances ocultos, vista en lista o grilla) se recuerdan entre sesiones en el dispositivo. | Web |

## REN — Rendimiento

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-REN-01 | Las cotizaciones de moneda se cachean 5 minutos; no se consultan en cada render ni en cada navegación. | Web, App |
| RNF-REN-02 | El dashboard y el listado de entidades se resuelven con una única consulta agregada cada uno, no con una consulta por entidad. | API |
| RNF-REN-03 | Una mutación puntual actualiza el estado local con la respuesta del servidor; se evita recargar la pantalla completa. | Web, App |
| RNF-REN-04 | Varios componentes suscritos al mismo canal de tiempo real comparten una única suscripción. | Web |

*Limitación conocida*: las acciones de compartidos y la creación de un gasto desde el dashboard todavía recargan la pantalla completa (ver `checklist_mis_cuentas.md`, "Optimizaciones de recarga").

## DIS — Disponibilidad y tolerancia a fallos

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-DIS-01 | Un fallo al emitir una notificación en tiempo real no hace fallar la operación que la originó. | API |
| RNF-DIS-02 | Un fallo al escribir el historial de una entidad no hace fallar la operación que lo originó. | API |
| RNF-DIS-03 | Un error no previsto en la API se registra y devuelve un 500 genérico, sin tumbar el servidor ni filtrar el detalle interno. | API |
| RNF-DIS-04 | Sin servicio de tiempo real, los clientes siguen funcionando; los datos se actualizan al recargar o navegar. | Web, App |
| RNF-DIS-05 | Sin el servicio de cotizaciones, la aplicación sigue funcionando sin mostrar equivalencias. | Web, App |
| RNF-DIS-06 | La app móvil arranca y funciona aunque Firebase no esté configurado: el inicio con Google queda deshabilitado y la analítica no hace nada. | App |
| RNF-DIS-07 | La app móvil reintenta automáticamente las peticiones que fallan por corte de conexión. | App |
| RNF-DIS-08 | Al finalizar una sesión de cuentas, el fallo al pagar un gasto no impide pagar el resto ni generar el snapshot. | API |

*Limitación conocida*: las operaciones que escriben varias filas (crear gasto con espejo y copia compartida, finalizar una sesión) no se ejecutan dentro de una transacción de base de datos; un fallo a mitad de camino puede dejar datos parciales.

## INT — Integridad y auditoría

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-INT-01 | Entidades, gastos y categorías se eliminan con baja lógica; sus datos se conservan. | API |
| RNF-INT-02 | Las cuotas pagas de un gasto no se guardan como contador: se derivan de la cantidad de movimientos de pago. | API |
| RNF-INT-03 | Toda operación relevante sobre un gasto o una entidad deja un movimiento en su historial, con tipo y fecha. | API |
| RNF-INT-04 | Un snapshot de cuentas es inmutable y autocontenido: guarda nombres y montos al momento del cierre y no cambia si después se editan o eliminan los gastos. | API |
| RNF-INT-05 | Los montos se guardan en su moneda original. Las conversiones son solo de presentación y nunca se persisten. | Todos |

*Limitación conocida*: las fechas se muestran con un corrimiento de 3 horas respecto de la hora local (pendiente en `checklist_mis_cuentas.md`).

## MAN — Mantenibilidad

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-MAN-01 | La API respeta la separación en capas `route → factory → controller → service → repository`. La lógica de negocio vive solo en los services. | API |
| RNF-MAN-02 | La web centraliza todas las llamadas HTTP y el manejo de errores en un único módulo, y separa por pantalla los hooks de datos de los de interfaz. | Web |
| RNF-MAN-03 | La app móvil respeta la dependencia unidireccional `app → services → repositories → providers → core` y la regla de una clase por archivo. | App |
| RNF-MAN-04 | La API cuenta con pruebas unitarias, ejecutables sin base de datos, de sus controllers, del middleware de autenticación y de las reglas de pertenencia y de pago del service de gastos. | API |
| RNF-MAN-05 | El código pasa el linter configurado en cada proyecto (ESLint en web y API, `flutter analyze` en la app). | Todos |
| RNF-MAN-06 | Todo cambio funcional se implementa en ambos clientes y se refleja en esta documentación y en las guías de `.claude/` dentro del mismo cambio. | Todos |

*Limitación conocida*: la web y la app móvil no tienen pruebas automatizadas. Los services de la API distintos del de gastos (compartidos, categorías, settlement, entidades) tampoco.

## POR — Portabilidad y entorno

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-POR-01 | La web funciona en las versiones actuales de los navegadores modernos, como aplicación de una sola página. | Web |
| RNF-POR-02 | La app móvil funciona en Android e iOS. | App |
| RNF-POR-03 | La URL de la API, y las credenciales de Firebase y Pusher, son configurables por entorno sin modificar código. | Web, App |
| RNF-POR-04 | La API persiste en PostgreSQL. El esquema se administra fuera del repositorio. | API |

**Servicios externos de los que depende el sistema**

| Servicio | Uso | Si no está disponible |
| --- | --- | --- |
| Firebase Authentication | Inicio de sesión con Google | No se puede entrar con Google; email y contraseña sigue funcionando |
| Pusher Channels | Notificaciones en tiempo real | RNF-DIS-04 |
| dolarapi.com | Cotización de USD y EUR | RNF-DIS-05 |
| Firebase Analytics | Registro de errores de la app móvil | RNF-DIS-06 |

## LOC — Localización

| ID | Requerimiento | Aplica a |
| --- | --- | --- |
| RNF-LOC-01 | La interfaz, los mensajes de error y los términos del dominio están en español rioplatense. | Todos |
| RNF-LOC-02 | La app móvil no contiene textos fijos en el código de interfaz: todos provienen de los archivos de localización, en español e inglés. | App |
| RNF-LOC-03 | Los montos se muestran con el formato y el símbolo de su moneda (ARS, USD, EUR). | Web, App |

*Limitación conocida*: la web tiene los textos escritos directamente en los componentes, solo en español.
