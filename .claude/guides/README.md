# Guías de desarrollo

Guías para trabajar en los tres proyectos de la Plataforma de Gestión de Deudas. Cada proyecto tiene su guía de arquitectura en su propio repo, en `.claude/guides/`. Leé la del proyecto que vayas a tocar **antes** de escribir código; si el cambio cruza proyectos, leé las de todos los afectados.

| Guía | Dónde está | Cuándo leerla |
| --- | --- | --- |
| [arquitectura-web.md](arquitectura-web.md) | este repo | Cualquier cambio en `web-plataformas-de-desarrollo` |
| `arquitectura-flutter.md` | `d:\proyectos_flutter\app_expense_manager\.claude\guides\` | Cualquier cambio en la app Flutter |
| `arquitectura-api.md` | `d:\proyectos_node\api-plataformas-desarrollo\.claude\guides\` | Cualquier cambio en la API |
| [documentacion.md](documentacion.md) | este repo | Al terminar cualquier cambio, en cualquiera de los tres proyectos: qué documentación y qué guías hay que actualizar |

Qué describe cada cosa:

- **Las guías de arquitectura** — *cómo* se construye cada proyecto: capas, convenciones, checklists, trampas.
- **[`docs/`](../../docs/)** — *qué* hace el sistema: requerimientos funcionales, no funcionales, casos de uso y diagramas.
- **`CLAUDE.md`** de cada repo — resumen operativo de ese repo (comandos, estructura) y las reglas transversales.