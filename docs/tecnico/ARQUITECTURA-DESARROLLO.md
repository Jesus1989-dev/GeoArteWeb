# Arquitectura MVC — GeoARTE Web

La aplicación sigue una separación **Modelo · Vista · Controlador** adaptada a Next.js y React.

## Capas

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Modelo** | `src/lib/domain/`, `src/lib/data/` | Tipos de dominio y acceso a datos (mocks hoy, Supabase mañana) |
| **Controlador** | `src/lib/services/`, `src/hooks/`, `src/actions/`, `*Controller.tsx` | Orquestar datos, estado de UI y reglas de aplicación |
| **Vista** | `src/components/features/*/*View.tsx`, `shared/`, `layout/` | Presentación: JSX y estilos; recibe datos por props |

## Flujo por pantalla

```
app/[ruta]/page.tsx  →  *Controller.tsx  →  *.service.ts  →  lib/data/mock
                              ↓
                         *View.tsx (+ hooks si hay estado cliente)
```

- Rutas en `src/app/` solo enrutan y definen metadata.
- **Servicios** (`lib/services/`) son el punto único para cambiar mock → API/Supabase.
- **Hooks** (`src/hooks/`) concentran estado interactivo (filtros, tabs).
- **Server Actions** (`src/actions/`) para mutaciones en servidor (p. ej. formulario de contacto).

## Añadir una feature nueva

1. Tipos en `lib/domain/`.
2. Datos en `lib/data/mock/` o `lib/data/supabase/`.
3. `lib/services/mi-feature.service.ts` con `getMiFeatureData()`.
4. `components/features/mi-feature/MiFeatureView.tsx` (solo UI).
5. `components/features/mi-feature/MiFeatureController.tsx` (orquestación).
6. `app/mi-feature/page.tsx` que renderiza el controlador.

## Compatibilidad

- `src/lib/mock-data/*` reexporta `lib/data/mock` (deprecado).
- `src/components/pages/*` reexporta los controladores (deprecado).

## Documentación relacionada

- [Operación del mapa territorial](OPERACION-MAPA.md) — seeds, sincronización y capas de transporte.
- [Arquitectura completa](ARQUITECTURA-APLICACION.md) — stack, API, base de datos y despliegue.
