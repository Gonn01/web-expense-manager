# Mantener la documentación

Regla: **todo cambio en cualquiera de los tres proyectos (web, app Flutter, API) se cierra actualizando la documentación y las guías que ese cambio deja desactualizadas, en el mismo cambio.** No es una tarea aparte ni posterior.

Todo vive en el repo de la web, sin importar en qué proyecto se hizo el cambio:

| Qué | Dónde |
| --- | --- |
| Documentación funcional | `c:\Users\gonza\Desktop\web-plataformas-de-desarrollo\docs\` |
| Guías de desarrollo | `c:\Users\gonza\Desktop\web-plataformas-de-desarrollo\.claude\guides\` |
| Resumen operativo de cada repo | `CLAUDE.md` en la raíz de cada uno de los tres repos |

## Qué actualizar según el cambio

| Si el cambio… | Actualizar |
| --- | --- |
| agrega, modifica o quita un comportamiento visible para el usuario | `docs/requerimientos-funcionales.md` + el `CU` afectado en `docs/casos-de-uso.md` |
| agrega o quita un caso de uso, un actor o una relación `«include»` / `«extend»` | lo anterior + el catálogo de `docs/casos-de-uso.md` + el `.svg` del módulo y `00_general.svg` en `docs/diagramas/` |
| cambia una regla de negocio (validación, estado, quién puede hacer qué) | el `RF` y los flujos alternativos del `CU`; si cambia un flujo de estados, también los diagramas de comportamiento al final de `docs/casos-de-uso.md` |
| agrega o cambia un endpoint, un código de error o un evento de Pusher | `arquitectura-api.md` si cambia la lista de grupos de rutas o eventos; los `RF` que citan el código; la tabla de eventos de CU-38 |
| cambia seguridad, rendimiento, tolerancia a fallos, dependencias externas o entornos | `docs/requerimientos-no-funcionales.md` |
| corrige una limitación conocida | quitarla de `docs/requerimientos-no-funcionales.md` (y la nota de "cumplimiento parcial" del `RF`, si la había) |
| cambia la estructura de carpetas, una capa, una convención o un comando | la guía de arquitectura de ese proyecto + su `CLAUDE.md` |
| introduce un patrón nuevo o deja uno en desuso | la guía de arquitectura de ese proyecto, incluido su checklist |
| agrega un término de dominio | el glosario de `docs/README.md` |
| implementa algo de "Pendiente / fuera de alcance" | moverlo de esa lista a un `RF` real, y marcarlo en el checklist correspondiente de la raíz de la web |

No requieren actualizar nada: cambios puramente visuales (layout, espaciado, colores, elección de componentes), refactors internos que no alteran capas ni convenciones, y correcciones de bugs que hacen que el código cumpla lo que la documentación ya decía.

## Cómo

1. **Antes de empezar**, leer el `RF` y el `CU` del área que se va a tocar: dicen cómo debería comportarse hoy.
2. **Al terminar**, recorrer la tabla de arriba y editar lo que corresponda. Describir el comportamiento **resultante**, en presente; no narrar el cambio ("ahora", "antes", "se agregó").
3. **Mantener la trazabilidad** en las dos puntas: cada `RF` lista sus `CU` y cada `CU` sus `RF`.
4. **No reutilizar IDs**: un `RF`, `RNF` o `CU` eliminado deja su número vacante; uno nuevo toma el siguiente libre de su serie.
5. **Diagramas**: el `.svg` es la fuente y se edita a mano (elipses, líneas y textos simples). Regenerar el `.png` a partir del `.svg`; si no es posible, borrar el `.png` viejo en lugar de dejar uno que lo contradiga.
6. **Verificar contra el código**, no contra la intención: si la API no hace cumplir una regla, documentarla como cumplimiento parcial o limitación conocida, no como cumplida.
7. **Avisar en el resumen final** qué archivos de documentación se actualizaron, o decir explícitamente que el cambio no requería actualizar ninguno y por qué.

## Relación con la regla de paridad

La paridad funcional entre la web y la app Flutter y esta regla van juntas: un cambio funcional está completo cuando está hecho en ambos clientes (o declarado como pendiente en uno), y documentado. La documentación describe el sistema, no un cliente; si un comportamiento existe todavía en un solo cliente, el `RF` lo aclara.
