# Requerimientos funcionales

Describen **qué hace** el sistema. Aplican por igual a la web y a la app móvil salvo que se indique lo contrario; la API es quien hace cumplir las reglas de negocio.

- Identificador: `RF-<módulo>-NN`.
- Columna **CU**: casos de uso que lo realizan (ver [casos-de-uso.md](casos-de-uso.md)).
- Términos del dominio: ver el glosario en [README.md](README.md).

Módulos: [AUT](#aut--autenticación) · [CFG](#cfg--configuración-del-usuario) · [DSH](#dsh--dashboard) · [ENT](#ent--entidades-financieras) · [GAS](#gas--gastos) · [PAG](#pag--pagos-y-cobros) · [CAT](#cat--categorías) · [CTA](#cta--hacer-cuentas) · [CMP](#cmp--gastos-compartidos) · [NOT](#not--notificaciones-en-tiempo-real)

## AUT — Autenticación

| ID | Requerimiento | CU |
| --- | --- | --- |
| RF-AUT-01 | El sistema permite registrarse con nombre (mínimo 2 caracteres), email y contraseña (mínimo 6 caracteres). | CU-01 |
| RF-AUT-02 | El sistema rechaza el registro si el email ya pertenece a una cuenta (`EMAIL_YA_REGISTRADO`). | CU-01 |
| RF-AUT-03 | El sistema permite iniciar sesión con email y contraseña. Ante email inexistente o contraseña incorrecta responde el mismo error (`CREDENCIALES_INVALIDAS`), sin revelar cuál de los dos falló. | CU-02 |
| RF-AUT-04 | El sistema permite iniciar sesión con una cuenta de Google (Firebase Authentication). Si no existe una cuenta para esa identidad, la crea. | CU-03 |
| RF-AUT-05 | Si se inicia sesión con Google y ya existe una cuenta creada con credenciales para el mismo email, el sistema vincula la identidad de Google a esa cuenta en lugar de crear una duplicada. | CU-03 |
| RF-AUT-06 | Al autenticarse, el sistema entrega un token de sesión y los datos del usuario; el cliente los conserva para mantener la sesión entre reinicios. | CU-02, CU-03 |
| RF-AUT-07 | Todas las pantallas y operaciones, salvo registro e inicio de sesión, requieren una sesión válida. Sin sesión, el cliente redirige al inicio de sesión. | — |
| RF-AUT-08 | El usuario puede cerrar sesión, previa confirmación. Al hacerlo se eliminan el token y los datos de usuario guardados en el dispositivo. | CU-04 |
| RF-AUT-09 | Cuando la API informa que la sesión no es válida o venció (401), el cliente cierra la sesión y lleva al usuario al inicio de sesión, donde un cartel le informa que su sesión venció. El cartel no aparece cuando el usuario cerró la sesión por su cuenta. | CU-02 |

## CFG — Configuración del usuario

| ID | Requerimiento | CU |
| --- | --- | --- |
| RF-CFG-01 | El usuario puede ver su perfil: nombre, email y foto. | CU-05 |
| RF-CFG-02 | El usuario puede elegir su moneda preferida entre ARS, USD, EUR, BRL, CLP y UYU. Se usa como moneda de referencia para mostrar equivalencias. | CU-06 |
| RF-CFG-03 | El usuario puede registrar su sueldo y la moneda en la que lo cobra. Se usa para calcular qué proporción del sueldo representan sus gastos. | CU-07 |

## DSH — Dashboard

| ID | Requerimiento | CU |
| --- | --- | --- |
| RF-DSH-01 | El dashboard muestra los gastos **activos** del usuario agrupados por entidad. Un gasto es activo si no está eliminado, está aprobado (`ACTIVE`) y es fijo o le quedan cuotas por pagar. | CU-08 |
| RF-DSH-02 | Las entidades favoritas se muestran primero; a igualdad, primero la que tiene el gasto más reciente. Dentro de cada entidad, primero los gastos favoritos y luego los más recientes. | CU-08 |
| RF-DSH-03 | Una entidad sin gastos activos no se muestra, salvo que sea favorita, no haya filtros aplicados y no haya una sesión de cuentas abierta. | CU-08 |
| RF-DSH-04 | El dashboard muestra, por moneda, los totales "debo", "me deben" y el balance, tanto del saldo restante como de la cuota del período. | CU-08 |
| RF-DSH-05 | El usuario puede filtrar los gastos por texto (coincide con el nombre del gasto o de la entidad), por moneda, por tipo (egreso/ingreso) y por gasto fijo / no fijo. Por defecto no hay filtro de moneda. | CU-08 |
| RF-DSH-06 | El sistema muestra los montos convertidos a la moneda preferida usando la cotización vigente de USD, EUR, BRL, CLP y UYU frente a ARS, obtenida de un servicio externo. | CU-08 |
| RF-DSH-07 | El usuario puede ver gráficos de sus gastos activos: evolución de cuotas, evolución de montos y distribución por categoría, incluyendo qué porcentaje del sueldo representa cada categoría. | CU-08 |
| RF-DSH-08 | El dashboard indica cuántos gastos compartidos están pendientes de aprobación por cada entidad. | CU-08, CU-32 |
| RF-DSH-09 | El usuario puede copiar al portapapeles un resumen en texto de los gastos de una entidad, con formato apto para WhatsApp. | CU-31 |
| RF-DSH-10 | Desde el dashboard se puede crear un gasto, postergarlo, marcarlo como favorito y marcar entidades como favoritas. | CU-13, CU-17, CU-23, CU-24 |

## ENT — Entidades financieras

| ID | Requerimiento | CU |
| --- | --- | --- |
| RF-ENT-01 | El usuario puede listar sus entidades, con la cantidad de gastos y de pendientes de cada una, y buscarlas por nombre. El orden es el mismo que en el dashboard. | CU-09 |
| RF-ENT-02 | El usuario puede crear una entidad indicando su nombre. No puede haber dos entidades activas con el mismo nombre para un mismo usuario (`ENTIDAD_YA_EXISTE`). | CU-10 |
| RF-ENT-03 | Al crear una entidad se puede indicar el email de otro usuario para dejarla vinculada en el mismo paso. | CU-10, CU-15 |
| RF-ENT-04 | El usuario puede renombrar una entidad, respetando la unicidad de nombre. El cambio queda en el historial de la entidad. | CU-11 |
| RF-ENT-05 | El usuario puede eliminar una entidad, previa confirmación. La baja es lógica. | CU-12 |
| RF-ENT-06 | El usuario puede marcar y desmarcar una entidad como favorita. | CU-13 |
| RF-ENT-07 | El detalle de una entidad muestra sus gastos activos, finalizados y pendientes de aprobación, sus totales y su historial de movimientos. | CU-14 |
| RF-ENT-08 | El historial de una entidad registra: creación, cambio de nombre, vinculación y desvinculación (con quién), y la creación, renombrado, eliminación, restauración y postergación de sus gastos. Se puede filtrar por rango de fechas. | CU-14 |
| RF-ENT-09 | El usuario puede vincular una entidad a otro usuario por su email. El email debe corresponder a un usuario registrado (`USUARIO_EMAIL_NOT_FOUND`), no puede ser el propio (`VINCULAR_CUENTA_PROPIA`) y un mismo usuario no puede estar vinculado a más de una entidad (`ENTIDAD_YA_VINCULADA`). | CU-15 |
| RF-ENT-10 | El usuario puede desvincular una entidad, previa confirmación. La entidad muestra en todo momento a quién está vinculada. | CU-15 |
| RF-ENT-11 | El usuario puede ver los gastos eliminados de una entidad y restaurarlos. | CU-16 |
| RF-ENT-12 | Un usuario solo puede ver y operar sobre sus propias entidades. | — |

## GAS — Gastos

| ID | Requerimiento | CU |
| --- | --- | --- |
| RF-GAS-01 | El usuario puede crear un gasto indicando: entidad, nombre, monto, moneda (ARS/USD/EUR/BRL/CLP/UYU), tipo (egreso/ingreso) y modalidad: pago único, en cuotas (cantidad de cuotas) o gasto fijo. | CU-17 |
| RF-GAS-02 | Al crear un gasto se puede indicar cuántas cuotas ya están pagas; el sistema registra un pago por cada una. | CU-17 |
| RF-GAS-03 | Al crear un gasto se puede crear en el mismo paso la entidad a la que pertenece. | CU-10, CU-17 |
| RF-GAS-04 | Al crear un gasto se puede elegir "pagar con otra entidad" propia. El sistema crea un **gasto espejo** en esa entidad: mismos datos, cuotas y categorías, con el tipo opuesto, y deja ambos gastos enlazados. | CU-17 |
| RF-GAS-05 | Si la entidad del gasto está vinculada a otro usuario, el gasto nace pendiente de aprobación y el sistema genera una copia para la contraparte (ver [CMP](#cmp--gastos-compartidos)). | CU-17 |
| RF-GAS-06 | Al crear un gasto se lo puede marcar como postergado. | CU-17, CU-23 |
| RF-GAS-07 | El detalle de un gasto muestra sus datos, la entidad, sus categorías, el progreso de pago y su historial de movimientos. | CU-18 |
| RF-GAS-08 | El usuario puede editar nombre, monto, tipo, condición de gasto fijo y categorías de un gasto. Si el gasto tiene espejo, puede elegir aplicar los cambios también al espejo, que conserva el tipo opuesto. | CU-19 |
| RF-GAS-09 | El usuario puede eliminar un gasto, previa confirmación. La baja es lógica. Si el gasto tiene espejo, puede elegir eliminarlo también; si no, el enlace entre ambos se rompe. | CU-20 |
| RF-GAS-10 | El usuario puede restaurar un gasto eliminado de una entidad propia. | CU-16 |
| RF-GAS-11 | El usuario puede postergar un gasto y quitar la postergación. Un gasto postergado queda fuera de la sesión de cuentas en curso. Si se posterga un gasto ya marcado en la sesión, la marca se quita. | CU-23 |
| RF-GAS-12 | El usuario puede marcar y desmarcar un gasto como favorito. Cuando el gasto se finaliza, deja de ser favorito automáticamente. | CU-24 |
| RF-GAS-13 | Cada gasto conserva un historial de movimientos: creación, pagos, pagos pendientes, reembolsos, postergación y fin de postergación. | CU-18 |
| RF-GAS-14 | Un usuario solo puede ver y operar sobre gastos de sus propias entidades (`NO_AUTORIZADO`). La copia de un gasto compartido que todavía no fue asignada a una entidad solo puede verla quien la recibió. | — |

## PAG — Pagos y cobros

"Pagar" aplica a egresos y "registrar cobro" a ingresos; la regla es la misma.

| ID | Requerimiento | CU |
| --- | --- | --- |
| RF-PAG-01 | El usuario puede registrar el pago de una cuota de un gasto. Hay dos modalidades: **directo** (el pago se registra en el momento) y **diferido** (el gasto solo queda marcado en la sesión de cuentas y el pago se registra al finalizarla). | CU-21 |
| RF-PAG-02 | Desde el **dashboard** solo se puede pagar con una sesión de cuentas abierta, y siempre de forma diferida. Sin sesión, el sistema lo impide y avisa (`SETTLEMENT_REQUIRED`). | CU-21, CU-27 |
| RF-PAG-03 | Desde el **detalle de un gasto**, el pago es diferido si hay una sesión abierta y directo si no la hay. | CU-21 |
| RF-PAG-04 | Desde el **detalle de una entidad**, el pago es siempre directo, haya o no una sesión abierta. | CU-21 |
| RF-PAG-05 | Un pago directo no forma parte de ninguna sesión ni snapshot de cuentas: solo queda en el historial del gasto. | CU-21 |
| RF-PAG-06 | Un gasto postergado no puede marcarse en la sesión de cuentas (`GASTO_POSTERGADO`). Si se le registra un pago directo, la postergación se quita automáticamente y queda asentado en el historial. | CU-21, CU-23 |
| RF-PAG-07 | Un gasto no fijo no admite más pagos que su cantidad de cuotas: con todas las cuotas pagas no puede pagarse ni marcarse en la sesión (`GASTO_YA_SALDADO`). Un gasto fijo admite pagos indefinidamente. | CU-21 |
| RF-PAG-08 | Si el gasto es compartido con otro usuario, el pago queda como **pendiente de confirmación** hasta que la contraparte lo confirme, y se le notifica. No se generan más pendientes que las cuotas restantes. | CU-21, CU-36 |
| RF-PAG-09 | El usuario puede revertir el último pago de un gasto. El sistema elimina ese pago y registra un reembolso en el historial. Si no hay pagos, lo impide (`SIN_CUOTAS_PARA_REVERTIR`). La reversión es siempre directa. | CU-22 |
| RF-PAG-10 | El usuario puede pagar en lote todos los gastos de una entidad. Los que no se pueden pagar (inexistentes, postergados o ya saldados) se informan sin impedir el resto. | CU-27 |

## CAT — Categorías

| ID | Requerimiento | CU |
| --- | --- | --- |
| RF-CAT-01 | El usuario puede listar sus categorías. Cada categoría tiene nombre y color y pertenece a un único usuario. | CU-25 |
| RF-CAT-02 | El usuario puede crear una categoría, incluso mientras crea o edita un gasto. | CU-25 |
| RF-CAT-03 | Un gasto puede tener cero o más categorías, que se asignan al crearlo o al editarlo. | CU-17, CU-19 |
| RF-CAT-04 | La API permite además modificar y eliminar categorías (`PUT` / `DELETE /categorias/:id`). La web todavía no expone estas dos operaciones. | CU-25 |

## CTA — Hacer cuentas

| ID | Requerimiento | CU |
| --- | --- | --- |
| RF-CTA-01 | El usuario puede iniciar una sesión de cuentas. Solo puede haber una sesión abierta por usuario; iniciar con una ya abierta devuelve la existente. | CU-26 |
| RF-CTA-02 | La sesión y sus marcas se guardan en el servidor: no tiene límite de tiempo y el usuario puede retomarla más tarde y desde otro dispositivo. | CU-26 |
| RF-CTA-03 | Con una sesión abierta, el usuario puede marcar y desmarcar gastos, de a uno o todos los de una entidad a la vez. Marcar un gasto **no** registra el pago. Solo se pueden marcar gastos de entidades propias (`NO_AUTORIZADO`); si un lote incluye uno ajeno, no se marca ninguno. | CU-27 |
| RF-CTA-04 | La aplicación muestra en todo momento que hay una sesión abierta, desde cuándo y cuántos gastos hay marcados. | CU-26, CU-27 |
| RF-CTA-05 | Al finalizar la sesión, el sistema registra el pago de una cuota por cada gasto marcado, todos con la misma fecha. Los gastos marcados que ya no se pueden pagar (eliminados, postergados o saldados) se descartan de la sesión. | CU-28 |
| RF-CTA-06 | Al finalizar la sesión, el sistema genera un snapshot con: mes, inicio y fin de la sesión, totales por moneda (egresos, ingresos y cantidad), cantidad de entidades y el detalle por gasto (entidad, monto de la cuota, moneda, tipo, número de cuota). | CU-28 |
| RF-CTA-07 | Al finalizar la sesión, todos los gastos postergados del usuario dejan de estarlo. | CU-28 |
| RF-CTA-08 | El usuario puede descartar la sesión abierta. Se pierden las marcas y no se registra ningún pago ni snapshot. | CU-29 |
| RF-CTA-09 | El usuario puede consultar el historial de sesiones finalizadas, filtrarlo por rango de fechas y ver el detalle de cada snapshot agrupado por entidad. | CU-30 |
| RF-CTA-10 | El usuario puede copiar al portapapeles el resumen completo de un snapshot o el de una de sus entidades, con formato apto para WhatsApp. | CU-31 |

## CMP — Gastos compartidos

| ID | Requerimiento | CU |
| --- | --- | --- |
| RF-CMP-01 | Cuando un usuario (emisor) crea un gasto en una entidad vinculada, el gasto queda `PENDING_APPROVAL` y se crea una copia para el usuario vinculado (receptor), también pendiente. | CU-17 |
| RF-CMP-02 | El usuario puede ver sus gastos compartidos **recibidos** y **emitidos** con su estado (pendiente, aprobado, rechazado), y los pagos compartidos separados en "por confirmar" (los registró la contraparte) y "esperando" (los registró él). | CU-32 |
| RF-CMP-03 | El receptor puede aprobar un gasto recibido asignándolo a una entidad propia existente o creando una nueva. Al aprobar, el gasto original y la copia pasan a `ACTIVE`. | CU-33 |
| RF-CMP-04 | Si al aprobar se crea una entidad nueva, queda vinculada automáticamente al emisor. | CU-33 |
| RF-CMP-05 | El receptor puede rechazar un gasto recibido. El original y la copia pasan a `REJECTED`. | CU-34 |
| RF-CMP-06 | El emisor puede reintentar un gasto rechazado. El original y la copia vuelven a `PENDING_APPROVAL`. | CU-35 |
| RF-CMP-07 | Solo el receptor puede aprobar o rechazar, y solo mientras el gasto está pendiente (`NO_AUTORIZADO`, `GASTO_NO_PENDIENTE_APROBACION`). Solo el emisor puede reintentar, y solo si el gasto está rechazado (`GASTO_COMPARTIDO_NO_RECHAZADO`). | CU-33, CU-34, CU-35 |
| RF-CMP-08 | La contraparte puede confirmar un pago pendiente: pasa a ser un pago efectivo. | CU-36 |
| RF-CMP-09 | La contraparte puede rechazar un pago pendiente: el pago se elimina. | CU-37 |
| RF-CMP-10 | Quien registró un pago no puede confirmarlo ni rechazarlo; solo la contraparte del gasto compartido (`NO_AUTORIZADO`). | CU-36, CU-37 |
| RF-CMP-11 | La aplicación muestra un contador de gastos recibidos pendientes de aprobación y de pagos por confirmar. | CU-32 |

## NOT — Notificaciones en tiempo real

| ID | Requerimiento | CU |
| --- | --- | --- |
| RF-NOT-01 | El sistema notifica en tiempo real al usuario afectado cuando: recibe un gasto compartido nuevo o reintentado, le aprueban o rechazan un gasto que emitió, le registran un pago pendiente de confirmación, o le confirman o rechazan un pago que registró. | CU-38 |
| RF-NOT-02 | Al recibir una notificación, las pantallas afectadas (compartidos, dashboard) actualizan sus datos sin que el usuario recargue. | CU-38 |
| RF-NOT-03 | Cada usuario recibe únicamente las notificaciones de su propio canal. | CU-38 |

## Pendiente / fuera de alcance

Funcionalidad conversada pero **no implementada**. No son requerimientos vigentes; se listan para no confundirlos con comportamiento existente. Detalle en `checklist_mis_cuentas.md` y `checklits_expense_manager.md`.

- Imágenes adjuntas para gastos y entidades.
- Pantalla de entidades eliminadas con opción de restaurar.
- Historial ampliado del gasto (ediciones, "finalizado") y reembolso de pagos puntuales en gastos fijos.
- Métricas de ingresos/egresos por categoría.
- Notificaciones de vencimientos, integración con Mercado Pago, entidades privadas con contraseña, modo daltonismo, modo simple/avanzado.
