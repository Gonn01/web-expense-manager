# Trabajo práctico N° 5: Pruebas de usabilidad con usuarios reales

> **Estado del documento.** El protocolo, las tareas, el guion, el consentimiento, las planillas y el cuestionario están listos para usar. Todo lo marcado como **`[completar]`** sale de las sesiones con los participantes y se completa después de hacerlas: resultados, tiempos, citas, puntajes SUS, hallazgos y tickets. No se completa con datos estimados.

## 1. Ficha del protocolo

### 1.1. Sistema testeado

| | |
| --- | --- |
| **Sistema** | Expense Manager: plataforma de gestión de deudas y gastos personales |
| **Plataforma** | Web (responsive). Se prueba en el **celular del participante** si lo acepta, o en una notebook del evaluador |
| **URL / versión** | https://web-plataformas-de-desarrollo.vercel.app, commit `[completar]` desplegado el `[completar fecha]` |
| **Módulo evaluado** | **Pagos y Hacer cuentas** (RF-PAG y RF-CTA), el módulo crítico de los TP 2 a 4: marcar qué gastos se pagaron en el mes, cerrar las cuentas y consultar el resumen guardado |
| **Modalidad** | Presencial `[o videollamada con pantalla compartida: completar]`. Con autorización, se graba pantalla y voz |
| **Evaluador** | `[completar]`. Una sola persona hace de observador y registra en la planilla |

**Datos de prueba.** Los participantes **no usan sus propias finanzas**. Antes de cada sesión, el evaluador crea una cuenta de prueba nueva para ese participante (`usabilidad.u1@…`, `usabilidad.u2@…`) y carga los mismos datos en todas, así las sesiones son comparables y ningún participante ve lo que hizo otro. La sesión empieza con esa cuenta ya iniciada en el dashboard.

| Entidad | Gasto | Tipo | Modalidad | Moneda | Estado inicial |
| --- | --- | --- | --- | --- | --- |
| Tarjeta Visa | Heladera | Egreso | 12 cuotas de $ 45.000 | ARS | 4 cuotas pagas (la última, registrada por error para la T3) |
| Tarjeta Visa | Celular | Egreso | 6 cuotas de $ 60.000 | ARS | 2 cuotas pagas |
| Alquiler | Alquiler depto | Egreso | Gasto fijo de $ 350.000 | ARS | — |
| Juan | Préstamo a Juan | Ingreso | 4 cuotas de US$ 100 | USD | 1 cuota cobrada |
| Gimnasio | Cuota gimnasio | Egreso | Gasto fijo de $ 28.000 | ARS | — |

Además, la cuenta tiene **una sesión de cuentas ya cerrada** para la T1, que el evaluador hace al preparar la cuenta: marca **Alquiler depto, Cuota gimnasio y Préstamo a Juan** y la termina. Ese resumen queda con **$ 378.000 de egresos en pesos** (350.000 + 28.000) y **US$ 100 de ingresos en dólares**. El préstamo a Juan queda con 1 cuota cobrada gracias a esa sesión. No hay ninguna sesión abierta al empezar.

Un resumen guarda la fecha en que se cerró, así que no se puede preparar uno "del mes pasado". Por eso la tarea de consulta va **primero**: en ese momento, ese resumen es el único cerrado.

### 1.2. Tareas orientadas a objetivos

Las tareas se leen tal cual, sin nombrar botones, menús, colores ni ubicaciones. Cada una se entrega también impresa.

| Tarea | Escenario (como se lo leerás al usuario) | Criterio de éxito | Tiempo máximo |
| --- | --- | --- | --- |
| **T1** | "Un familiar te pregunta cuánto pagaste en total, en pesos, la última vez que hiciste las cuentas en la aplicación. Buscá ese dato y decímelo en voz alta." | Abre el resumen de la sesión cerrada y dice **$ 378.000** como total de egresos en pesos. Es fracaso si da el total en dólares o un número de otra pantalla. | 3 minutos |
| **T2** | "Es fin de mes. Este mes pagaste la cuota del celular y el alquiler, y Juan te devolvió la parte del préstamo que te tocaba cobrar. Dejá registrado en la aplicación todo lo que se pagó y se cobró este mes, y dalo por cerrado." | Existe una nueva sesión de cuentas **cerrada** que incluye exactamente **Celular, Alquiler depto y Préstamo a Juan**, sin otros gastos. Es fracaso si quedan marcados pero la sesión sigue abierta, o si se paga algún otro gasto. | 5 minutos |
| **T3** | "Revisando tus papeles, te das cuenta de que la última cuota que figura pagada de la heladera en realidad no la pagaste: se cargó por error. Corregilo para que la aplicación muestre lo que de verdad pagaste." | La heladera vuelve a mostrar **3 cuotas pagas de 12**, y no se eliminó el gasto ni se tocó ningún otro. | 4 minutos |

### 1.3. Prueba piloto

Antes de las sesiones reales, el protocolo completo se ensaya con una persona cualquiera, que no cuenta en los resultados.

| Qué se verifica en el piloto | Resultado del piloto | Ajuste realizado |
| --- | --- | --- |
| ¿Se entiende cada escenario sin pedir aclaraciones? | `[completar]` | `[completar]` |
| ¿Los tiempos máximos son razonables? (si el piloto tarda más de la mitad del máximo en una tarea sin trabarse, el máximo es corto) | `[completar]` | `[completar]` |
| ¿Los datos de prueba permiten completar las tres tareas? (por ejemplo, que la T1 tenga un resumen cerrado para consultar) | `[completar]` | `[completar]` |
| ¿Funcionan la grabación, el cronómetro y la conexión en el dispositivo elegido? | `[completar]` | `[completar]` |
| ¿Cuánto tarda la sesión completa? (objetivo: menos de 30 minutos) | `[completar]` | `[completar]` |

### 1.4. Guion de la sesión

El guion completo, el consentimiento y las instrucciones de *Think Aloud* están en el [Anexo A](#anexo-a-guion-de-la-sesión-y-consentimiento). Se leen textualmente a cada participante.

## 2. Ejecución del test (Think Aloud)

- **Modalidad:** `[completar: presencial / videollamada]`. La pantalla y la voz se graban solo si el participante lo autoriza en el consentimiento.
- **Verbalización:** se le pide al participante que diga en voz alta lo que piensa. Solo se usan las preguntas neutras del Anexo A.
- **Rol del evaluador:** solo observa. No ayuda, no corrige, no explica ni da pistas.
  - Si el participante se traba, se registra como **fricción**.
  - Si abandona o supera el tiempo máximo, se registra como **falla** y se pasa a la tarea siguiente.
- **Registro:** una planilla por participante (Anexo B), con resultado, tiempo, errores, pedidos de ayuda y citas textuales.

**Escala de resultados**

| Resultado | Definición |
| --- | --- |
| Éxito directo | Completa la tarea dentro del tiempo máximo, sin errores ni dudas significativas. |
| Éxito con dificultad | Completa la tarea, pero con errores, rodeos, retrocesos o dudas visibles. |
| Falla | No completa la tarea, abandona o supera el tiempo máximo. |

## 3. Métrica de cierre (SUS simplificado)

Al terminar las tres tareas, el participante puntúa de **1 a 5** (1 = Muy en desacuerdo; 5 = Muy de acuerdo):

1. Sentí que la aplicación fue fácil de usar.
2. Necesitaría ayuda técnica para poder usar esta plataforma.
3. Sentí que la información y los pasos estaban claros.

**Cálculo por participante:** `(P1 + (6 − P2) + P3) / 3`. La afirmación 2 se invierte porque está redactada en negativo.

**Preguntas abiertas:** "¿Qué fue lo que más te costó?" y "¿Qué cambiarías?". Las respuestas están en el Anexo C.

## 4. Matriz de usuarios y resultados

| ID | Grupo y edad | Familiaridad tecnológica | Tarea 1 | Tarea 2 | Tarea 3 | SUS |
| --- | --- | --- | --- | --- | --- | --- |
| U1 | Grupo A (`[edad]` años) | `[Baja/Media/Alta]` | `[resultado (m:ss)]` | `[resultado (m:ss)]` | `[resultado (m:ss)]` | `[x,x]` |
| U2 | Grupo B (`[edad]` años) | `[Baja/Media/Alta]` | `[completar]` | `[completar]` | `[completar]` | `[x,x]` |
| U3 | Grupo C (`[edad]` años) | `[Baja/Media/Alta]` | `[completar]` | `[completar]` | `[completar]` | `[x,x]` |
| U4 *(opcional)* | `[completar]` | `[completar]` | `[completar]` | `[completar]` | `[completar]` | `[x,x]` |
| U5 *(opcional)* | `[completar]` | `[completar]` | `[completar]` | `[completar]` | `[completar]` | `[x,x]` |

**Resumen**

| Métrica | T1 | T2 | T3 |
| --- | --- | --- | --- |
| Tasa de éxito (éxito directo + éxito con dificultad / participantes) | `[n/N]` | `[n/N]` | `[n/N]` |
| Tiempo promedio (solo de quienes completaron la tarea) | `[m:ss]` | `[m:ss]` | `[m:ss]` |

| Grupo | Promedio SUS |
| --- | --- |
| A (16 a 25) | `[x,x]` |
| B (35 a 55) | `[x,x]` |
| C (65 o más) | `[x,x]` |

## 5. Hallazgos clave por grupo

### 5.1. Patrones por grupo etario

`[completar después de las sesiones]`. Para cada patrón: qué grupo lo mostró y qué grupo no, con evidencia (cita textual, tiempo o error observado).

### 5.2. Supuestos del equipo que fallaron

`[completar después de las sesiones]`. Al menos 2 supuestos que el equipo tenía como programador y que la prueba desmintió, explicando por qué no se habían detectado antes.

### 5.3. Vinculación con la calidad (ISO/IEC 25010)

| Hallazgo | Grupo(s) | Subcaracterística de usabilidad |
| --- | --- | --- |
| `[completar]` | `[completar]` | `[capacidad para reconocer su adecuación / capacidad de aprendizaje / operabilidad / protección contra errores de usuario / estética de la interfaz / accesibilidad]` |

## 6. Backlog de correcciones QA

Se redactan **al menos 4 tickets**, uno por cada problema observado. Cada uno usa esta plantilla:

| Campo | UX-01 |
| --- | --- |
| **ID / Título** | `[completar]` |
| **Severidad** | `[Crítico / Mayor / Menor]` |
| **Descripción y evidencia** | `[qué se observó, en qué tarea, qué usuario(s), cita o tiempo]` |
| **Propuesta** | `[solución con valor verificable]` |
| **Tipo de mantenimiento** | `[correctivo / adaptativo / perfectivo / preventivo]` |
| **Criterio de aceptación** | `[cómo se verifica]` |

Escala de severidad:
- **Crítico:** impide completar una tarea o bloquea a más de un usuario.
- **Mayor:** la tarea se completa con errores, demoras o frustración significativa.
- **Menor:** molestia que no afecta el resultado.

---

## Anexo A: Guion de la sesión y consentimiento

### A.1. Bienvenida (se lee textualmente)

> "Hola, gracias por venir. Te cuento cómo va a ser esto. Estoy evaluando una aplicación para llevar las cuentas de deudas y gastos personales, que es parte de mi trabajo final. Lo que quiero ver es **si la aplicación es fácil de usar, no evaluarte a vos**: si algo te cuesta, es un problema de la aplicación y me sirve muchísimo saberlo. No hay respuestas correctas ni incorrectas.
>
> Te voy a leer tres situaciones, una por vez, y te voy a pedir que hagas en la aplicación lo que harías en tu vida real. La cuenta que vas a usar es de prueba, con datos inventados: no tenés que poner nada tuyo.
>
> La sesión dura unos 30 minutos."

### A.2. Consentimiento informado (se lee y se firma antes de empezar)

> **Consentimiento para participar en una prueba de usabilidad**
>
> - **Objetivo:** evaluar la facilidad de uso de la aplicación Expense Manager como parte de un trabajo final de carrera. Se evalúa la aplicación, no a la persona.
> - **Qué voy a hacer:** realizar tres tareas en la aplicación con una cuenta de prueba, pensar en voz alta mientras las hago y responder un cuestionario corto.
> - **Grabación:** ☐ Autorizo ☐ No autorizo que se grabe la pantalla y mi voz. La grabación se usa solo para revisar la sesión, no se publica, no se adjunta al informe y se borra al aprobarse el trabajo.
> - **Anonimato:** en el informe se me identifica solo con un código (U1, U2…). No se publican mi nombre ni mis datos personales. Sí se registran mi edad, el dispositivo usado y cuánto uso aplicaciones parecidas.
> - **Derecho a abandonar:** puedo dejar la prueba en cualquier momento, sin dar explicaciones, y pedir que no se usen mis datos.
>
> Código asignado: ______  Fecha: ______  Firma: ______________________

### A.3. Instrucciones de Think Aloud (se leen textualmente)

> "Mientras hacés cada tarea, te pido que **digas en voz alta todo lo que vas pensando**: qué estás buscando, qué esperás que pase, qué te confunde. Por ejemplo: 'Busco dónde están los pagos… creo que es esto… no, esto no era'.
>
> Yo no te voy a poder ayudar ni contestar cómo se hace algo, porque necesito ver cómo te manejarías solo o sola. Si en algún momento sentís que no podés seguir, decime 'paso' y vamos a la siguiente. Si te quedás en silencio, te voy a recordar que me cuentes qué estás pensando."

### A.4. Preguntas neutras permitidas (las únicas que puede usar el evaluador)

- "¿Qué estás buscando?"
- "¿Qué esperás que pase si tocás ahí?"
- "¿Qué estás pensando ahora?"
- "Contame qué ves en esta pantalla."
- Si el participante pregunta cómo se hace algo: "¿Vos cómo lo harías?"

### A.5. Cierre (se lee textualmente)

> "Terminamos con las tareas. Ahora te voy a pedir que puntúes tres frases del 1 al 5, donde 1 es 'muy en desacuerdo' y 5 'muy de acuerdo'. Después te hago dos preguntas abiertas. Gracias de nuevo: todo lo que te costó es justamente lo que tengo que mejorar."

## Anexo B: Planillas de observación

Una planilla por participante. El tiempo se toma desde que se termina de leer el escenario hasta que se cumple el criterio de éxito, el participante abandona o se supera el máximo.

### Participante U`[n]`

| Dato | Valor |
| --- | --- |
| Grupo / edad | `[completar]` |
| Dispositivo (marca, sistema, navegador; propio o prestado) | `[completar]` |
| Familiaridad tecnológica (Baja / Media / Alta, según cuánto usa apps de bancos, billeteras virtuales o similares) | `[completar]` |
| Tema de la interfaz (claro / oscuro) | `[completar]` |
| Grabación autorizada | `[Sí / No]` |
| Fecha y modalidad | `[completar]` |

| Tarea | Resultado | Tiempo | Errores (cantidad y cuáles) | Pedidos de ayuda | Fricciones observadas | Citas textuales |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | `[completar]` | `[m:ss]` | `[completar]` | `[completar]` | `[completar]` | `[completar]` |
| T2 | `[completar]` | `[m:ss]` | `[completar]` | `[completar]` | `[completar]` | `[completar]` |
| T3 | `[completar]` | `[m:ss]` | `[completar]` | `[completar]` | `[completar]` | `[completar]` |

*Copiar esta planilla para U1, U2, U3 (y U4, U5 si se suman).*

## Anexo C: Respuestas del cuestionario

| ID | P1: fácil de usar | P2: necesitaría ayuda técnica | P3: información y pasos claros | SUS = (P1 + (6 − P2) + P3) / 3 | ¿Qué fue lo que más te costó? | ¿Qué cambiarías? |
| --- | --- | --- | --- | --- | --- | --- |
| U1 | `[1-5]` | `[1-5]` | `[1-5]` | `[x,x]` | `[completar]` | `[completar]` |
| U2 | `[1-5]` | `[1-5]` | `[1-5]` | `[x,x]` | `[completar]` | `[completar]` |
| U3 | `[1-5]` | `[1-5]` | `[1-5]` | `[x,x]` | `[completar]` | `[completar]` |
| U4 | `[1-5]` | `[1-5]` | `[1-5]` | `[x,x]` | `[completar]` | `[completar]` |
| U5 | `[1-5]` | `[1-5]` | `[1-5]` | `[x,x]` | `[completar]` | `[completar]` |
