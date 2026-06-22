# Índice de entrega — GEO ARTE CDMX

**Proyecto:** GeoARTE Web (`geoarte-web`)  
**Versión:** 0.1.0  
**Fecha de entrega:** junio 2026

---

## 1. Descripción del producto

**GEO ARTE CDMX** es una plataforma web para visualizar, analizar y gestionar la infraestructura cultural de las 16 alcaldías de la Ciudad de México. Incluye mapa territorial interactivo, dashboard de KPIs, reportes, repositorio de investigación, recomendaciones de políticas públicas y panel de administración.

---

## 2. Contenido de esta entrega

### Documentación para usuarios

| Documento | Descripción |
|-----------|-------------|
| [Manual de usuario](MANUAL-USUARIO.md) ([PDF](MANUAL-USUARIO.pdf)) | Guía de funcionalidades para ciudadanos, investigadores y autoridades |
| [Panel de administración](PANEL-ADMINISTRACION.md) ([PDF](PANEL-ADMINISTRACION.pdf)) | Operación del panel admin |
| [Control de capas del mapa](CONTROL-DE-CAPAS-MAPA.md) ([PDF](CONTROL-DE-CAPAS-MAPA.pdf)) | Gestión de capas del mapa |

### Documentación técnica (instalación y operación)

| Documento | Descripción |
|-----------|-------------|
| [Instalación](../tecnico/INSTALACION.md) | Requisitos, variables de entorno e instalación |
| [Despliegue](../tecnico/DESPLIEGUE.md) | Puesta en producción (Vercel + Supabase) |
| [Arquitectura](../tecnico/ARQUITECTURA-APLICACION.md) ([PDF](../tecnico/ARQUITECTURA-APLICACION.pdf)) | Stack tecnológico, API y base de datos |

### Código fuente

El código fuente completo se entrega en el repositorio Git o en el paquete ZIP `dist/geoarte-entrega-v0.1.0.zip` (generado con `npm run build:entrega`).

Estructura principal:

- `src/` — aplicación Next.js (frontend + API)
- `supabase/` — migraciones y seeds de base de datos
- `scripts/` — utilidades de operación y documentación
- `.env.example` — plantilla de configuración (sin secretos)

---

## 3. Requisitos del entorno destino

- Node.js 20 LTS
- Proyecto Supabase (PostgreSQL + Auth + Storage)
- Hosting compatible con Next.js 16 (Vercel recomendado)

---

## 4. Inicio rápido para el equipo técnico

```bash
npm install
cp .env.example .env.local   # editar con credenciales Supabase
# Aplicar migraciones en supabase/migrations/
npm run seed:mapa
npm run dev
```

Consulte [INSTALACION.md](../tecnico/INSTALACION.md) para el procedimiento completo.

---

## 5. Perfiles de acceso

| Rol | Acceso principal |
|-----|------------------|
| Ciudadano | Consulta pública, perfil personal |
| Investigador | Consulta + repositorio de investigación |
| Autoridad | Todo lo anterior + panel de administración |

---

## 6. Soporte y contacto

Para soporte técnico post-entrega, contacte al equipo de desarrollo que realizó la implementación.

---

*Documento de entrega — GEO ARTE CDMX · SECTEI*
