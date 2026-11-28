# Descripción general del sistema

**Expense Manager** — sistema para registrar y saldar deudas, créditos y gastos personales, organizados por persona o institución, y compartidos con otros usuarios de la plataforma.

Este documento es la puerta de entrada a la documentación: dice qué es el sistema, para qué existe y hasta dónde llega. El detalle de cada comportamiento está en [requerimientos-funcionales.md](requerimientos-funcionales.md), las restricciones de calidad en [requerimientos-no-funcionales.md](requerimientos-no-funcionales.md) y los flujos en [casos-de-uso.md](casos-de-uso.md). Los términos del dominio se definen en el glosario de [README.md](README.md). La misión, la visión y los valores de la organización están en [mision-vision-valores.md](mision-vision-valores.md).

## 1. Descripción

### Problema

Las deudas cotidianas de una persona están dispersas: cuotas de una tarjeta, un préstamo de un familiar, la parte de un gasto que pagó un amigo, una suscripción mensual, plata que le deben a ella. Cada una está en una moneda, en un lugar y con un estado distinto, y al final del mes cuesta saber cuánto se debe, cuánto hay que cobrar y qué ya se pagó. Cuando la deuda es con otra persona, además, cada uno lleva su propia cuenta y las dos versiones divergen.

### Solución

El sistema centraliza esas deudas en un único lugar:

- Cada deuda o crédito es un **gasto** (egreso o ingreso), que pertenece a una **entidad financiera**: una persona, una tarjeta, un banco, un comercio.
- Un gasto puede ser de pago único, en cuotas o fijo (recurrente), en cualquiera de las 36 monedas soportadas: ARS y las 35 extranjeras con cotización en pesos del BCRA (AUD, AWG, BOB, BRL, CAD, CHF, CLP, CNH, CNY, COP, CZK, DKK, EUR, GBP, HKD, ILS, INR, JPY, MXN, NIO, NOK, NZD, PEN, PYG, RSD, RUB, SEK, SGD, TRY, USD, UYU, VES, VND, XDR, ZAR). Quedan fuera `REF` (dólar de referencia) y los metales `XAU` y `XAG`, que el BCRA publica sin cotización en pesos.
- El usuario registra los pagos y cobros cuota por cuota, y el sistema calcula saldos, totales por moneda, equivalencias en su moneda preferida y qué proporción de su sueldo representan sus gastos.
- El **modo hacer cuentas** permite el cierre periódico (típicamente mensual): el usuario marca qué va a pagar o cobrar, y al finalizar la sesión se registran todos los pagos juntos y queda un snapshot inmutable del cierre.
- Una entidad puede **vincularse** con otro usuario de la plataforma. Los gastos de esa entidad se comparten: la contraparte los aprueba o rechaza, y confirma los pagos, de modo que ambos ven la misma deuda. Los cambios se notifican en tiempo real y quedan guardados en el historial de notificaciones.

### Componentes

El sistema está formado por tres proyectos sobre un mismo modelo de datos:

| Proyecto | Tecnología | Rol |
| --- | --- | --- |
| API | Node.js / Express, PostgreSQL | Backend único. Persiste los datos y hace cumplir todas las reglas de negocio. |
| Web | React (SPA) | Cliente para navegador. |
| App móvil | Flutter | Cliente para Android e iOS. |

Ambos clientes ofrecen la misma funcionalidad y solo difieren en lo visual (RNF-CON-01). Servicios externos: Firebase Authentication (contraseñas, verificación del email, recuperación de la contraseña e inicio con Google), Pusher Channels (tiempo real), Pusher Beams con Firebase Cloud Messaging (push en Android) y la API de Estadísticas Cambiarias del BCRA (cotizaciones); qué pasa si alguno falta está en [RNF — POR](requerimientos-no-funcionales.md#por--portabilidad-y-entorno).

### Usuarios

Personas que quieren llevar el control de sus finanzas personales y de sus deudas con terceros. No hay roles: todo usuario registrado tiene las mismas capacidades y solo accede a sus propios datos. Frente a un gasto compartido, un usuario actúa como **contraparte** de otro (ver [Actores](casos-de-uso.md#actores)).

## 2. Objetivos

### Objetivo general

Brindar a cada persona una visión única, actualizada y confiable de lo que debe y de lo que le deben, y facilitar que lo salde de forma ordenada, incluso cuando la deuda es con otro usuario de la plataforma.

### Objetivos específicos

| # | Objetivo | Módulos |
| --- | --- | --- |
| OBJ-01 | Registrar deudas y créditos de cualquier tipo (pago único, en cuotas o fijos), en varias monedas, agrupados por entidad. | [ENT](requerimientos-funcionales.md#ent--entidades-financieras), [GAS](requerimientos-funcionales.md#gas--gastos), [CAT](requerimientos-funcionales.md#cat--categorías) |
| OBJ-02 | Mostrar en todo momento el estado de las finanzas: saldos, cuotas del período y balance por moneda, equivalencias en la moneda preferida y peso de los gastos sobre el sueldo. | [DSH](requerimientos-funcionales.md#dsh--dashboard), [CFG](requerimientos-funcionales.md#cfg--configuración-del-usuario) |
| OBJ-03 | Llevar el seguimiento de pagos y cobros cuota por cuota, con historial completo y posibilidad de revertir. | [PAG](requerimientos-funcionales.md#pag--pagos-y-cobros) |
| OBJ-04 | Facilitar el cierre periódico de cuentas, dejando registro inmutable de cada cierre y un resumen fácil de compartir. | [CTA](requerimientos-funcionales.md#cta--hacer-cuentas) |
| OBJ-05 | Que dos usuarios que se deben dinero compartan una única versión de la deuda, con aprobación de gastos y confirmación de pagos por ambas partes. | [CMP](requerimientos-funcionales.md#cmp--gastos-compartidos), [NOT](requerimientos-funcionales.md#not--notificaciones-en-tiempo-real) |
| OBJ-06 | Ofrecer la misma experiencia funcional en la web y en el celular, con los datos sincronizados entre dispositivos. | [AUT](requerimientos-funcionales.md#aut--autenticación), RNF-CON-01 |

## 3. Alcance

### Incluido

| Módulo | Qué cubre |
| --- | --- |
| AUT — Autenticación | Registro e inicio de sesión con email y contraseña o con Google, sobre una sola cuenta por email; verificación del email por mail antes del primer ingreso y recuperación de la contraseña; sesión persistente; cierre de sesión y expiración. |
| CFG — Configuración | Perfil, moneda preferida, sueldo, tema de la interfaz (claro, oscuro o el del sistema) e idioma (español, inglés o el del sistema). |
| DSH — Dashboard | Gastos activos por entidad, totales y balance por moneda, filtros, equivalencias, gráficos y resumen para WhatsApp. |
| ENT — Entidades | Alta, renombrado, baja lógica, favoritas, detalle con historial, vinculación con otro usuario, gastos eliminados y su restauración, entidades eliminadas y su restauración. |
| GAS — Gastos | Alta (con entidad nueva, gasto espejo o cuotas ya pagas), detalle, edición, baja lógica, postergación, favoritos e historial. |
| PAG — Pagos y cobros | Pago directo o diferido de una cuota, pago en lote por entidad, reversión de cualquier pago, pagos pendientes de confirmación en gastos compartidos. |
| CAT — Categorías | Categorías propias con nombre y color, asignables a los gastos. |
| CTA — Hacer cuentas | Sesión de cierre persistida en el servidor, marcado de gastos, finalización con registro de pagos y snapshot, descarte, historial de cierres con el estado actual de cada pago compartido, y resumen para WhatsApp. |
| CMP — Compartidos | Gastos compartidos recibidos y emitidos: compartir un gasto existente de una entidad vinculada, aprobar, rechazar, reintentar y descartar; confirmar, rechazar o retirar pagos pendientes; pedir, responder o cancelar la reversión de un pago confirmado. |
| NOT — Notificaciones | Campana con historial persistente de actividad (gastos, pagos, ediciones, vínculos y cambios de la otra persona), separada de las acciones pendientes de la sección Compartidos; avisos en tiempo real, actualización automática de las pantallas afectadas y push en la app Android. |

**Plataformas**: navegadores modernos (web) y Android / iOS (app móvil). **Idiomas**: español rioplatense e inglés en ambos clientes, a elección del usuario o según el idioma del navegador o del dispositivo.

### Fuera de alcance

- **Mover dinero.** El sistema registra pagos y cobros, pero no los ejecuta: no se integra con bancos, billeteras ni medios de pago.
- **Importar movimientos.** Los gastos se cargan a mano; no se leen resúmenes de tarjeta ni extractos bancarios.
- **Contabilidad o finanzas de empresas.** Es una herramienta personal: no hay organizaciones, roles, permisos compartidos ni facturación.
- **Uso sin conexión.** Los clientes necesitan la API para operar.
- **Funcionalidad conversada pero no implementada** (imágenes adjuntas, integración con la API de Mercado Pago para ejecutar o conciliar transferencias, entre otras): se listan en [Pendiente / fuera de alcance](requerimientos-funcionales.md#pendiente--fuera-de-alcance) y, con más detalle, en [limitaciones-y-trabajo-futuro.md](limitaciones-y-trabajo-futuro.md#trabajo-futuro). Hasta que se implementen no forman parte del alcance.

### Diferencias y limitaciones actuales

El alcance de arriba describe lo que ofrecen los clientes. Si una función existe en un solo cliente o se cumple solo en parte, el `RF` correspondiente lo aclara. Los incumplimientos conocidos de calidad figuran como *Limitación conocida* en [requerimientos-no-funcionales.md](requerimientos-no-funcionales.md). [limitaciones-y-trabajo-futuro.md](limitaciones-y-trabajo-futuro.md) las reúne con su riesgo, cómo se mitigan hoy y cómo se resolverían.
