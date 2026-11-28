# Limitaciones y trabajo futuro

Qué no hace bien todavía el sistema y qué quedó planeado sin implementar. Responde al valor de responsabilidad profesional ([mision-vision-valores.md](mision-vision-valores.md)): un incumplimiento conocido se documenta, se explica cómo se mitiga hoy y cómo se resolvería, en lugar de ocultarlo.

- Cada limitación cita el requerimiento donde está registrada. El detalle vigente está en [requerimientos-no-funcionales.md](requerimientos-no-funcionales.md) y [requerimientos-funcionales.md](requerimientos-funcionales.md); este documento las reúne y agrega el riesgo y el plan.
- El trabajo futuro no forma parte del alcance actual ([descripcion-general.md](descripcion-general.md#fuera-de-alcance)) hasta que se implemente.

## Limitaciones conocidas

### Seguridad y sesiones

| Limitación | Riesgo | Cómo se mitiga hoy | Cómo se resolvería |
| --- | --- | --- | --- |
| Sin Firebase configurado en la API (entorno local y pruebas), el registro no verifica que el email pertenezca a quien se registra (RNF-SEG-18). | Alguien crea una cuenta con un email ajeno en un entorno de desarrollo. | En producción la API usa Firebase y exige el email verificado. Vincular Google a esa cuenta exige su contraseña o eliminarla (RNF-SEG-14). | No aplica a producción. Si se quisiera verificar también en local, usar el emulador de Firebase Authentication. |
| Pedir la recuperación de una cuenta que todavía tenía la contraseña en la base la prepara en Firebase, y esa contraseña deja de servir aunque el pedido lo haga otra persona (RF-AUT-14). | Un tercero que conoce el email deja al dueño sin su contraseña vieja. | El dueño recibe el mail y crea una nueva. Los pedidos están limitados (RNF-SEG-16). | Pasar de una vez todas las cuentas a Firebase, importando los hashes bcrypt, y borrar los de la base. Así ninguna cuenta depende de su primer inicio de sesión (RF-AUT-15). |
| Cambiar la contraseña desde la página de Firebase (recuperación) no invalida los tokens de sesión ya emitidos por la API (RNF-SEG-17). | Una sesión robada sigue activa después de recuperar la contraseña. | Los tokens vencen a los 7 días y "Cerrar todas las sesiones" los invalida al instante. | Guardar en la sesión la fecha de emisión y compararla con `tokensValidAfterTime` de Firebase, o incrementar `token_version` al detectar el cambio en el siguiente inicio de sesión. |
| La autorización del canal privado de Pusher se valida al suscribirse: una conexión ya suscrita sigue recibiendo eventos aunque su token se revoque (RNF-SEG-15). | Un dispositivo con la sesión cerrada sigue recibiendo avisos hasta desconectarse. | Los eventos solo llevan identificadores; los datos se piden a la API con un token válido. | Usar la autenticación de usuarios de Pusher y cortar sus conexiones al revocar las sesiones. |
| Las notificaciones push de Android nombran a quien actuó, así que ese nombre pasa por Pusher Beams y Firebase Cloud Messaging (RNF-SEG-12). | Un servicio externo conoce nombres de usuarios. | Los textos no incluyen montos ni nombres de gastos. | Mandar un texto genérico ("Tenés novedades en Compartidos") y mostrar el detalle solo dentro de la app. |
| El límite de inicio de sesión cuenta por email e IP; un ataque distribuido entre muchas IP contra una misma cuenta no queda limitado (RNF-SEG-16). | Prueba de contraseñas a gran escala. | Límite de 30 intentos por IP y bloqueo temporal propio de Firebase ante muchos intentos fallidos. | Un límite por cuenta que pida un captcha en lugar de bloquear, para no dejar al dueño afuera. |

### Datos y reglas de negocio

| Limitación | Riesgo | Cómo se mitiga hoy | Cómo se resolvería |
| --- | --- | --- | --- |
| El nombre del registro (mínimo 2 caracteres) solo lo validan los clientes (RF-AUT-01). | Una llamada directa a la API crea una cuenta con un nombre vacío o de un carácter. | Los dos clientes validan antes de enviar. | Validar también en `AuthController.register`. |
| Al eliminar una entidad, los espejos de sus gastos se desenlazan y al restaurarla no se vuelven a enlazar (RF-ENT-05). | Editar uno de los dos ya no ofrece aplicar el cambio al otro. | Los dos gastos conservan sus datos y su historial. | Conservar el vínculo mientras la entidad está eliminada y reconectarlo al restaurar. |
| Al revertir un pago compartido que no tiene pago vinculado en la copia, solo se revierte ese pago (RF-CMP-14). | Las dos partes quedan con cuotas pagas distintas. | Solo pasa con pagos registrados antes de que existiera el vínculo. | Reconstruir el vínculo de esos pagos con una migración. |
| Las sesiones de cuentas terminadas antes de que el snapshot guardara las categorías de cada gasto usan, en el gráfico por categoría, las categorías actuales del gasto (RF-DSH-07). | Si después se cambiaron las categorías de un gasto, la distribución de esas sesiones viejas no refleja cómo estaba en ese momento. | Las sesiones nuevas guardan sus categorías y no cambian. | No tiene solución exacta: el dato de esas sesiones no se guardó. Se podría marcar en el gráfico qué sesiones usan categorías actuales. |
| Las sesiones futuras de los gráficos son una proyección: suponen que en cada sesión se paga una cuota de cada gasto activo, y el sistema no sabe cada cuánto se hacen las cuentas (RF-DSH-07). | Si se pagan dos cuotas de un gasto en una misma sesión, o se saltea una sesión, la proyección no coincide con lo que pase. | Las sesiones pasadas muestran lo que efectivamente se pagó, sacado del historial de cuentas. | Proyectar a partir de lo que se pagó en las últimas sesiones. |
| Las fechas se muestran con un corrimiento de 3 horas respecto de la hora local (RNF-INT). | Movimientos que parecen hechos en otro horario u otro día. | — | Formatear todas las fechas en un solo lugar, convirtiendo desde UTC a la zona del dispositivo, con pruebas cerca de medianoche. |
| Una base que no ejecutó `migrations/manual/2026-11-21_monedas_bcra.sql` puede rechazar con un 500 las monedas que le falten (RNF-INT). | Error al crear un gasto en una moneda nueva. | La migración agrega todas las monedas y se puede ejecutar más de una vez. | Una herramienta de migraciones que lleve registro de cuáles se ejecutaron en cada base. |

### Rendimiento

| Limitación | Riesgo | Cómo se mitiga hoy | Cómo se resolvería |
| --- | --- | --- | --- |
| Las acciones de Compartidos actualizan la tarjeta al instante, pero después vuelven a pedir todo el listado; cuando la otra persona responde un gasto compartido, el dashboard se vuelve a pedir completo (RNF-REN). | Más consultas de las necesarias con muchos compartidos. | Las recargas son en segundo plano, sin indicador de carga, y las pantallas usan el cache de datos (RNF-REN-07). | Endpoints que devuelvan solo la entidad o el gasto afectado. |
| Las mediciones de carga se hicieron con la API y la base en una misma máquina; no miden Vercel, Supabase ni la red de producción (RNF-REN-08). | El rendimiento real puede ser peor que el medido. | Cada acción frecuente evita consultas en serie (guía de arquitectura de la API). | Repetir las mediciones contra un entorno de producción de prueba. |
| La API no tiene registro estructurado (niveles, persistencia, búsqueda): escribe en la consola. | Un error de producción es difícil de rastrear. | Vercel guarda la salida de la consola de cada función. | Un logger con niveles, sin datos sensibles, enviado a un servicio de registros. |

### Localización

| Limitación | Riesgo | Cómo se mitiga hoy | Cómo se resolvería |
| --- | --- | --- | --- |
| Los textos que redacta la API (errores sin traducción en el catálogo del cliente y detalle de algunos movimientos) llegan en español con la interfaz en inglés. En la app, los errores de validación del inicio de sesión y el registro están escritos en el código, en español y sin tildes (RNF-LOC). | Mensajes en otro idioma. | Los errores frecuentes tienen texto propio en el catálogo de cada cliente. | Que la API mande solo códigos y parámetros, y que los clientes armen todos los textos. |

### Pruebas

| Limitación | Riesgo | Cómo se mitiga hoy | Cómo se resolvería |
| --- | --- | --- | --- |
| Las pruebas de componentes y widgets cubren autenticación, compartidos y sesión de cuentas, no todas las pantallas (RNF-MAN). | Un error visual en otra pantalla no se detecta antes de publicar. | Las reglas de esas pantallas están en funciones puras con pruebas. | Sumar pruebas de las pantallas restantes, empezando por el dashboard y el detalle del gasto. |
| El flujo completo de la app en Android se ejecuta a mano, porque requiere un emulador (RNF-MAN). | Una regresión en la app llega al pipeline sin detectarse. | Las pruebas de lógica y widgets sí corren en el pipeline. | Correrlo en un emulador dentro de GitHub Actions. |
| En la API no tienen pruebas unitarias los services de categorías y dashboard (RNF-MAN). | Un cambio en esas reglas no se detecta. | Las pruebas de integración pasan por esas rutas. | Pruebas unitarias con repositorios simulados, como el resto de los services. |

## Trabajo futuro

Funcionalidad conversada que todavía no existe. Ninguna es un requerimiento vigente.

| Tema | Qué falta | Notas |
| --- | --- | --- |
| Imágenes | Asociar una imagen a gastos y entidades, con su respaldo si no carga. | Cambia la base, la API y los dos clientes. |
| Planes y cobro | Planes gratis y premium, y cobro con link de pago de Mercado Pago. | El cobro depende de definir qué incluye cada plan. |
| Gráficos | Explicar que muestran una cuota por gasto activo y no lo gastado en cada mes; nuevos gráficos; gráficos en el historial de cuentas. | — |
| Notificaciones push en iOS | Hoy las push son solo de Android (RF-NOT-04). | Requiere APNs y su configuración en Pusher Beams. |
| Vistas | Modo simple y avanzado; entidad como tarjeta con sus vencimientos; agrupar gastos; otra forma de mostrar los gastos pendientes en el dashboard. | Necesitan definir el diseño antes de programarlos. |
| Restaurar entidades | Volver a enlazar los espejos al restaurar una entidad. | Resuelve la limitación de entidades descrita arriba. |
| Calidad técnica | Registro estructurado, estados de carga globales, revisión de desbordes en pantallas chicas y textos largos. | — |
| Publicación y difusión | Medición de visitas y SEO de las páginas públicas, términos y condiciones con política de privacidad, manual de usuario de la app, dominio propio en GitHub Pages. | La medición requiere consentimiento y aviso de privacidad. |
