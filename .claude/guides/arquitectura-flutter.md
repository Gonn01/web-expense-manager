# Arquitectura — App Flutter (`app_expense_manager`)

Cómo está organizada la app móvil y cómo se construye una feature atravesando todas las capas.

Stack: `flutter_bloc` (solo Cubit), `flutter_modular` (DI), `go_router`, `dio`, `flutter_secure_storage`, Firebase (auth con Google y analytics), `pusher_channels_flutter`, `flutter gen-l10n`.

El patrón viene de otra app, de la que este proyecto es un port. Si aparece código o documentación con los nombres originales, la equivalencia es: `almundo_*` → `em_*`, `AlmundoException` → `AppException`, `moebius` / `MB*` / `ALM*` → `em_design` / `Em*`, `Modular.get<T>()` → `di<T>()`.

## 1. Monorepo

Monorepo Flutter gestionado con Melos. La app ejecutable vive en la **raíz** del repo (`lib/`); la lógica está repartida en paquetes locales bajo `packages/`.

| Paquete | Rol |
| --- | --- |
| raíz (`lib/`) | Presentación: pantallas, navegación, widgets, l10n, bootstrap. Única app ejecutable. |
| `em_services` | Estado y lógica de negocio: Cubits + States. |
| `em_repositories` | Acceso a datos: interfaz + implementación por dominio. Traduce dominio → parámetros del provider. |
| `em_http_providers` | Llamadas HTTP reales con Dio. Una clase por dominio de la API. Devuelve modelos ya parseados. |
| `em_firebase_providers` | Firebase Analytics y Google Sign-In. |
| `em_models` | Modelos de datos puros (`form/`, `response/`, `common/`). Sin lógica de negocio. |
| `em_core` | Transversal: configuración, `DioFactory`, interceptores, `AppException`, `AuthenticationState`, almacenamiento seguro. |
| `em_design` | Design system: componentes `Em*`, `EmColors`, `EmSizes`, `EmTheme`. Solo lo usa la app raíz. |

Comandos: `melos bootstrap`, `melos run build` (bootstrap + gen-l10n), `melos run analyze`, `melos run gen-l10n`.

## 2. Capas y regla de dependencias

El flujo es unidireccional. Cada capa solo conoce a la de abajo.

```
UI            (lib/)                 renderiza, provee el Cubit, escucha estados
  ↓
Services      (em_services)          Cubit + State: estado, validaciones, reintento, log de errores
  ↓
Repositories  (em_repositories)      interfaz + impl: traduce dominio → primitivos
  ↓
Providers     (em_http_providers,    ejecuta la llamada, parsea a modelo,
               em_firebase_providers) normaliza errores a AppException
  ↓
Core          (em_core)              config, Dio, interceptores, excepciones

em_models lo importan todas las capas. em_core no depende de ninguna.
```

Reglas duras:

- La UI no conoce providers ni usa Dio. Única excepción: la Page hace `di<XRepository>()` **solo** para pasárselo al constructor del Cubit.
- Los Cubits no conocen Dio, providers ni Firebase.
- Los repositories no conocen `.env`, flavors ni estado de UI.
- Los modelos no tienen dependencias externas ni lógica (solo `fromJson` / `toJson` / `copyWith` y getters derivados simples).
- Nunca al revés, nunca salteando capas.

## 3. Reglas por capa

### Models (`em_models`)

- Escritos a mano: `fromJson` / `toJson` / `copyWith`, `Equatable` en formularios. **No** hay freezed, json_serializable ni build_runner en este repo.
- `fromJson` nunca debe fallar por un campo faltante: cada campo con su valor por defecto (`as T? ?? default`; listas con `?.map(...).toList() ?? const []`).
- Las keys del JSON son las del backend (snake_case); el modelo expone camelCase.
- Campos que deben poder volver a `null` en `copyWith`: usar flags `reset<X>`.
- Exportar cada modelo nuevo en el barrel del paquete.

### HTTP providers (`em_http_providers`)

- Una clase por dominio, extiende `DioHttpProvider`. Un método por endpoint.
- Parámetros nombrados **primitivos** (`String`, `int`, `bool`, listas). No recibe modelos de dominio: esa traducción es del repository.
- Esqueleto fijo de cada método:

    ```dart
    try {
      final response = await client.get<Map<String, dynamic>>(url, queryParameters: {...});
      if (!isSuccessStatusCode(response.statusCode) || response.data == null) {
        throw AppException(...);
      }
      return XResponse.fromJson(response.data!);
    } on DioException catch (e) {
      throw parseDioError(e);
    } catch (e, st) {
      throw wrapUnknownError(e, st);
    }
    ```

- **Siempre** lanza `AppException`. Nunca un `DioException`, `TypeError` o `FormatException` crudo.
- Devuelve un modelo de `em_models`, nunca un `Map` ni un `Response`.
- Elegir la instancia de Dio se hace al registrar el provider, no dentro del provider.

### Repositories (`em_repositories`)

- Interfaz en `<dominio>_repository.dart`, implementación en `<dominio>_repository_impl.dart`: dos archivos, una clase cada uno.
- El Cubit depende solo de la interfaz, nunca de la impl.
- Toda transformación "modelo u objeto de UI → parámetros de API" ocurre acá, no en el provider ni en el Cubit.
- Un repo puede combinar varios providers o fuentes locales.

### Services (`em_services`)

- Solo `Cubit` (no Bloc con eventos). Dependencias por constructor.
- State: clase inmutable escrita a mano, con un enum `<Feature>Status` (`initial`, `loading`, `success`, `failure`, más los sub-flujos que hagan falta) y getters derivados para no meter lógica en la UI.
- `error` en `copyWith` es de un solo uso: se asigna **sin** `?? this.error`, así se limpia en el siguiente `emit`.
- Toda operación asíncrona:

    ```dart
    _lastFailedAction = () => fetch(id);
    emit(state.copyWith(status: XStatus.loading));
    try {
      final data = await _repository.algo(id);
      emit(state.copyWith(status: XStatus.success, data: data));
    } on AppException catch (e) {
      logError(e);
      emit(state.copyWith(status: XStatus.failure, error: e));
    } on Exception catch (e) {
      final ex = AppException.generic(detail: e.toString());
      logError(ex);
      emit(state.copyWith(status: XStatus.failure, error: ex));
    }
    ```

- `AnalyticsErrorLoggerMixin` para `logError`. `_lastFailedAction` + `retry()` para que la UI pueda reintentar.
- El Cubit **no** navega, **no** muestra diálogos, **no** conoce `BuildContext`, **no** llama a `di<T>()`. Todo entra por constructor y sale por el State.
- Paginación: el tamaño de página lo dicta el backend en cada respuesta; no se fija localmente.

### App (`lib/`)

- **Page** = inyecta el Cubit; es el único lugar donde se crea. **View** = renderiza y escucha el estado; nunca crea Cubits ni toca repositories.

    ```dart
    class GastoDetallePage extends StatelessWidget {
      const GastoDetallePage({required this.gastoId, super.key});
      final int gastoId;

      @override
      Widget build(BuildContext context) => BlocProvider(
            create: (_) => GastoDetalleCubit(di<GastosRepository>(), di<AnalyticsRepository>())
              ..fetch(gastoId),
            child: _GastoDetalleView(gastoId: gastoId),
          );
    }
    ```

- La View consume el estado con `BlocBuilder` / `BlocConsumer`, usando `listenWhen` / `buildWhen` para afinar.
- Errores al usuario: un listener detecta `status == failure && error != null` y muestra el diálogo, **salvo** que `error.silent` sea `true`. El botón "Reintentar" llama a `cubit.retry()`.

## 4. Inyección de dependencias

`flutter_modular`, con un único `AppModule` (`lib/app_core/app_module.dart`) que llama a `injectCoreDependencies()` y a `injectServices()`. Cada paquete expone su propia extensión `inject*` sobre `Injector`, y cada una encadena a la de abajo:

```
injectServices() → injectRepositories() → injectFirebaseProviders() + injectHttpProviders()
```

- Provider: `addSingleton<XHttpProvider>(() => XHttpProvider(get<Dio>(key: ApiKeys.mainDio)))`.
- Repository: `addSingleton<XRepository>(XRepositoryImpl.new)`.
- Cubits **por página** (dashboard, detalles, cuentas, configuración): no se registran; los crea la Page con `BlocProvider(create:)`.
- Cubits **de larga vida** (entidades, categorías, compartidos, settlement, exchange_rates): se registran como singleton.

Hay dos instancias de Dio: `ApiKeys.mainDio` (API propia: interceptor de auth + `ApiErrorInterceptor` + `RetryInterceptor`) y `ApiKeys.ratesDio` (`dolarapi.com`, cotizaciones de USD/EUR/BRL/CLP/UYU, sin auth).

## 5. Navegación

- Un único `GoRouter` en `lib/app_core/router.dart`. No hay routers por feature.
- Las 5 pestañas (dashboard, entidades, compartidos, cuentas, configuración) viven en un `StatefulShellRoute.indexedStack`, que mantiene vivo el stack de cada una.
- El acceso se controla con un `redirect:` sobre `AuthenticationState`, que además es el `refreshListenable` del router: un cambio de sesión re-evalúa los redirects.
- Volver con datos: `Navigator.pop(context, valor)` y el que navegó hace `await` del push.

## 6. Manejo de errores

Tipo único de error: `AppException` (`em_core`). Cadena de normalización:

| Capa | Qué hace |
| --- | --- |
| Dio | `AuthInterceptor` agrega el token y, si un request con token vuelve con 401 (sesión vencida), llama a `AuthenticationState.expireSession()`: cierra la sesión, el router redirige al login y este muestra el cartel de sesión vencida (`sessionExpired`). `ApiErrorInterceptor` convierte el error estándar de la API (`{ error, code, details }`) en `AppException`. `RetryInterceptor` reintenta ante corte de conexión. |
| Provider | `parseDioError` / `wrapUnknownError`: todo sale como `AppException`. |
| Repository | Deja propagar. |
| Cubit | `on AppException` / `on Exception` → `logError` + `emit(failure, error)`. |
| UI | Listener muestra el diálogo respetando `error.silent`. |

Los `code` de error son los del catálogo de la API (`utils/errors.js`). Un código nuevo se agrega en la API, en la web y acá (ver [arquitectura-api.md](arquitectura-api.md)).

## 7. Convenciones de UI

- **L10n obligatorio.** Ningún texto visible escrito en el código: todo sale de `context.l10n.<clave>`. Fuentes en `lib/l10n/app_es.arb` (plantilla) y `lib/l10n/app_en.arb`. Al agregar un texto: clave en **ambos** `.arb` (con su bloque `@clave` si lleva placeholders) y `flutter gen-l10n`.
- `em_design` no conoce l10n: los componentes `Em*` reciben el texto por parámetro.
- **Una clase por archivo**, en todo el monorepo. Única excepción: un `StatefulWidget` y su `State` van juntos. Si encontrás una violación mientras tocás un archivo, separala.
    - Clase pública → archivo nuevo con su nombre en snake_case + export en el barrel del paquete.
    - Clase privada (`_Foo`) acoplada a otra → `library` / `part` / `part of`, para no tener que hacerla pública.
- **Widgets de una sola feature** → `lib/layout/<feature>/widgets/<nombre>.dart`, como `part of` la Page. La Page declara todos los imports y lista sus `part`; los archivos parte no tienen imports propios.
- **Widgets usados en dos o más features** → `lib/widgets/<nombre>.dart`, clase pública con sus propios imports. (`lib/layout/shared/` está en desuso: no agregar nada ahí.)

## 8. Checklist: feature nueva de punta a punta

- [ ] **Models**: `form/` si hay formulario, `response/` por cada endpoint. `fromJson` defensivo. Export en el barrel.
- [ ] **Provider**: método por endpoint con el esqueleto de §3, parámetros primitivos. Registrado en `http_providers_injector_extension.dart` con el Dio correcto.
- [ ] **Repository**: interfaz + impl en archivos separados. Registrado en `repositories_injector_extension.dart`.
- [ ] **Service**: `<feature>_cubit.dart` + `<feature>_state.dart`. Enum de status, `error` de un solo uso, `AnalyticsErrorLoggerMixin`, `_lastFailedAction` + `retry()`. Export en el barrel. Registrar solo si es de larga vida.
- [ ] **Page**: `lib/layout/<feature>/<feature>_page.dart`, solo la Page, con `library` + `part`.
- [ ] **View y widgets**: `widgets/<feature>_view.dart` y un archivo por widget hijo, todos `part of`.
- [ ] **L10n**: claves en `app_es.arb` y `app_en.arb`; regenerar.
- [ ] **Ruta** en `lib/app_core/router.dart`.
- [ ] **Errores**: listener con diálogo respetando `.silent`; reintento con `cubit.retry()`.
- [ ] **Paridad**: el mismo cambio funcional hecho en la web.
- [ ] **Documentación**: ver [documentacion.md](documentacion.md).

## 9. Trampas

- `build_runner` no genera modelos: no existe generación de código en este repo.
- `copyWith` con `?? this.x` impide volver un campo a `null`; para `error` y campos anulables usar asignación directa o flags `reset<X>` / `delete<X>`.
- Sin `PUSHER_KEY` la app funciona con pull-to-refresh; sin las variables de Firebase arranca igual, con Google Sign-In deshabilitado y analítica sin efecto. No asumir que están.
- URL de la API por `--dart-define=API_BASE_URL=...`. Por defecto `http://10.0.2.2:3000/api` (emulador Android contra localhost); en un dispositivo físico, la IP de la LAN.
- Canal de tiempo real: `compartidos-<userId>`, igual que en la web.
- No hay tests todavía (`test/` vacío).
