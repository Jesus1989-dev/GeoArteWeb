# Arquitectura y stack tecnológico — GEO ARTE CDMX

**Versión:** 1.0 · **Fecha:** junio 2026  
**Proyecto:** `geoarte-web` · **Plataforma:** aplicación web para inteligencia territorial cultural en CDMX

---

## 1. Resumen ejecutivo

**GEO ARTE CDMX** es una plataforma web para visualizar, analizar y gestionar la infraestructura cultural de las 16 alcaldías de la Ciudad de México. Permite consultar un mapa territorial interactivo, KPIs y gráficos estadísticos, generación de reportes, repositorio de investigación cualitativa, recomendaciones de políticas públicas y un panel de administración para perfiles con rol **Autoridad**.

La aplicación está construida como un **monolito full-stack** con **Next.js 16** (App Router), **React 19**, **TypeScript** y **Supabase** como backend (autenticación, base de datos PostgreSQL y almacenamiento). El mapa usa **Leaflet** con capas GeoJSON y datos sincronizados desde Supabase.

---

## 2. Stack tecnológico

### 2.1 Frontend y framework

| Herramienta | Versión | Uso |
|-------------|---------|-----|
| **Next.js** | 16.2.6 | Framework full-stack: rutas, SSR, API Routes, Server Actions |
| **React** | 19.2.4 | Biblioteca de interfaz de usuario |
| **TypeScript** | 5.x | Tipado estático en todo el código fuente |
| **Tailwind CSS** | 4.x | Estilos utilitarios y diseño responsivo |
| **PostCSS** | — | Procesamiento de CSS (`@tailwindcss/postcss`) |
| **Inter** (Google Fonts) | — | Tipografía principal vía `next/font` |
| **Lucide React** | 1.16 | Iconografía del sistema |

### 2.2 Backend y datos

| Herramienta | Versión | Uso |
|-------------|---------|-----|
| **Supabase** | — | Backend as a Service: PostgreSQL, Auth, Storage, RLS |
| **@supabase/supabase-js** | 2.106 | Cliente JavaScript para consultas y mutaciones |
| **@supabase/ssr** | 0.10 | Sesiones SSR en middleware y servidor Next.js |

### 2.3 Visualización y exportación

| Herramienta | Versión | Uso |
|-------------|---------|-----|
| **Leaflet** | 1.9.4 | Mapa interactivo (alcaldías, macrozonas, transporte, espacios) |
| **Recharts** | 3.8 | Gráficos del dashboard y secciones analíticas |
| **jsPDF** | 4.2 | Generación de PDF en cliente y scripts de documentación |
| **JSZip** | 3.10 | Empaquetado de archivos en exportaciones |
| **xlsx** | 0.18 | Exportación de datos a Excel |

### 2.4 Herramientas de desarrollo

| Herramienta | Uso |
|-------------|-----|
| **ESLint** | Linting con `eslint-config-next` |
| **Node.js** | Scripts de seed, sincronización y utilidades (`scripts/`) |
| **npm** | Gestor de paquetes y scripts del proyecto |

### 2.5 Fuentes de datos geográficos

- `src/data/geo/cdmx-alcaldias.geojson` — polígonos de las 16 alcaldías
- `src/data/geo/cdmx-metro-lineas.geojson` — líneas del Metro
- `src/data/geo/cdmx-metrobus-lineas.geojson` — líneas del Metrobús

---

## 3. Arquitectura de software

La aplicación sigue un patrón **Modelo · Vista · Controlador (MVC)** adaptado a Next.js y React.

### 3.1 Capas

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Modelo** | `src/lib/domain/`, `src/lib/data/` | Tipos de dominio, repositorios Supabase y datos mock |
| **Controlador** | `src/lib/services/`, `src/hooks/`, `src/actions/`, `*Controller.tsx` | Orquestación de datos, reglas de negocio y estado |
| **Vista** | `src/components/features/*/*View.tsx`, `shared/`, `layout/` | Presentación JSX; recibe datos por props |

### 3.2 Flujo por pantalla

```
app/[ruta]/page.tsx  →  *Controller.tsx  →  *.service.ts  →  lib/data/supabase | mock
                              ↓
                         *View.tsx (+ hooks si hay estado cliente)
```

- Las rutas en `src/app/` solo enrutan y definen metadata SEO.
- Los **servicios** (`src/lib/services/`) son el punto único para alternar entre datos mock y Supabase.
- Los **hooks** (`src/hooks/`) concentran estado interactivo (filtros, pestañas, formularios).
- Las **Server Actions** (`src/actions/`) gestionan mutaciones en servidor cuando aplica.

### 3.3 Modo demo vs. producción

La aplicación puede operar en dos modos:

| Modo | Condición | Comportamiento |
|------|-----------|----------------|
| **Demo** | Sin variables `NEXT_PUBLIC_SUPABASE_*` | Datos de ejemplo desde `src/lib/data/mock/` |
| **Supabase** | Credenciales configuradas en `.env.local` | Datos reales del padrón SECTEI, métricas y repositorio |

Si Supabase está configurado pero falla una consulta, muchas secciones degradan a modo demo con un aviso visual.

---

## 4. Estructura del proyecto

```
geoarte-web/
├── src/
│   ├── app/                    # Rutas Next.js (App Router)
│   │   ├── api/                # API Routes (REST interno y pública v1)
│   │   ├── admin/              # Panel de administración
│   │   ├── dashboard/          # Estadísticas y KPIs
│   │   ├── mapa/               # Explorador espacial
│   │   ├── reportes/           # Centro de reportes
│   │   ├── investigacion/      # Repositorio cualitativo
│   │   ├── politicas/          # Recomendaciones de política
│   │   ├── contacto/           # Soporte y API pública
│   │   ├── login, registro...  # Autenticación
│   │   ├── layout.tsx          # Layout raíz
│   │   └── globals.css         # Estilos globales y tokens de marca
│   ├── components/
│   │   ├── features/           # Módulos por pantalla (View + Controller)
│   │   ├── layout/             # Header, Footer, navegación
│   │   └── shared/             # Componentes reutilizables
│   ├── contexts/               # AuthProvider, ThemeProvider
│   ├── hooks/                  # Hooks de estado de UI
│   ├── lib/
│   │   ├── domain/             # Tipos e interfaces de dominio
│   │   ├── data/
│   │   │   ├── mock/           # Datos de demostración
│   │   │   └── supabase/       # Repositorios y clientes Supabase
│   │   ├── services/           # Capa de servicios (orquestación)
│   │   ├── dashboard/          # Lógica de filtros, exportación, KPIs
│   │   ├── mapa/               # Presets, estilos y geometrías del mapa
│   │   ├── reportes/           # Plantillas y generación de archivos
│   │   ├── auth/               # Control de acceso y sesión
│   │   └── api-v1/             # Utilidades de la API pública
│   ├── data/geo/               # GeoJSON de alcaldías y transporte
│   └── middleware.ts           # Protección de rutas y sesión Supabase
├── supabase/
│   └── migrations/             # Esquema SQL versionado (17 migraciones)
├── scripts/
│   ├── ops/                    # Seeds, sync del mapa, migraciones
│   └── docs/                   # Generación de PDFs de documentación
├── docs/
│   ├── cliente/                # Manuales y guías para el cliente
│   └── tecnico/                # Arquitectura, instalación y despliegue
├── package.json
├── next.config.ts
├── tsconfig.json
└── .env.example
```

---

## 5. Módulos funcionales

### 5.1 Pantallas principales

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/` | Inicio | KPIs, acceso rápido, explorador espacial |
| `/sobre-el-proyecto` | Proyecto | Metodología, fuentes y contexto institucional |
| `/mapa` | Mapa territorial | Visualización GIS con capas y filtros |
| `/dashboard` | Dashboard | Gráficos, comparadores y exportación del padrón |
| `/reportes` | Reportes | Plantillas configurables y descarga de informes |
| `/investigacion` | Investigación | Recursos cualitativos (entrevistas, estudios, etc.) |
| `/politicas` | Políticas | Recomendaciones y evidencia para política pública |
| `/contacto` | Soporte | Formulario, datasets y documentación de API |
| `/admin` | Administración | Gestión de espacios, usuarios, capas y configuración |
| `/perfil` | Mi perfil | Datos personales, historial y recursos guardados |

### 5.2 Autenticación

Rutas de autenticación gestionadas con Supabase Auth:

- `/login` — inicio de sesión
- `/registro` — alta de cuenta
- `/verificar-email` — confirmación de correo
- `/recuperar-contrasena` — solicitud de restablecimiento
- `/restablecer-contrasena` — nueva contraseña
- `/email-verificado` — confirmación post-verificación

El **middleware** (`src/middleware.ts`) renueva la sesión Supabase, redirige usuarios no autenticados y valida verificación de correo antes de acceder a la aplicación.

### 5.3 Perfiles de usuario (roles)

| Rol en Supabase | Rol en app | Permisos destacados |
|-----------------|------------|---------------------|
| Ciudadano | `ciudadano` | Consulta pública, perfil personal |
| Investigador | `investigador` | Igual que ciudadano + acceso a recursos de investigación |
| Autoridad | `autoridad` | Panel Admin, sincronización de mapa, gestión de usuarios |

La navegación filtra el ítem **Administración** para roles distintos de Autoridad.

---

## 6. API y endpoints

La aplicación expone **48 rutas API** organizadas en tres grupos:

### 6.1 API de datos interna (`/api/data/`)

Alimenta las pantallas del frontend con JSON:

- `/api/data/home` — KPIs de inicio
- `/api/data/dashboard` — métricas y series del dashboard
- `/api/data/mapa` — capas y geometrías territoriales
- `/api/data/mapa/transporte` — líneas de transporte masivo
- `/api/data/investigacion` — listado de recursos cualitativos
- `/api/data/politicas` — recomendaciones y métricas
- `/api/data/contacto` — configuración del centro de contacto
- `/api/data/admin` — datos agregados del panel admin

### 6.2 API de administración (`/api/admin/`)

Requiere sesión con rol Autoridad:

- Gestión de espacios culturales (`espacios`, flujo de publicación)
- Usuarios y roles (`usuarios`)
- Capas del mapa y sincronización (`mapa-capas`, `capas`)
- Plantillas de reportes (`reportes-plantillas`, `reportes-config`)
- Recursos cualitativos (`recursos-cualitativos`)
- Políticas y recomendaciones (`politicas-recomendaciones`, `politicas-config`)
- Consultas de contacto (`consultas-contacto`)
- Fuentes de información (`fuentes`)
- Logs de operación (`logs`)

### 6.3 API pública v1 (`/api/v1/`)

Expuesta en la sección de contacto para integraciones externas:

- `GET /api/v1/search` — búsqueda de espacios culturales
- `GET /api/v1/espacios/geojson` — espacios en formato GeoJSON
- `GET /api/v1/layers/transporte` — capa de transporte
- `GET /api/v1/alcaldias/[id]/stats` — estadísticas por alcaldía

Autenticación opcional mediante token (`GEOARTE_API_TOKEN`).

### 6.4 Exportaciones y reportes

- `/api/reportes/generar` — generación de informes
- `/api/reportes/descargar` — descarga de archivos generados
- `/api/politicas/export/brief` y `/informe` — exportación de políticas
- `/api/investigacion/export/recurso` — exportación de recursos

---

## 7. Base de datos (Supabase / PostgreSQL)

El esquema se versiona en `supabase/migrations/` con tablas principales para:

| Área | Tablas / objetos |
|------|------------------|
| Usuarios | `profiles` (rol, nombre, avatar) |
| Padrón cultural | Espacios georreferenciados, tipos, estados de publicación |
| Mapa territorial | `territorio_geometria`, `metricas_alcaldia`, `capa_transporte_linea` |
| Sincronización | `mapa_sync_log`, funciones de recálculo de macrozonas |
| Reportes | Plantillas, configuración, descargas (`export_downloads`) |
| Investigación | `recursos_cualitativos` con índices de búsqueda |
| Políticas | Recomendaciones, métricas y configuración del centro |
| Contacto | `consultas_contacto`, configuración del centro |
| Almacenamiento | Bucket `avatars` para fotos de perfil |

Las políticas **RLS (Row Level Security)** de Supabase controlan el acceso según el rol del usuario autenticado.

---

## 8. Mapa territorial — operación

### 8.1 Carga inicial (seed)

```bash
npm run seed:mapa
```

Carga polígonos de alcaldías y líneas de transporte desde GeoJSON hacia Supabase. Comandos individuales:

```bash
npm run seed:territorio
npm run seed:transporte
```

### 8.2 Sincronización de métricas

```bash
npm run sync:mapa
```

Recalcula `metricas_alcaldia` desde el padrón y regenera macrozonas. También disponible desde **Admin → Capas del mapa → Sincronizar ahora**.

### 8.3 Fuente de capa de transporte

Variable `TRANSPORTE_CAPA_SOURCE`:

- `auto` (por defecto) — GeoJSON empaquetado o Supabase según disponibilidad
- `geojson` — solo archivos locales
- `supabase` — solo base de datos

---

## 9. Variables de entorno

Copiar `.env.example` a `.env.local`:

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí (prod) | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí (prod) | Clave pública anónima |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | URL del sitio (auth redirects) |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts/admin | Clave de servicio para seeds y panel |
| `NEXT_PUBLIC_ANIO_CORTE_METRICAS` | Opcional | Año de corte de métricas |
| `TRANSPORTE_CAPA_SOURCE` | Opcional | Fuente de capa de transporte |
| `GEOARTE_API_TOKEN` | Opcional | Token de API pública v1 |

---

## 10. Scripts npm disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm run seed:mapa` | Carga geometrías y transporte a Supabase |
| `npm run sync:mapa` | Sincroniza métricas y macrozonas |
| `npm run diagnostico:padron` | Diagnóstico del padrón de espacios |

---

## 11. Diseño y experiencia de usuario

- **Tema claro/oscuro** gestionado por `ThemeProvider` y `ThemeScript` (sin flash en carga).
- **Tokens de marca** en CSS: navy institucional (`--geo-navy`), acento rosa (`--geo-pink`).
- **Layout responsivo** con barra superior, búsqueda cultural y pie de página.
- **Componentes compartidos**: tarjetas KPI, tablas admin, modales de formulario, campos de búsqueda.

---

## 12. Integración con el ecosistema SECTEI

GEO ARTE Web comparte convenciones con la aplicación móvil Flutter del proyecto SECTEI:

- Mismos roles de perfil (`Ciudadano`, `Investigador`, `Autoridad`)
- Mismas credenciales Supabase
- Año de corte de métricas alineado (`ANIO_CORTE_METRICAS`)
- Padrón georreferenciado de espacios culturales como fuente principal

---

## 13. Despliegue

La aplicación es compatible con despliegue en **Vercel** (recomendado para Next.js) o cualquier hosting Node.js que soporte `next start`.

Requisitos para producción:

1. Aplicar migraciones SQL en Supabase
2. Configurar variables de entorno
3. Ejecutar `npm run seed:mapa` en el primer despliegue
4. Configurar URLs de redirección en Supabase Auth
5. Ejecutar `npm run build` y desplegar el artefacto

---

## 14. Documentación relacionada

| Documento | Contenido |
|-----------|-----------|
| `docs/cliente/MANUAL-USUARIO.md` | Guía funcional para ciudadanos, investigadores y autoridades |
| `docs/tecnico/ARQUITECTURA-DESARROLLO.md` | Patrón MVC y convenciones de código |
| `docs/tecnico/OPERACION-MAPA.md` | Seeds, sincronización y capas del mapa |
| `docs/cliente/PANEL-ADMINISTRACION.md` | Panel de administración |
| `docs/cliente/CONTROL-DE-CAPAS-MAPA.md` | Gestión de capas del mapa territorial |
| `docs/tecnico/INSTALACION.md` | Requisitos e instalación local |
| `docs/tecnico/DESPLIEGUE.md` | Despliegue en producción |
| `README.md` | Inicio rápido del proyecto |

---

## 15. Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Navegador (cliente)                      │
│  React 19 + Tailwind + Leaflet + Recharts + jsPDF           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
┌──────────────────────────▼──────────────────────────────────┐
│                    Next.js 16 (servidor)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ App Router  │  │ API Routes   │  │ Middleware (auth)   │ │
│  │ page.tsx    │  │ /api/data    │  │ sesión Supabase     │ │
│  │ Controller  │  │ /api/admin   │  └─────────────────────┘ │
│  │ View        │  │ /api/v1      │                          │
│  └──────┬──────┘  └──────┬───────┘                          │
│         │                │                                   │
│  ┌──────▼────────────────▼──────────────────────────────┐ │
│  │              Services + Repositories                    │ │
│  └──────────────────────────┬───────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                      Supabase                              │
│  PostgreSQL · Auth · Storage · RLS · Edge Functions        │
└────────────────────────────────────────────────────────────┘
```

---

*Documento generado para el equipo de desarrollo e integración de GEO ARTE CDMX.*
