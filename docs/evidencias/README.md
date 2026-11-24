# Evidencias de calidad

Resultados medidos de los requerimientos no funcionales de rendimiento, disponibilidad y recuperación, y de las pruebas de los tres proyectos. Corresponden a la ejecución del 23/11/2026.

**Alcance de las mediciones**: la API y PostgreSQL corrieron en una misma máquina (Intel i9-12900K, 24 hilos, 32 GB, Node 22), con una base temporal y con `fsync` y commits sincrónicos activos. Las cifras comparan escenarios y prueban el comportamiento del sistema, pero **no miden Vercel, Supabase ni la latencia de red de producción**.

## Rendimiento bajo carga (RNF-REN-08)

Objetivo con 25 conexiones simultáneas: percentil 97,5 de latencia menor a 500 ms, sin respuestas de error. Datos cargados: 20 entidades y 100 gastos. Cada combinación corrió durante 15 segundos. Datos completos en [carga.json](carga.json).

| Operación | Conexiones | Solicitudes/s | p50 (ms) | p97,5 (ms) | p99 (ms) | Errores |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `GET /health` | 10 | 5676 | 1 | 3 | 3 | 0 |
| `GET /health` | 25 | 6584 | 3 | 5 | 6 | 0 |
| `GET /health` | 50 | 5943 | 8 | 12 | 13 | 0 |
| `GET /dashboard` | 10 | 585 | 16 | 25 | 28 | 0 |
| `GET /dashboard` | 25 | 747 | 32 | 47 | 51 | 0 |
| `GET /dashboard` | 50 | 908 | 54 | 64 | 67 | 0 |
| `GET /gastos/:id` | 10 | 765 | 12 | 18 | 20 | 0 |
| `GET /gastos/:id` | 25 | 784 | 31 | 40 | 43 | 0 |
| `GET /gastos/:id` | 50 | 775 | 62 | 88 | 100 | 0 |
| `PUT /gastos/:id/favorito` | 10 | 1079 | 9 | 12 | 13 | 0 |
| `PUT /gastos/:id/favorito` | 25 | 1123 | 21 | 31 | 35 | 0 |
| `PUT /gastos/:id/favorito` | 50 | 1084 | 44 | 61 | 76 | 0 |

**Resultado**: objetivo cumplido en todas las operaciones medidas. Tampoco hubo errores con 50 conexiones.

## Disponibilidad y recuperación (RNF-DIS-10)

Se ejecutó tres veces. Datos de la última corrida en [recuperacion.json](recuperacion.json).

| Escenario | Resultado |
| --- | --- |
| Caída de la base con la API en marcha | `/health` responde 503 en unos 15 ms. Las rutas de negocio responden un 500 genérico, sin detalles internos. |
| Vuelta de la base | PostgreSQL inicia en 0,9 a 1,0 s y la API vuelve a responder unos 50 ms después, **sin reiniciarse**. |
| Caída abrupta durante 150 pagos simultáneos | Se confirmaron 107, 103 y 22 pagos antes de la caída, según la corrida. **Ningún pago confirmado se perdió y ninguno quedó duplicado.** |
| Backup y restauración | `pg_dump` y `pg_restore` tardaron menos de 0,3 s cada uno sobre este volumen de prueba. Las cinco tablas principales quedaron idénticas, comparando cantidad de filas y hash. |

La caída de Pusher y de Firebase se cubre con pruebas automatizadas de la API y los clientes (RNF-DIS-01, RNF-DIS-04, RNF-DIS-06, RNF-DIS-09).

## Pruebas automatizadas

| Proyecto | Tipo | Resultado |
| --- | --- | --- |
| API | Unitarias | 601 aprobadas |
| API | Integración por HTTP con PostgreSQL, incluida concurrencia | 81 aprobadas, en 3 corridas seguidas |
| Web | Unitarias y de componentes | 320 aprobadas |
| Web | Flujos completos en Chrome con API y base reales | 7 aprobados |
| App Flutter | Lógica y widgets | 262 aprobadas |
| App Flutter | Flujo completo en emulador Android con API y base reales | 1 aprobado |

Los flujos completos cubren inicio de sesión, bloqueo por intentos, cierre de todas las sesiones, aprobación y rechazo de gastos compartidos, confirmación y reversión de pagos, y cierre y descarte de la sesión de cuentas en la web. En la app cubren inicio de sesión, aprobación de un gasto compartido y confirmación de su pago.

## Qué no está medido

- Rendimiento y disponibilidad en Vercel y Supabase.
- Restauración de un backup real de producción.
- Entrega de eventos a través de Pusher real: los flujos completos corren sin ese servicio.
- Funcionamiento en iOS.

## Cómo reproducirlas

Requieren PostgreSQL instalado. Desde el repo `api-plataformas-desarrollo`, indicando la carpeta de salida:

```
npm run evidence:load -- <carpeta>
npm run evidence:resilience -- <carpeta>
```

Flujos completos de la web, desde este repo:

```
E2E_API_DIR=<carpeta del repo de la API> npm run test:e2e
```

Flujo completo de la app, con un emulador Android abierto y `npm run start:local` corriendo en el repo de la API:

```
flutter test integration_test/shared_flow_test.dart --dart-define=E2E_API_URL=http://10.0.2.2:3100/api
```
