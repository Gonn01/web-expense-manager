# Plan de mantenimiento y pruebas continuas: módulo de Pagos y Hacer cuentas

**Proyecto:** Plataforma de Gestión de Deudas (API Node/Express, cliente web React y app Flutter)

**Módulo crítico:** Pagos y Hacer cuentas (requerimientos RF-PAG y RF-CTA), el mismo del plan de pruebas del TP2. En la API lo implementan `SettlementService` (`services/settlement.service.js`), los métodos de pago de `GastosService` (`services/gastos.service.js`) y `PagosCompartidosService` (`services/pagos-compartidos.service.js`). Es el módulo que registra dinero: marca los gastos en una sesión de cuentas, registra los pagos al cerrarla, confirma los pagos compartidos entre dos usuarios y guarda un *snapshot* con los totales.

## 1. Plan de mantenimiento del módulo crítico

### 1.1. Mantenimiento correctivo

**Falla identificada.** Al cerrar una sesión de cuentas, el mes del snapshot se calcula así:

```js
const finishedAt = new Date();
const month = finishedAt.toISOString().slice(0, 7);
```

`toISOString()` devuelve la fecha en **UTC**, mientras que los usuarios están en Argentina (UTC−3). Una sesión que se cierra el 30 de noviembre a las 22:00 corresponde, en UTC, al 1 de diciembre a la 01:00. Por eso el snapshot queda guardado como "Diciembre 2026". Las dos apps muestran ese mes en el historial de cuentas y en el resumen que se comparte por WhatsApp. Es una falla de negocio: el usuario cierra "las cuentas de noviembre" y el sistema las archiva en otro mes.

**Registro del bug.** Se usa **GitHub Issues** en el repositorio de la API, donde vive la regla:
- **Plantilla `bug_report.md`:** pasos para reproducir, resultado esperado y obtenido, requerimiento afectado (RF-CTA-06: al terminar la sesión se guarda un resumen con el mes, los totales por moneda y el detalle de cada gasto pagado), plataforma y captura.
- **Etiquetas:** `bug`, `módulo:cuentas` y `severidad:alta`.
- **Tablero:** el issue se agrega a un tablero de GitHub Projects con las columnas *Por hacer → En curso → En revisión → Hecho*. Si el bug lo reporta un usuario desde la web o la app, se crea un issue con el mismo formato y se vincula.

**Flujo de corrección sin afectar el entorno productivo:**
1. **Rama aislada.** Se crea `fix/<n°-issue>-mes-snapshot-utc` desde `master`. Producción sigue con la versión anterior mientras dura la corrección.
2. **Prueba que reproduce el bug primero.** Se escribe una prueba que falla con el código actual: fija la hora con `vi.setSystemTime` en el último día del mes a las 23:30 de Argentina y espera el mes correcto.
3. **Corrección mínima.** El mes se calcula en la zona `America/Argentina/Buenos_Aires`, con `Intl.DateTimeFormat` o con `dayjs` y sus plugins `utc` y `timezone` (`dayjs` ya es dependencia de la API). No se toca nada más del cierre.
4. **Regresión completa.** Se corre toda la suite (`npm test`) y la cobertura del módulo (`npm run test:coverage`). Se revisa que no fallen las pruebas de cierre de sesión que ya existían.
5. **Corrección de datos.** Los snapshots que ya se guardaron con el mes equivocado se corrigen con un script SQL versionado en `migrations/manual/<fecha>_snapshot_month_tz.sql`. El script recalcula `month` a partir de `finished_at` en la zona de Argentina. Primero se prueba contra una copia de la base y después se ejecuta en producción, antes de desplegar el código.
6. **Pull request** que referencia el issue (`Closes #n`). Para hacer el *merge*, tienen que pasar la integración continua (sección 2.1) y la revisión de código. Al hacer el *merge*, el issue se cierra solo.
7. **Despliegue y verificación.** Después del despliegue se cierra una sesión de prueba con un usuario de test y se comprueba el mes en el historial. Si algo falla, se revierte el *merge* (`git revert`), que vuelve a la versión anterior sin perder historial.
8. **Documentación.** Se actualiza RF-CTA-06 en la sección de requerimientos funcionales de la tesis para indicar que el mes se toma en la hora de Argentina.

### 1.2. Mantenimiento adaptativo

**Cambio en el entorno:** actualización mayor de **PostgreSQL** en Supabase, por ejemplo de la versión 15 a la 17, o un cambio en su *connection pooler*. Supabase actualiza sus proyectos periódicamente, y el módulo es el más sensible a la base de datos:
- **Transacciones:** cerrar una sesión hace muchas escrituras en una sola transacción (RNF-INT-06: toda operación que escribe más de una fila se ejecuta en una transacción, así una falla a mitad de camino no deja nada a medias).
- **Bloqueos:** bloquea la sesión con `SELECT … FOR UPDATE` para que dos cierres simultáneos no generen pagos cruzados (RF-PAG-08: en un gasto compartido, el pago queda pendiente hasta que la otra persona lo confirma).
- **JSON:** guarda los totales y los ítems del snapshot como JSON.
- **Pooler:** la conexión ya depende de opciones específicas del pooler en modo transacción (`prepare: false`, `idle_timeout`, `max_lifetime` en `db.js`).

Un cambio de versión o de pooler puede romper cualquiera de esas piezas sin que las pruebas unitarias lo noten, porque las pruebas simulan los repositories.

**Preparación del módulo:**
- **El SQL ya está aislado.** Está solo en los repositories (`settlement.repository.js`, `gastos.repository.js`), y los services no lo conocen (RNF-MAN-01: la API respeta la separación en capas y la lógica de negocio vive solo en los services). El cambio se limita a esa capa y a `db.js`.
- **Se suman pruebas de integración** de los repositories del módulo, contra un PostgreSQL real levantado en **Docker** con la versión de destino (`postgres:17`). Esas pruebas cubren:
  - el `FOR UPDATE` con dos cierres concurrentes;
  - el *rollback* completo si falla una escritura a mitad del cierre;
  - la lectura y escritura del JSON del snapshot;
  - el cálculo del número de cuota.

  Se corren con el mismo Vitest en un archivo separado (`tests/integration/*.test.js`), con un script propio (`npm run test:integration`), para no hacer más lenta la suite unitaria.
- **Ensayo en un entorno aislado.** Supabase permite crear un *branch* de la base o un proyecto de *staging*. Ahí se restaura una copia de los datos, se aplica la actualización y se corren las pruebas de integración y una sesión de cuentas completa desde la web, antes de aceptar la actualización en producción.
### 1.3. Mantenimiento perfectivo

**Mejora propuesta: vista previa del cierre de la sesión.**

**Problema detectado por los usuarios.** Hoy, al tocar "Terminar", el sistema registra los pagos y en el mismo paso descarta en silencio los gastos que ya no se pueden pagar: los que se eliminaron, se postergaron, se saldaron o tienen las cuotas cubiertas por pagos pendientes (RF-CTA-05: al terminar la sesión se registra un pago por cada gasto marcado y se descartan los que ya no se pueden pagar). El usuario se entera de qué se pagó recién al ver el snapshot. En un uso real eso genera dudas como "¿por qué no se pagó el gasto de Juan?", y obliga a revisar el historial.

**Mejora:**
- **Nuevo endpoint** `GET /settlement/preview`. Calcula lo mismo que el cierre (qué se paga, qué se descarta y por qué, y los totales por moneda) sin escribir nada. Reutiliza la lógica de `effectSettlementBatch` en un modo de solo lectura.
- **Pantalla de confirmación en los dos clientes.** Muestra los totales y, en otro color, los gastos que se van a descartar con su motivo, antes de confirmar el cierre.

### 1.4. Mantenimiento preventivo

**Aspecto técnico identificado: `gastos.service.js` concentra demasiadas responsabilidades.** Tiene 1119 líneas, la mitad de todo el código de services de la API (2200 líneas). Mezcla en una sola clase:
- el ABM de gastos;
- los bloqueos de edición (`#computeEditLocks`);
- la postergación;
- el pago directo y el diferido (`settleQuota`, `settleQuotasLote`);
- el pago en lote del cierre de la sesión (`effectSettlementBatch`);
- la reversión de pagos (`revertirPago`).

Desde el punto de vista de **ISO/IEC 25010**, afecta tres subcaracterísticas de la **mantenibilidad**:
- **Analizabilidad:** cuesta encontrar dónde vive una regla de pago.
- **Modificabilidad:** un cambio en la edición de gastos puede romper un pago.
- **Capacidad de ser probado:** las pruebas de pagos tienen que armar todos los dobles de `GastosService`, aunque no los usen.

**Acciones preventivas:**
1. **Refactorización guiada por las pruebas.** Se extrae un `PagosService` (`services/pagos.service.js`) con `settleQuota`, `settleQuotasLote`, `effectSettlementBatch` y `revertirPago`, y su factory, siguiendo la estructura de capas de la API.
   - `GastosService` se queda con el ABM, los bloqueos y la postergación.
   - `SettlementService` pasa a depender de `PagosService`.
   - Las firmas públicas y las respuestas HTTP no cambian, así que los clientes no se enteran.
   - Antes de mover nada, se completan las pruebas que todavía le faltan al módulo. Así las pruebas actúan como red de seguridad: si la salida de algún método cambia con la refactorización, una prueba falla.
2. **Límite de complejidad en el linter.** Se agrega `eslint-plugin-sonarjs` en la API, con `sonarjs/cognitive-complexity` y `max-lines` como advertencia. Así ningún service vuelve a crecer sin que se note.

## 2. Estrategia de pruebas en la fase de mantenimiento (pruebas de regresión)

### 2.1. Automatización e integración

Las pruebas unitarias del TP1 (web) y del TP2 (API, módulo de cuentas) se ejecutan automáticamente en tres momentos. Cada uno tiene un costo distinto, de lo más rápido a lo más completo:

| Momento | Qué se ejecuta | Herramienta | Objetivo |
| --- | --- | --- | --- |
| **Antes de cada commit** | ESLint y Prettier sobre los archivos modificados, y las pruebas relacionadas con esos archivos (`vitest related --run`) | Hooks de Git con **Husky** + **lint-staged** | Feedback en segundos, sin frenar al desarrollador |
| **En cada push y pull request a `master`** | `npm ci`, `npm run lint`, la suite completa con cobertura (`npm run test:coverage`) y, en la API, las pruebas de integración contra PostgreSQL en un contenedor de servicio | **GitHub Actions**, un *workflow* por repositorio | Bloquear el *merge* si algo falla (*branch protection*: el check es obligatorio) |
| **Programado, una vez por semana** | La misma suite, más `npm audit` y la revisión de dependencias | GitHub Actions con `schedule` (cron) + **Dependabot** | Detectar roturas que no vienen del código propio: dependencias nuevas o vulnerabilidades publicadas |

**Política de regresión.** Todo bug corregido (mantenimiento correctivo) deja una prueba que lo reproduce y que queda para siempre en la suite. Así, el mismo error no puede volver sin que falle el CI.

### 2.2. Criterios de calidad y mantenibilidad

**Cobertura mínima para aprobar un cambio:**
- **Archivos del módulo crítico** (`settlement.service.js`, `pagos-compartidos.service.js`, `gastos.service.js`, o el futuro `pagos.service.js`): al menos **90 % de líneas y 85 % de ramas**, los mismos umbrales del TP2.
- **Resto de la API:** al menos **80 % de líneas**.
- **Funciones de `src/utils/` de la web que tengan pruebas:** **100 %**.

**Herramientas de análisis estático:**

| Herramienta | Qué detecta | Dónde corre |
| --- | --- | --- |
| **ESLint** (ya configurado en la web y en la API) + `eslint-plugin-sonarjs` | Errores de código, malas prácticas, complejidad cognitiva excesiva, código duplicado dentro de un archivo | Hook de pre-commit y CI |
| **Prettier** (ya configurado en la web) | Formato inconsistente, que ensucia los *diffs* de las revisiones | Hook de pre-commit |
| **SonarCloud** (gratuito para repositorios públicos) | Deuda técnica (*code smells*), código duplicado entre archivos, *security hotspots* y cobertura del código nuevo. Su *quality gate* comenta en cada pull request | CI, en cada pull request |
| **`npm audit` + Dependabot** | Vulnerabilidades conocidas en las dependencias | CI semanal y PRs automáticos de Dependabot |
| **GitHub CodeQL** | Vulnerabilidades en el código propio (inyección, datos sin validar) | CI, en cada push a `master` |
| **`flutter analyze`** (ya usado en la app) | Errores y advertencias del analizador de Dart | CI de la app |

Ningún mantenimiento se despliega si el CI no está en verde, si la *quality gate* de SonarCloud falla o si hay vulnerabilidades de severidad alta sin resolver.

## 3. Matriz unificada de mantenimiento y testing

| Tipo de mantenimiento | Escenario / cambio planteado | Pruebas a ejecutar / diseñar | Herramientas / estrategia de verificación |
| --- | --- | --- | --- |
| **Correctivo** | El mes del snapshot se calcula en UTC: una sesión cerrada el último día del mes después de las 21:00 (hora de Argentina) se archiva en el mes siguiente (RF-CTA-06, el resumen guardado al terminar la sesión). | Prueba unitaria del caso de borde con la hora fijada (`vi.setSystemTime` en el último día del mes a las 23:30 de Argentina, y también el primer día a las 00:30) que falla antes de la corrección. Después, regresión completa del módulo y verificación del script SQL que corrige los snapshots ya guardados contra una copia de la base. | Vitest + GitHub Issues (plantilla de bug, etiquetas de severidad y módulo) + rama `fix/…` + pull request con CI obligatorio + `git revert` como plan de vuelta atrás. |
| **Adaptativo** | Actualización de PostgreSQL 15 → 17 en Supabase o cambio del *connection pooler*, que puede afectar transacciones, `SELECT … FOR UPDATE` y columnas JSON del cierre de sesión. | Pruebas de integración de los repositories del módulo contra la versión nueva de PostgreSQL: cierre concurrente de dos sesiones, *rollback* ante una falla a mitad del cierre y lectura del JSON del snapshot. Además, la suite unitaria completa como regresión. | Docker (`postgres:17`) como contenedor de servicio en GitHub Actions + *branch* de base de Supabase como entorno aislado de *staging* con una copia de los datos. |
| **Perfectivo** | Vista previa del cierre de la sesión (`GET /settlement/preview`): qué se va a pagar, qué se descarta y por qué, y los totales por moneda, sin registrar nada. | Pruebas unitarias del endpoint: que la vista previa coincide con lo que después registra el cierre real y que **no** escribe en la base. Prueba de rendimiento: con 200 gastos marcados, la cantidad de consultas al repository es fija (RNF-REN-05: las operaciones sobre varios gastos de una sesión usan una cantidad fija de consultas a la base, no una por gasto) y el cálculo con dobles termina por debajo de un tiempo límite. | Vitest (espías `vi.fn()` para contar consultas) + `vitest bench` para la medición de tiempo + pruebas en la web y en la app Flutter (paridad). |
| **Preventivo** | Extraer `PagosService` de `gastos.service.js` (1119 líneas), que mezcla el ABM, los bloqueos de edición, los pagos y el cierre de la sesión. | Antes de mover código, completar las pruebas que le faltan al módulo. Después, regresión: las mismas pruebas tienen que pasar sin cambios en los resultados esperados, solo en cómo se construye el service. | ESLint + `eslint-plugin-sonarjs` (complejidad cognitiva, `max-lines`) + SonarCloud (duplicación y deuda técnica) + revisión de código en el pull request + umbrales de cobertura de Vitest. |
