# Trabajo práctico N° 6: Conclusiones de QA

**Proyecto:** Expense Manager, plataforma de gestión de deudas y gastos (API Node/Express, web React y app Flutter)

**Módulo crítico:** Pagos y Hacer cuentas (RF-PAG y RF-CTA)

> **Nota sobre los datos.** Los valores salen de los TP 1 a 4. Para este trabajo se midieron dos datos nuevos, el **17/11/2026**: la cobertura del módulo, antes y después de actualizar Vitest de 2.1 a 5.1 en la API (TP 4), y qué requerimientos del alcance del TP 2 tienen pruebas. **El TP 5 tiene el protocolo listo pero las sesiones con usuarios todavía no se hicieron**: no hay tasas de éxito ni puntajes SUS para citar, y las partes de este documento que dependen de ellos están marcadas como `[pendiente TP 5]`.

## 1. Recorrido integrador

| TP | Qué hice en mi proyecto | Qué medí realmente (dato concreto) | Principal aprendizaje |
| --- | --- | --- | --- |
| **TP 1: Pruebas unitarias** | Configuré Vitest en la web, que no tenía ninguna prueba, y escribí 9 pruebas sobre `convertCurrency`, la conversión entre seis monedas | **9/9 pruebas pasando**: 4 de camino feliz y 5 de borde o error | Los casos de borde valían más que los felices: lo que importa de `convertCurrency` es que devuelva `null` y no `NaN` cuando todavía no llegaron las cotizaciones |
| **TP 2: Plan de pruebas** | Plan de pruebas unitarias del módulo Pagos y Hacer cuentas, con 19 requerimientos a validar (8 RF-PAG, 10 RF-CTA y RF-CMP-08) | **19 RF** en el alcance. Meta: **90 % de líneas y 85 % de ramas** por archivo y **100 % de los RF** con un caso normal y uno de error | La API ya tenía 252 pruebas, pero contarlas no decía qué regla de negocio quedaba sin probar: hacía falta pensar el alcance por requerimiento |
| **TP 3: Mantenimiento y regresión** | Plan de mantenimiento con los cuatro tipos y estrategia de regresión: hook de pre-commit, *workflow* de GitHub Actions y umbrales de cobertura en Vitest | **Ninguna medición nueva**: es un plan. Al revisar el módulo encontré una falla real: el mes del snapshot se calcula en UTC (F-01) | Escribir el plan obligó a leer el código con otros ojos, y de esa lectura salió un bug que ninguna de las 252 pruebas detectaba |
| **TP 4: Herramientas de medición** | Ejecuté Lighthouse, ESLint con SonarJS y `npm audit` sobre el sistema real, y corregí 12 de 22 hallazgos | **Lighthouse `/login` (mobile):** rendimiento 68 → 76, SEO 82 → 100, LCP 5,2 → 4,2 s. **Vulnerabilidades de producción:** API 7 → 0, web 12 → 9. **SonarJS:** API 12 → 10, web 38 → 35. | Las herramientas encontraron problemas que las pruebas unitarias no pueden ver por diseño: una librería vulnerable en la validación del token y una web que queda en blanco si falta una variable de entorno |
| **TP 5: Usabilidad** | Protocolo completo: 3 tareas sobre el módulo, datos de prueba fijos, guion, consentimiento, planillas y cuestionario SUS | **Sin datos todavía:** las sesiones con usuarios no se hicieron. `[pendiente TP 5: tasa de éxito por tarea y SUS por grupo]` | Al diseñar los datos de prueba descubrí que no se puede preparar un resumen "del mes pasado", porque el snapshot guarda la fecha de cierre. Tuve que reordenar las tareas antes de probar con nadie |

## 2. Planificado vs. obtenido

### 2.1. Metas de los TP 2 y 3

| Meta (dónde se fijó) | Planificado | Obtenido | ¿Se alcanzó? |
| --- | --- | --- | --- |
| Cobertura de `settlement.service.js` (TP 2) | ≥ 90 % líneas, ≥ 85 % ramas | **81,3 % líneas, 79,0 % ramas** (Vitest 5.1, 17/11/2026). Antes, con Vitest 2.1: 88,6 % y 88,5 % | **No** |
| Cobertura de `pagos-compartidos.service.js` (TP 2) | ≥ 90 % líneas, ≥ 85 % ramas | **95,9 % líneas, 74,0 % ramas**. Antes: 97,2 % y 77,2 % | Líneas sí, **ramas no** |
| Cobertura de `gastos.service.js` (TP 2) | ≥ 90 % líneas, ≥ 85 % ramas | **92,9 % líneas, 81,0 % ramas**. Antes: 89,2 % y 84,2 % | Líneas sí, **ramas no** |
| RF del módulo con al menos un caso normal y uno de error (TP 2) | 19/19 | **9/19 cubiertos** (15/19 con alguna prueba) | **No**: siguen sin pruebas RF-CTA-01 (abrir la sesión de cuentas), RF-CTA-08 (descartarla), RF-CTA-09 (historial y detalle de los resúmenes) y RF-CTA-10 (copiar el resumen como texto) |
| 100 % de las pruebas pasando (criterio de salida del TP 2) | 100 % | **252/252** en la API y **9/9** del TP 1 en la web | Sí |
| Suite en menos de 10 segundos (TP 2) | < 10 s | La suite de la API completa tarda alrededor de **2 s** | Sí |
| Hook de pre-commit, CI con GitHub Actions y umbrales en Vitest (TP 3) | Implementados | **No implementados**: no hay `.github/workflows`, ni Husky, ni `coverage.thresholds` | **No** |
| Corrección del bug del mes del snapshot (TP 3, mantenimiento correctivo) | Prueba que lo reproduce, corrección y script SQL | **Sigue abierto** | **No** |
| Vitest unificado entre la API y la web (TP 3, adaptativo) | Misma versión | **Hecho en el TP 4**: los dos en 5.1 | Sí |

**Por qué no se alcanzaron:**
- **Tiempo.** Cada TP produjo un plan o una medición, pero no se volvió para ejecutar el plan del anterior. Los 4 RF sin pruebas del TP 2 y la integración continua del TP 3 eran tareas concretas de pocas horas, y quedaron escritas pero sin hacer.
- **Complejidad.** `GastosService.update` tiene una complejidad cognitiva de 52 (TP 4, H-08). Sus ramas son las que bajan la cobertura de ramas de `gastos.service.js`, y probar todas las combinaciones de bloqueos de edición con *mocks* lleva mucho armado.
- **Dependencias difíciles de aislar.** Las ramas sin cubrir de `PagosCompartidosService` dependen del estado de dos usuarios a la vez (el pago de uno y la copia del otro). Simularlo con dobles es posible pero frágil.

### 2.2. Lo que no se pudo medir

| Aspecto | Por qué no se midió |
| --- | --- |
| **Usabilidad** | Las sesiones del TP 5 no se hicieron. Es la falta más importante: es la única medición con personas reales. `[pendiente TP 5]` |
| **Rendimiento en producción** | Lighthouse midió el *build* en `localhost`, porque las mejoras no se desplegaron. Los números de Vercel (con CDN y latencia real) pueden ser distintos. |
| **Pantallas con sesión iniciada** | Lighthouse solo midió `/login` y `/register`. El dashboard, que es la pantalla más pesada (gráficos), no se midió porque no tenía una cuenta de prueba con datos para la medición automática. |
| **Base de datos y concurrencia** | Las pruebas simulan los repositories, así que nada prueba el SQL real, las transacciones ni el `SELECT … FOR UPDATE` que evita pagos duplicados al cerrar dos sesiones a la vez (RNF-DIS-08: cerrar la sesión es una sola transacción, y dos cierres simultáneos no pagan dos veces). Tampoco se corrió `EXPLAIN` sobre las consultas. |
| **Carga** | No se simularon usuarios concurrentes (k6 o JMeter). Con un solo usuario de prueba no hay un volumen real que medir. |
| **App Flutter** | No tiene pruebas automatizadas ni se midió con ninguna herramienta. Es la mitad de los clientes del sistema. |

### 2.3. Métricas que medían algo distinto de lo que creía

- **La cobertura depende de la herramienta, no solo de las pruebas.** Con las mismas 252 pruebas, la cobertura de líneas de `settlement.service.js` pasó de **88,6 % a 81,3 %** solo por actualizar Vitest de 2.1 a 5.1. El proveedor `coverage-v8` cambió cómo cuenta las líneas y las ramas. La meta de 90 % del TP 2 estaba fijada sobre una regla de medir que después cambió: un umbral de cobertura solo tiene sentido si se fija la versión de la herramienta.
- **"252/252 pruebas pasando" no decía nada sobre el riesgo.** Las pruebas pasaban mientras el mes del snapshot se calculaba mal (F-01), mientras `jws` tenía una vulnerabilidad alta en la validación del token (F-03) y mientras la web podía quedar en blanco (F-02). Las tres estaban fuera de lo que una prueba unitaria con *mocks* puede ver.
- **Lighthouse dio 100 en accesibilidad, pero solo sobre el login.** Ese 100 dice que dos formularios tienen `label` y buen contraste. No dice nada sobre si una persona mayor encuentra dónde cerrar las cuentas del mes, que es lo que el TP 5 pretende medir.
- **El 100 % de las pruebas pasando dependía del entorno.** En el TP 4, las suites de la web fallaban todas con `Cannot read properties of undefined (reading 'config')` cuando se ejecutaban desde una ruta con la unidad en minúscula (`d:\`), y pasaban desde `D:\`. El resultado de la métrica dependía de la terminal, no del código.

## 3. Aspectos críticos a mejorar en las pruebas

| # | Aspecto | Evidencia (TP) | Qué haría distinto |
| --- | --- | --- | --- |
| A-1 | **No contemplé el tiempo como entrada.** Ninguna prueba del módulo fija la fecha del sistema, así que nada verificaba en qué mes se archiva un cierre. | TP 3: el bug del mes en UTC (F-01) estaba en `finishSession` y las pruebas de cierre pasaban igual | Tratar la fecha como un dato más de cada caso de borde: `vi.setSystemTime` en el último día del mes a las 23:30 y en el primero a las 00:30, en toda regla que guarde o agrupe por fecha |
| A-2 | **Aislé todas las dependencias, incluidas las riesgosas.** Las pruebas simulan los repositories, la transacción y Pusher. Eso las hace rápidas (alrededor de 2 s), pero deja sin probar justo lo que hace correcto al cierre de la sesión: la transacción y el bloqueo `FOR UPDATE`. | TP 2: la persistencia quedó "fuera del plan"; TP 3: las pruebas de integración quedaron como plan del mantenimiento adaptativo | Sumar desde el principio unas pocas pruebas de integración del módulo contra PostgreSQL en Docker (cierre concurrente y *rollback*), aunque sean lentas, separadas de la suite unitaria |
| A-3 | **El plan se escribió pero no se ejecutó.** El TP 2 fijó como meta probar los 19 RF del alcance y el TP 3 diseñó la CI. Ninguna de las dos cosas se hizo después. | TP 2 y la revisión de este TP: RF-CTA-01, 08, 09 y 10 siguen sin pruebas. TP 3: no existe `.github/workflows` | Cerrar cada plan con una tarea concreta y chica en el mismo momento (por ejemplo, escribir las pruebas de `startSession` y `discardSession`, que son cortas) antes de pasar al TP siguiente |
| A-4 | **La cobertura de las pruebas está desbalanceada entre los tres proyectos.** La API tiene 252 pruebas, la web solo prueba funciones puras de `utils/` (TP 1) y la app Flutter no tiene ninguna. | TP 1, TP 4 (RNF-MAN-04, que exige pruebas unitarias en la API y registra como limitación conocida que la web y la app casi no tienen) | Elegir una regla de negocio de cada cliente y probarla en los dos, ya que la regla de paridad obliga a que web y app hagan lo mismo |
| A-5 | **El entorno de pruebas no era confiable.** Las pruebas de la web fallaban según la mayúscula de la unidad de disco, y una actualización a medias de dependencias rompió 17 pruebas de la API que no tenían nada que ver con el cambio. | TP 4 | Correr las pruebas siempre en un entorno limpio (CI con `npm ci`), y no dar por bueno un resultado que solo se obtuvo en la máquina local |
| A-6 | **Las tareas de usabilidad dependían de datos que no se podían preparar.** La primera versión de las tareas pedía consultar "el mes pasado", y el sistema no permite crear un resumen con fecha anterior. | TP 5 (detectado al diseñar, antes del piloto) | Preparar los datos de prueba con el sistema real **antes** de redactar las tareas, no después |

## 4. Fallos críticos detectados

### F-01: El cierre de las cuentas se archiva en el mes equivocado

| Campo | Contenido |
| --- | --- |
| **Descripción del fallo** | Al terminar una sesión de cuentas, el mes del snapshot se calcula con `new Date().toISOString().slice(0, 7)`, que está en UTC. Una sesión cerrada en Argentina (UTC−3) el último día del mes después de las 21:00 queda guardada como del mes siguiente, en el historial y en el resumen que se comparte por WhatsApp. |
| **Detección** | TP 3, revisión de código del módulo al escribir el plan de mantenimiento correctivo. **Ninguna prueba lo detectó.** |
| **Impacto** | **Usuario y datos:** el historial de cuentas, que es el registro del usuario de lo que pagó cada mes, muestra un cierre en el mes que no corresponde. Afecta a los dos clientes, porque el dato lo calcula la API. Gravedad **alta**: es un dato financiero mal clasificado y no avisa. |
| **Causa raíz** | El requerimiento RF-CTA-06 (el resumen que se guarda al terminar la sesión, con el mes, los totales y el detalle) dice "mes" sin decir en qué zona horaria, y el código usó la conversión por defecto de JavaScript. Además, las pruebas no fijan la fecha (A-1), así que el caso de borde nunca se ejecutó. |
| **Resolución / estado** | **Abierto.** El plan está en el TP 3, sección 1.1: calcular el mes en `America/Argentina/Buenos_Aires`, corregir con un script SQL los snapshots ya guardados y aclarar la zona horaria en RF-CTA-06. |
| **Prueba de regresión** | Prueba unitaria de `finishSession` con `vi.setSystemTime(new Date("2026-12-01T02:30:00Z"))` que espera `month: "2026-11"`. Está diseñada en el TP 3 pero **todavía no está escrita**. |

### F-02: La web queda en blanco si falta la clave de Pusher

| Campo | Contenido |
| --- | --- |
| **Descripción del fallo** | Si la variable `VITE_PUSHER_KEY` no está definida, el cliente de Pusher lanza una excepción al cargarse el módulo y React no llega a dibujar nada, ni siquiera el login. |
| **Detección** | TP 4: Lighthouse falló con `NO_FCP` ("la página no dibujó ningún contenido") sobre el *build* local. Con Chrome *headless* encontré el error: `You must pass your app key when you instantiate Pusher`. |
| **Impacto** | **Usuario:** en producción no se manifiesta, porque Vercel tiene la variable. En cualquier entorno nuevo (otra máquina, un *preview*, un docente que clona el repositorio) la aplicación entera es inusable. Gravedad **alta**. Además, incumple RNF-DIS-04: "sin servicio de tiempo real, los clientes siguen funcionando". |
| **Causa raíz** | `src/lib/pusher.js` crea el cliente en el momento de importarse, en lugar de crearlo solo si hay configuración. Un servicio opcional (las notificaciones) se volvió obligatorio para arrancar. |
| **Resolución / estado** | **Abierto**, registrado como limitación conocida de RNF-DIS-04 en la sección de requerimientos no funcionales de la tesis. El plan es crear el cliente solo si la clave existe y que `use-pusher-channel` funcione sin él. |
| **Prueba de regresión** | Una prueba que renderice la aplicación sin la variable y verifique que aparece el formulario de login. Para eso hace falta `jsdom` y Testing Library, que la web todavía no tiene. Mientras tanto, la verificación es la medición de Lighthouse del TP 4. |

### F-03: Dependencia vulnerable en la validación del token de sesión

| Campo | Contenido |
| --- | --- |
| **Descripción del fallo** | La API usaba una versión de `jws`, la librería con la que `jsonwebtoken` verifica la firma del token, que valida mal la firma HMAC. Junto con ella había otras 6 vulnerabilidades en dependencias de producción (1 crítica en `proxy-addr`, altas en `body-parser` y `path-to-regexp`). |
| **Detección** | TP 4: `npm audit --omit=dev` en la API. |
| **Impacto** | **Usuario y datos:** el token es lo único que separa los datos financieros de un usuario de los de otro (RNF-SEG-04: cada usuario solo puede leer y modificar sus propios datos). En el peor caso, un token mal firmado podría aceptarse. Gravedad **alta**. |
| **Causa raíz** | Nadie revisaba las dependencias: no había `npm audit` ni Dependabot, y las vulnerabilidades se fueron acumulando (25 en total en la API). |
| **Resolución / estado** | **Resuelto** en el TP 4: `npm audit fix` en la API y Vitest actualizado a 5.1. Vulnerabilidades de producción: **7 → 0**. Las 252 pruebas siguen pasando. |
| **Prueba de regresión** | `npm audit --omit=dev --audit-level=high` en el *workflow* de CI diseñado en el TP 3, que todavía **no está implementado**. Hasta entonces, depende de correrlo a mano. |

**El riesgo importante que quedó sin probar** es la concurrencia del cierre de la sesión (RNF-DIS-08). Si dos cierres simultáneos pagaran dos veces, sería el fallo más grave posible del módulo. Está protegido por un bloqueo en la base de datos, pero ninguna prueba lo ejercita (A-2).

## 5. Problemas que se pudieron prevenir

| Problema | Práctica que lo hubiera evitado | Etapa en que convenía aplicarla | Mantenimiento que terminó requiriendo y costo de prevenirlo |
| --- | --- | --- | --- |
| **25 vulnerabilidades acumuladas en la API y 18 en la web**, incluida F-03, y `faker` instalado en producción aunque solo lo usa el script de datos de prueba (TP 4) | `npm audit` en CI y Dependabot desde el primer commit, y revisión de `dependencies` vs. `devDependencies` en cada PR | Configuración inicial del proyecto | **Correctivo y adaptativo.** Saltar de Vitest 2.1 a 5.1 de golpe trajo un conflicto de dependencias (`ERESOLVE`), un árbol de `node_modules` roto que hizo fallar 17 pruebas y una reinstalación completa. Prevenirlo cuesta unos minutos: un archivo `dependabot.yml` y una línea en el CI. |
| **Toda la web en un único archivo JavaScript de 1164 KB**, con 229 KiB sin usar en el login y LCP de 5,2 s en mobile (TP 4) | Cargar cada pantalla con `lazy()` al crear las rutas, y medir con Lighthouse cada vez que se agrega una pantalla | Diseño de la estructura de rutas, al comienzo del desarrollo de la web | **Perfectivo:** cambiar `App.jsx` y `AppLayout.jsx` después, y verificar que ninguna pantalla se rompiera. Prevenirlo no costaba nada extra: `lazy()` se escribe igual de rápido que un `import`. |
| **El mes del snapshot en UTC** (F-01) | Requerimientos más precisos (RF-CTA-06 debía decir en qué zona horaria se toma el mes) y pruebas con la fecha fijada | Especificación del requerimiento y escritura de la primera prueba de `finishSession` | **Correctivo**, con corrección de datos en producción (script SQL sobre los snapshots ya guardados). Prevenirlo costaba una frase en el RF y una prueba de cinco líneas. |
| **Complejidad cognitiva de 52 en `GastosService.update`** (TP 4, H-08), que también explica la cobertura de ramas baja | Análisis estático en el editor (SonarQube for IDE o `eslint-plugin-sonarjs`) con el límite de complejidad como advertencia | Durante la codificación, cada vez que se le agregaba una regla de bloqueo a la edición | **Preventivo** (la refactorización a `PagosService` del TP 3), todavía pendiente. Hoy implica mover cientos de líneas cubiertas por pruebas. Prevenirlo costaba separar cada regla en una función en el momento de escribirla. |

## 6. Reflexión final sobre calidad

Al empezar, para mí "calidad" era que el sistema hiciera lo que dicen los requerimientos, y la forma de comprobarlo eran las pruebas: si pasaban, el sistema estaba bien. Después de medirlo, esa idea quedó corta. La API tenía 252 pruebas pasando y, al mismo tiempo, archivaba cierres de cuentas en el mes equivocado, validaba el token de sesión con una librería vulnerable y la web podía quedar en blanco por una variable de entorno faltante. Ninguno de esos tres problemas era un error en la lógica que las pruebas verifican: estaban en el tiempo, en las dependencias y en la configuración, justo donde las pruebas unitarias con *mocks* no miran. Hoy entiendo la calidad como algo que se mide desde varios ángulos a la vez, porque cada herramienta tiene un punto ciego distinto. Y una métrica sin contexto puede engañar: la misma suite dio 88,6 % o 81,3 % de cobertura según la versión de Vitest.

De la norma ISO/IEC 25010, la característica más relevante resultó la **mantenibilidad**, en particular la *capacidad de ser probado* y la *modificabilidad*. El sistema son tres proyectos que deben comportarse igual, y cada regla de negocio que cambia en la API impacta en dos clientes. Cuando una función tiene complejidad 52, como la edición de gastos, cada cambio es un riesgo y probarla bien es caro: eso se vio en la cobertura de ramas, que no llegó a la meta en ninguno de los tres archivos del módulo. La seguridad quedó en segundo lugar: en un sistema de finanzas personales, que un usuario vea los datos de otro es el peor escenario, y el TP 4 mostró que ese riesgo estaba en una dependencia que nadie revisaba.

Si empezara la tesis de nuevo, lo primero que mediría sería `npm audit` y el análisis estático, desde el primer commit y en cada cambio, porque son baratos y automáticos. Después agregaría las pruebas del módulo de pagos fijando la fecha y una prueba de integración del cierre de sesión contra una base real, antes de construir más pantallas encima. Y haría una prueba de usabilidad corta con una o dos personas apenas el flujo de "Hacer cuentas" funcionara, porque es el concepto menos convencional del sistema (marcar no es pagar) y nunca lo validé con alguien ajeno al proyecto.

Hasta la presentación final voy a sostener cuatro acciones concretas:
- **Las sesiones de usabilidad del TP 5**, con al menos un participante por grupo etario.
- **El *workflow* de CI del TP 3**, con lint, pruebas, cobertura con versión fija de la herramienta y `npm audit`, como requisito para integrar cambios.
- **La corrección de F-01 y F-02**, cada una con su prueba de regresión.
- **Las pruebas de los 4 RF del módulo que siguen sin cubrir.**

Antes de la defensa, una última corrida de Lighthouse, SonarJS y `npm audit` sobre la versión desplegada va a reemplazar los números de este trabajo.

## 7. Integración en la tesis

Esta sección cierra el capítulo de **Verificación y Validación** de la memoria, después de:
1. las pruebas unitarias (TP 1, `tp1.md`);
2. el plan de pruebas (TP 2, `tp2.md`);
3. el plan de mantenimiento (TP 3, `tp3.md`);
4. la medición de calidad (TP 4, `tp4.md`, con las capturas en `tp4/`);
5. la prueba de usabilidad (TP 5, `tp5.md`).

Cuando se hagan las sesiones del TP 5, se actualizan en este documento:
- la fila del TP 5 de la sección 1;
- la sección 2.2;
- el aspecto A-6, con lo que muestre el piloto;
- cualquier fallo crítico que aparezca, como F-04 en adelante.
