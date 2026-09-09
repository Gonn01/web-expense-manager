# Checklist - EXPENSE MANAGER

## DASHBOARD

- [x] Al pagar/registrar cobro no se actualiza la fecha del ultimo pago
- [x] hacer verificacion de entidad duplicada por nombre
- [x] mejorar la ui del dashboard
- [x] posibilidad de desplegar/achicar las entidades
- [x] el filtrado no tiene en cuenta los nombres de las entidades
- [x] que el dashboard no tenga en cuenta la moneda de preferencia para el filtrado, que por defecto sea "todos"
- [x] hacer verificacion de vinculacion duplicada, si ya tenes un mail vinculado a una entidad no se puede usar en otra
- [x] lugar de ingreso de sueldo
- [x] en el balance mensual ver el resumen en contraste
- [x] un lugar para agregar aumentos
- [x] modo hacer cuentas: modo de checkbox en los que cada vez que pagas una entidad se marque automaticamente/manual el checbox de pagado en esta sesion, y hay que ver la manera de evitar que se pierda la informacion cuando navegas a la entidad o al gasto (sesión + marcas persistidas en DB vía `/reconcile/*`, se retoma al volver)
- [x] ~~limite de tiempo 4h editable~~ CAMBIO: la sesión se guarda en DB y vive hasta que tocás "Terminar", el usuario la retoma cuando quiere
- [x] no se puede pagar/cobrar nada fuera del modo hacer cuentas (guard en frontend con snackbar + backend rechaza con 409 `RECONCILE_REQUIRED`)
- [x] al terminar de hacer cuentas se guarda un snapshot del mes (totales por moneda/tipo + detalle por gasto) en `reconcile_snapshots` para comparar meses — pantalla "Historial de cuentas"
- [x] boton exportar que tome toda la informacion del modo hacer cuentas (botón "Exportar" en cada snapshot → resumen del mes al portapapeles + botón "Copiar" por entidad, estilo WhatsApp)
- [x] grafico de gastos por categoria
- [x] metricas por categoria en relacion al sueldo, por ej, cuanto gasto de suscripciones en relacion al sueldo (11%)
- [x] sacar balance general del dashboard
- [x] al activar boton hacer cuentas que aparezca un boton terminar, que guarde los datos resumen para posteriores metricas (botón "Terminar" en el banner → snapshot)

- [x] en los graficos hay que eliminar el ultimo punto y en el anteultimo hay que ponerle que se termina, para que no quede un punto de cuota 0, y en la de cuota 1 diga ULTIMA
- [x] el orden del dashboard tiene que venir ordenado por, cada entidad tiene un ultimo gasto, y las entidades se ordenan por quien tiene el gasto mas actual, y dentro de la entidad por gastos mas actuales
- [x] Se elimina balance general
- [x] pago con entidad
- [x] checkbox de entra el mes siguiente (se reemplazo por el boton postergar)
- [x] Flechita para ocultar los balances y también que el sidebar se oculte (flechitas individuales: una colapsa el sidebar, otra oculta la columna de balances; preferencia persistida)
- [x] agregar favoritos

## ENTIDADES FINANCIERAS

- [x] MISMO orden que en dashboard
- [x] sacar la flechita en el listado, porque se oculta
- [x] al crear entidad se pueda vincular a un usuario
- [x] modo grid
- [xx] pantalla de entidades eliminadas y boton para restaurar
- [x] visibilizar a quien esta vinculada

## Detalle entidad financiera

- [ ] sacar del dialog de editar la vinculacion
- [ ] crear boton para vincular, que se alterne con un desvincular, con dialog de alerta.
- [ ] boton ver graficos
- [ ] que las cards de gastos sean iguales a las del dashboard
- [ ] boton copiar
- [ ] boton pagar/registrar cobro
- [ ] en el historial debe ir, cuando se creo, cuando se vinculo y con quien, cuando se desvinculo de quien, cuando se elimino, cuando se restauro, cuando se creo una compra como sellama esa compra, cuando se edito el nombre de una compra, y cuando se elimino/ restauro esa compra
- [ ] boton para ver gastos eliminados y poder restaurarlos
- [ ] filtro de rango de fechas en el historial
- [ ] visibilizar a quien esta vinculada

## Detalle gasto

- [x] si es egreso que diga pagar cuota, si es ingreso que diga cobrar
- [ ] historial, debe tener cambio de nombre, cualquier edicion, y que se edito en lo posible, eliminado y restaurado, creado pagos de cuota o reembolsos, y para la ultima cuota pagada debe decir finalizado.
- [x] en gastos fijos debe aparecer cuando hiciste cada pago, con la posibilidad de reembolsarlo

## Perfil

- [x] ~~configurar cuanto tiempo dura el modo hacer cuentas~~ descartado: la sesión persiste en DB hasta que se termina, sin límite de tiempo

## Metricas

- [ ] egreso ingreso por categoria y cuanto de el sueldo ingresado representa

## Adicionales

- [ ] imagenes para entidades y para gastos
- [ ] integrar mp mediante link
- [ ] modo daltonismo
- [ ] posibilidad de marcar entidades como privadas y que al querer ver datos de la misma haya que poner una contraseña
- [ ] MODO simple/usuario avanzado que muestre mas o menos cosas, checkear FITIA
- [ ] dEFINIR TEMA MARKETING
- [ ] Notificaciones de cuando tenes que pagar cosas
- [ ] como hacemos para explicarle al usuario como usar el sistema
- [ ] [REVISAR]el grafico del dashboard debe tener en cuenta si el usuario ya hizo las cuentas este mes, para saber en que mes empieza el grafico
