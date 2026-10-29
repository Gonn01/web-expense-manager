# Misión, visión y valores

Identidad de la organización que desarrolla la **Plataforma de Gestión de Deudas**. Complementa la [descripción general](descripcion-general.md): allí están el problema que resuelve el sistema, sus objetivos y su alcance; acá, el propósito y los principios con los que se construye y se opera.

## Misión

Ayudar a las personas a ordenar y saldar sus deudas y créditos personales, incluidas las que tienen con otras personas, con una herramienta clara que les muestre en todo momento qué deben y qué les deben. Para eso cuidamos sus datos y tratamos con respeto la relación entre las partes.

## Visión

Ser la herramienta de referencia en la región para que una deuda entre personas deje de ser motivo de olvido, malentendido o conflicto: que cada deuda tenga una sola versión, acordada por ambas partes y fácil de saldar.

## Valores centrales

Cada valor se traduce en compromisos concretos del producto. Donde el sistema todavía no cumple del todo un compromiso, se dice explícitamente: reconocer los límites también es parte de la ética profesional.

| Valor | Qué significa para nosotros | Cómo se refleja en el sistema |
| --- | --- | --- |
| **Transparencia** | El usuario siempre sabe qué pasó con su dinero registrado, cuándo y por qué. | Toda operación sobre un gasto o una entidad deja un movimiento en su historial (RNF-INT-03). Cada cierre de cuentas queda como un snapshot que no se puede modificar (RNF-INT-04). Los errores se explican en lenguaje comprensible (RNF-USA-01). |
| **Consentimiento y reciprocidad** | Nadie puede imponerle una deuda a otra persona: lo que involucra a dos partes, lo aceptan las dos. | Un gasto compartido queda pendiente hasta que la contraparte lo aprueba o lo rechaza (RF-CMP-01, RF-CMP-03, RF-CMP-05). Un pago compartido no es efectivo hasta que la otra parte lo confirma (RF-PAG-08, RF-CMP-08). Quien registra un pago no puede confirmarlo él mismo (RF-CMP-10). |
| **Privacidad y confidencialidad** | Las finanzas de una persona son suyas. Solo ella decide con quién compartirlas. | Cada usuario solo accede a sus propios datos (RNF-SEG-04, RF-ENT-12, RF-GAS-14). Las contraseñas se guardan solo como hash, y el hash nunca sale de la API (RNF-SEG-01). El inicio de sesión no revela si un email está registrado (RNF-SEG-05). Las notificaciones no transmiten montos. La API solo acepta peticiones de navegador desde los orígenes de la web (RNF-SEG-10). *Compromiso pendiente*: autenticar los canales de tiempo real (limitaciones conocidas de RNF-SEG). |
| **Integridad y exactitud** | Un dato financiero incorrecto puede dañar una relación o una decisión; tratamos cada número con rigor. | Los montos se guardan en su moneda original y las conversiones no se persisten (RNF-INT-05). Las cuotas pagas se calculan a partir de los pagos reales (RNF-INT-02). Las bajas son lógicas y se pueden revertir (RNF-INT-01). Las reglas se hacen cumplir en el servidor, no solo en la pantalla (RNF-CON-02). Las operaciones que escriben varios registros se ejecutan en una transacción y no dejan datos a medias (RNF-INT-06), y un cierre de cuentas no puede registrar los pagos dos veces (RNF-DIS-08). |
| **Responsabilidad profesional** | Respondemos por lo que construimos y documentamos lo que el sistema hace realmente, no lo que nos gustaría que hiciera. | La documentación registra como *limitación conocida* toda regla que el código no cumple (RNF-MAN-06). Las acciones irreversibles piden confirmación (RNF-USA-05). Un fallo secundario no arrastra la operación del usuario (RNF-DIS-01 a RNF-DIS-03). |
| **Equidad y accesibilidad** | La herramienta tiene que servir a cualquier persona, sin importar su dispositivo ni su moneda. | La misma funcionalidad está disponible en la web y en Android/iOS (RNF-CON-01). Se pueden usar varias monedas de la región (RF-CFG-02). La interfaz está en español rioplatense (RNF-LOC-01) y se puede usar en tema claro u oscuro (RF-CFG-04, RNF-USA-09). |
| **Respeto por las relaciones personales** | Detrás de cada deuda compartida hay un vínculo entre personas; el sistema tiene que ayudar a cuidarlo, no a tensionarlo. | Un rechazo no es definitivo: el emisor puede reintentar un gasto rechazado (RF-CMP-06). Los resúmenes para WhatsApp permiten rendir cuentas de forma clara y amable (RF-DSH-09, RF-CTA-10). El usuario puede postergar un gasto cuando no puede saldarlo en ese momento (RF-GAS-11). |

## Relación con la ética y la deontología profesional

Los valores no son solo una declaración: orientan decisiones de diseño y de desarrollo.

- **Ante un conflicto entre comodidad y consentimiento, prima el consentimiento.** Por ejemplo, sería más rápido que un pago compartido se registrara sin confirmación, pero eso permitiría que una parte modifique unilateralmente la deuda de la otra.
- **Ante la duda, se minimizan los datos expuestos.** Lo que viaja fuera del servidor (notificaciones, resúmenes) lleva solo lo necesario.
- **La honestidad sobre las limitaciones es obligatoria.** Un incumplimiento conocido se documenta y se prioriza; no se oculta ni se presenta como resuelto.
- **El sistema registra, no juzga ni cobra.** No ejecuta pagos ni intima a nadie (ver *Fuera de alcance* en la [descripción general](descripcion-general.md#fuera-de-alcance)). La decisión de pagar, reclamar o perdonar una deuda siempre es de las personas.
