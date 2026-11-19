# Pruebas unitarias aplicadas al proyecto de tesis

**Proyecto:** Plataforma de Gestión de Deudas: cliente web (React)

## 1. Lenguaje y herramienta elegida

El cliente web de la tesis está hecho en **JavaScript (JSX) con React 19**, y se compila con **Vite**. Para las pruebas unitarias elegí **[Vitest](https://vitest.dev)** (versión 5.1).

Elegí Vitest por estas razones:

- **Usa la misma configuración que el proyecto.** Vitest lee el `vite.config.js` que ya existe, así que los alias de importación (`@/utils/...`), los módulos ES y el JSX funcionan sin configurar nada más. Con Jest habría que sumar Babel y repetir el alias en otra configuración.
- **Tiene la misma API que Jest** (`describe`, `it`, `expect`). Lo que se aprende sirve para las dos herramientas, y hay mucha documentación disponible.
- **Es rápido.** Corre los tests en paralelo y tiene un modo observador que vuelve a ejecutar solo los tests afectados cuando se guarda un archivo.
- **Es la opción que recomienda el ecosistema Vite**, y es solo una dependencia de desarrollo: no llega al build de producción.

Instalación:

```bash
npm install -D vitest
```

En `package.json` agregué dos scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

## 2. Sintaxis y uso básico

### ¿Cómo se organizan y nombran los archivos de prueba?

Vitest busca automáticamente los archivos que terminan en `.test.js` o `.spec.js` (también `.jsx`, `.ts`, etc.). En el proyecto elegí poner cada archivo de prueba **al lado del archivo que prueba**, con el mismo nombre más `.test.js`:

```
src/utils/
  convert-currency.js
  convert-currency.test.js
```

Dentro del archivo, las pruebas se agrupan con `describe` (un bloque por función o por tipo de caso). Cada prueba es un `it` (o `test`) con una descripción que dice qué se espera:

```js
import { describe, expect, it } from 'vitest';

describe('convertCurrency', () => {
    it('convierte de ARS a una moneda extranjera dividiendo por la cotización', () => {
        expect(convertCurrency(25000, 'ARS', 'USD', rates)).toBe(25);
    });
});
```

### ¿Qué sintaxis usa para verificar resultados?

Se usa `expect(valorObtenido)` seguido de un *matcher*:

| Matcher | Para qué sirve |
| --- | --- |
| `toBe(x)` | Igualdad estricta (`===`), para números, strings y booleanos |
| `toEqual(obj)` | Igualdad profunda de objetos y arrays |
| `toBeNull()` / `toBeUndefined()` | Verifica valores nulos o indefinidos |
| `toBeCloseTo(n)` | Compara números decimales con tolerancia (evita errores de coma flotante) |
| `toThrow()` | Verifica que una función lance una excepción |
| `.not.toBe(x)` | Niega cualquier matcher |

### ¿Cómo se corren las pruebas?

- **Por consola:** `npm test` corre todas las pruebas una vez, `npm run test:watch` las repite en cada cambio y `npx vitest run src/utils/convert-currency.test.js` corre un solo archivo.
- **Desde el IDE:** en VS Code, la extensión oficial *Vitest* muestra cada test en el panel *Testing*, con un botón para correrlo o depurarlo y el resultado (✓/✗) al lado de cada `it`.

## 3. Prueba sobre una regla de negocio de la tesis

### Función elegida: `convertCurrency`

La plataforma permite cargar deudas en distintas monedas (ARS, USD, EUR, BRL, CLP, UYU). Para mostrar totales y gráficos en una sola moneda, el dashboard convierte cada monto con las cotizaciones del día. Esa conversión la hace `convertCurrency`, y la usan las tarjetas de totales, el balance por grupo, los gráficos por categoría y por mes, y el resumen que se comparte por WhatsApp. Si esta función falla, todos los totales de la aplicación quedan mal.

Archivo `src/utils/convert-currency.js`:

```js
export function convertCurrency(amount, from, to, rates) {
    if (from === to) return amount;
    if (!rates) return null;

    const toARS = from === 'ARS' ? amount : rates[from] != null ? amount * rates[from] : null;

    if (toARS === null) return null;

    if (to === 'ARS') return toARS;

    return rates[to] != null ? toARS / rates[to] : null;
}
```

Regla: las cotizaciones (`rates`) expresan cuántos pesos vale una unidad de cada moneda. Toda conversión pasa por ARS: primero se lleva el monto a pesos y después a la moneda de destino. Si no hay cotizaciones, o falta la de alguna de las dos monedas, la función devuelve `null`. Así la interfaz no muestra un número falso.

### Pruebas: `src/utils/convert-currency.test.js`

```js
import { describe, expect, it } from 'vitest';

import { convertCurrency } from '@/utils/convert-currency';

const rates = { USD: 1000, EUR: 1100, BRL: 200 };

describe('convertCurrency', () => {
    describe('camino feliz', () => {
        it('convierte de una moneda extranjera a ARS multiplicando por la cotización', () => {
            expect(convertCurrency(50, 'USD', 'ARS', rates)).toBe(50000);
        });

        it('convierte de ARS a una moneda extranjera dividiendo por la cotización', () => {
            expect(convertCurrency(25000, 'ARS', 'USD', rates)).toBe(25);
        });

        it('convierte entre dos monedas extranjeras pasando por ARS', () => {
            expect(convertCurrency(11, 'EUR', 'USD', rates)).toBeCloseTo(12.1);
        });

        it('devuelve el mismo monto si la moneda de origen y destino coinciden', () => {
            expect(convertCurrency(123.45, 'USD', 'USD', rates)).toBe(123.45);
        });
    });

    describe('casos de borde y error', () => {
        it('devuelve null si todavía no se cargaron las cotizaciones', () => {
            expect(convertCurrency(100, 'USD', 'ARS', null)).toBeNull();
            expect(convertCurrency(100, 'USD', 'ARS', undefined)).toBeNull();
        });

        it('devuelve null si falta la cotización de la moneda de origen', () => {
            expect(convertCurrency(100, 'CLP', 'ARS', rates)).toBeNull();
        });

        it('devuelve null si falta la cotización de la moneda de destino', () => {
            expect(convertCurrency(100, 'USD', 'UYU', rates)).toBeNull();
        });

        it('convierte un monto en cero sin perder el resultado', () => {
            expect(convertCurrency(0, 'USD', 'ARS', rates)).toBe(0);
        });

        it('no necesita cotizaciones cuando no hay conversión que hacer', () => {
            expect(convertCurrency(100, 'ARS', 'ARS', null)).toBe(100);
        });
    });
});
```

- **Camino feliz:** con cotizaciones válidas, 50 USD a $1000 dan $50.000. $25.000 son 25 USD. 11 EUR (= $12.100) son 12,1 USD. En este último caso uso `toBeCloseTo` porque es una división con decimales.
- **Casos de borde y error:** si las cotizaciones todavía no llegaron de la API (`null`/`undefined`), o si falta una moneda (CLP, UYU), la función devuelve `null` en lugar de `NaN` o un número inventado. Probé además el límite del monto `0`, que no debe confundirse con "sin resultado". También probé que, cuando las monedas son iguales, no hacen falta cotizaciones.

### Resultado de la ejecución

`npx vitest run src/utils/convert-currency.test.js --reporter=verbose`:

```
 RUN  v5.1.0 D:/proyectos_react/web-plataformas-de-desarrollo

 ✓ src/utils/convert-currency.test.js > convertCurrency > camino feliz > convierte de una moneda extranjera a ARS multiplicando por la cotización 1ms
 ✓ src/utils/convert-currency.test.js > convertCurrency > camino feliz > convierte de ARS a una moneda extranjera dividiendo por la cotización 0ms
 ✓ src/utils/convert-currency.test.js > convertCurrency > camino feliz > convierte entre dos monedas extranjeras pasando por ARS 0ms
 ✓ src/utils/convert-currency.test.js > convertCurrency > camino feliz > devuelve el mismo monto si la moneda de origen y destino coinciden 0ms
 ✓ src/utils/convert-currency.test.js > convertCurrency > casos de borde y error > devuelve null si todavía no se cargaron las cotizaciones 0ms
 ✓ src/utils/convert-currency.test.js > convertCurrency > casos de borde y error > devuelve null si falta la cotización de la moneda de origen 0ms
 ✓ src/utils/convert-currency.test.js > convertCurrency > casos de borde y error > devuelve null si falta la cotización de la moneda de destino 0ms
 ✓ src/utils/convert-currency.test.js > convertCurrency > casos de borde y error > convierte un monto en cero sin perder el resultado 0ms
 ✓ src/utils/convert-currency.test.js > convertCurrency > casos de borde y error > no necesita cotizaciones cuando no hay conversión que hacer 0ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
```

> Captura: insertar aquí la captura de la terminal después de correr el comando anterior.

## 4. Cierre y aplicación

Voy a correr las pruebas en tres momentos. Mientras programo, con `npm run test:watch` abierto: cada vez que guardo un archivo se repiten las pruebas afectadas y me entero enseguida si rompí algo. Antes de cada commit, con `npm test` junto con `npm run lint`, para no subir al repositorio código que haga fallar una regla que ya funcionaba. Y cada vez que cambio una regla de negocio compartida con la app Flutter o con la API, como la conversión de monedas: si la regla cambia, primero actualizo la prueba con el nuevo comportamiento esperado y después el código. El siguiente paso sería correrlas automáticamente en cada push con GitHub Actions, para que ninguna versión llegue a producción con pruebas en rojo.
