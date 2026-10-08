# Documentación — Plataforma de Gestión de Deudas

Documentación funcional del sistema completo. Aunque vive en el repo de la web, describe **los tres proyectos**, porque comparten un mismo comportamiento:

| Proyecto | Ubicación | Rol |
| --- | --- | --- |
| Web (React) | `web-plataformas-de-desarrollo` (este repo) | Cliente web |
| App móvil (Flutter) | `d:\proyectos_flutter\app_expense_manager` | Cliente Android / iOS |
| API (Node/Express) | `d:\proyectos_node\api-plataformas-desarrollo` | Backend compartido por ambos clientes |

## Contenido

| Documento | Qué contiene |
| --- | --- |
| [requerimientos-funcionales.md](requerimientos-funcionales.md) | Qué hace el sistema, por módulo (`RF-<módulo>-NN`) |
| [requerimientos-no-funcionales.md](requerimientos-no-funcionales.md) | Atributos de calidad y restricciones (`RNF-<categoría>-NN`) |
| [casos-de-uso.md](casos-de-uso.md) | Actores, diagramas y especificación de los casos de uso `CU-01` a `CU-38` |
| [diagramas/](diagramas/) | Diagramas de casos de uso (`.svg` es la fuente, `.png` es la exportación) |

Las guías de arquitectura para desarrollar (cómo se construye una feature en cada proyecto) no están acá: cada proyecto tiene la suya en `.claude/guides/` de su propio repo. La de la web y el índice de las tres están en [../.claude/guides/](../.claude/guides/).

## Glosario

| Término | Significado |
| --- | --- |
| **Entidad financiera** | Agrupador de gastos: una persona, una tarjeta, un banco, un comercio. Todo gasto pertenece a una entidad. |
| **Gasto** | Deuda o crédito registrado en una entidad (`purchases` en la base). Puede ser en cuotas, de pago único o fijo. |
| **Egreso / Ingreso** | Tipo del gasto. Egreso = lo que el usuario debe pagar; ingreso = lo que le deben cobrar. |
| **Gasto fijo** | Gasto recurrente sin cantidad de cuotas (alquiler, suscripción). Nunca se finaliza. |
| **Cuota** | Cada pago de un gasto. `monto por cuota = monto / cantidad de cuotas`. |
| **Gasto finalizado** | Gasto no fijo con todas sus cuotas pagas. Deja de aparecer en el dashboard. |
| **Movimiento** | Registro de historial de un gasto o de una entidad (creación, pago, reembolso, edición, etc.). |
| **Gasto espejo** | Copia de un gasto con el tipo opuesto, creada en otra entidad propia al usar "pagar con otra entidad". |
| **Entidad vinculada** | Entidad asociada a otro usuario de la plataforma (la *contraparte*) mediante su email. |
| **Gasto compartido** | Gasto creado en una entidad vinculada: genera una copia para la contraparte, que debe aprobarla. |
| **Pago pendiente** | Pago de un gasto compartido que espera la confirmación de la contraparte. |
| **Hacer cuentas** (*settlement*) | Sesión en la que el usuario marca qué gastos paga/cobra; los pagos se registran recién al finalizarla. |
| **Snapshot** | Foto inmutable de una sesión de cuentas finalizada: totales por moneda y detalle por gasto. |
| **Postergar** | Excluir un gasto de la sesión de cuentas actual; se libera al finalizar esa sesión. |

## Cómo se mantiene

Esta documentación tiene que reflejar el comportamiento **actual** del sistema. Todo cambio funcional en cualquiera de los tres proyectos se documenta en el mismo cambio:

1. **Requerimientos funcionales**: agregar, modificar o eliminar el `RF` afectado. Los IDs no se reutilizan: un requerimiento eliminado se borra y su número queda vacante.
2. **Casos de uso**: actualizar la especificación del `CU` afectado (flujos, precondiciones, reglas). Un caso de uso nuevo toma el siguiente número libre (`CU-39`, …) y se agrega al catálogo.
3. **Diagramas**: si se agrega, quita o renombra un caso de uso, un actor o una relación `«include»`/`«extend»`, editar el `.svg` correspondiente en [diagramas/](diagramas/) y el diagrama general `00_general.svg`. Regenerar el `.png` a partir del `.svg`; si no se puede regenerar, borrar el `.png` desactualizado antes que dejar uno que contradiga al `.svg`.
4. **Requerimientos no funcionales**: actualizarlos cuando cambie una restricción técnica, de seguridad, de rendimiento o una limitación conocida.
5. **Trazabilidad**: cada `RF` referencia sus `CU` y cada `CU` sus `RF`. Mantener las dos puntas.

Los cambios puramente visuales (layout, espaciado, colores, componentes) no requieren tocar esta documentación.
