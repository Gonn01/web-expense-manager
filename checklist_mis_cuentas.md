# Checklist - Mis Cuentas App

## DASHBOARD

- [x] Al crear un gasto con cuotas pagas, las cuotas pagadas deben guardarse correctamente.
- [x] Los gastos fijos no deben aparecer como “Debo”.
- [x] En el modal de pagar cuotas, no se muestran los nombres de los gastos en la confirmación.

## ENTIDADES FINANCIERAS

- [x] Agregar spinner de carga al obtener entidades.
- [ ] Al crear una entidad, volver a la lista.
- [x] Corregir el layout de la lupa en el buscador.

## DETALLE DE ENTIDAD

- [x] Añadir loader mejorado al entrar.
- [x] Poner cursor pointer en gastos clickeables.
- [x] Quitar botón eliminar del modal actualizar.
- [x] Añadir zona de peligro igual que detalle de gasto.
- [x] Actualizar logs cuando se actualiza el nombre.
- [x] Click en StatCards cambia el tab.
- [x] En finalizados, mostrar fecha de finalización en lugar del valor por cuota.
- [x] Ordenar categorías.
- [x] Añadir botón “Agregar gasto”.
- [x] Añadir botón “Eliminar entidad”.

## DETALLE DE GASTO

- [x] Quitar breadcrumb.
- [x] Editar no funciona → revisar.
- [x] Ocultar “Marcar cuota como pagada” si está finalizada.
- [x] Marcar cuota como pagada no funciona.
- [x] El tipo debe representarse por color.
- [x] Mostrar el nombre de la entidad, no la ID.
- [x] La moneda no debe ser ID.
- [x] Formatear montos en cuotas pagadas.
- [x] Si es gasto fijo, mostrar cuotas pagadas y no vencimiento.
- [x] Quitar botón “volver a debo”.
- [x] Adaptar a gastos fijos.

## CONFIGURACIÓN

- [x] Traer foto, nombre, email del usuario.
- [x] Manejar moneda de preferencia del usuario.

## GENERAL

- [ ] Manejo centralizado de errores.
- [ ] Añadir logs.
- [ ] Momentos de carga globales.
- [ ] Optimizar imágenes y fallbacks.
- [ ] Los horarios los toma 3h mas.

## OPTIMIZACIONES DE RECARGA (evitar reload completo tras una mutación chica)

Casos donde una mutación puntual dispara una recarga completa de una lista/pantalla
en vez de aplicar la respuesta del endpoint sobre el estado local. Se resolvieron ya
favorito/postergar de gasto, favorito de entidad, pagarCuotas del dashboard, y las
acciones del detalle de entidad (nombre, vincular, desvincular, pagar cuota directa,
restaurar). Quedan pendientes de evaluar (afectan datos agregados de otras pantallas,
un reload puede ser intencional):

- [ ] `CompartidosCubit` (Flutter, `packages/em_services/lib/src/services/compartidos/compartidos_cubit.dart`) y las acciones de compartidos en la web: aprobar/rechazar/reintentar/confirmar pago/rechazar pago recargan todo `/compartidos` después de cada una. Puede afectar el badge de pendientes en otras pantallas (dashboard, shell) — evaluar si conviene parchear local + revalidar ese badge aparte.
- [ ] `crearGasto` del dashboard (Flutter `DashboardCubit.crearGasto` y web `use-dashboard-data.js`): crea un gasto y recarga todo el dashboard. El gasto nuevo puede afectar orden de grupos/favoritos — evaluar insertarlo directamente en el grupo de su entidad sin recargar.
- [ ] `onCompartidoAprobado` (web, `use-dashboard-data.js`, evento de Pusher): recarga todo el dashboard cuando el otro usuario aprueba un gasto compartido. Es la única fuente que trae ese gasto nuevo al estado local, así que un reload es más justificable acá — revisar si alcanza con traer solo esa entidad/gasto en vez del dashboard entero.

## EXTRAS

- [ ] Entidad como tarjeta para saber cuando vencen
- [ ] Agrupar gastos por grupos
- [ ] Ser consistente a la hora de usar el tipo de moneda(tambien cambiar a enum en la db)
- [ ] Ser consistente en la sincronizacion de cuentas registro y logeo con google
