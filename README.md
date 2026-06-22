# GeoARTE Web

Plataforma web para visualizar, analizar y gestionar la infraestructura cultural de las 16 alcaldías de la Ciudad de México (**GEO ARTE CDMX**).

Stack: **Next.js 16** · **React 19** · **TypeScript** · **Supabase** · **Leaflet**

---

## Características

- Mapa territorial interactivo con capas de alcaldías, transporte y espacios culturales
- Dashboard de KPIs y gráficos estadísticos
- Centro de reportes con plantillas configurables
- Repositorio de investigación cualitativa
- Recomendaciones de políticas públicas
- Panel de administración (rol Autoridad)
- API pública v1 para integraciones externas

---

## Requisitos

- Node.js 20 LTS
- npm 10+
- Proyecto Supabase (PostgreSQL + Auth + Storage)

---

## Inicio rápido

```bash
npm install
cp .env.example .env.local   # editar con credenciales Supabase
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Para instalación completa, migraciones y seeds del mapa, consulte [docs/tecnico/INSTALACION.md](docs/tecnico/INSTALACION.md).

---

## Scripts principales

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Análisis estático ESLint |
| `npm run seed:mapa` | Carga geometrías y transporte a Supabase |
| `npm run sync:mapa` | Sincroniza métricas del mapa |
| `npm run docs:pdf` | Genera PDFs de documentación |
| `npm run build:entrega` | Crea ZIP de entrega al cliente en `dist/` |

---

## Estructura del proyecto

```
geoarte-web/
├── src/                 # Aplicación Next.js (App Router, API, componentes)
├── supabase/            # Migraciones y seeds SQL
├── scripts/
│   ├── ops/             # Seeds, sync, migraciones, entrega
│   └── docs/            # Generación de PDFs
├── docs/
│   ├── cliente/         # Manuales para el cliente
│   └── tecnico/         # Instalación, despliegue, arquitectura
├── public/              # Assets estáticos
└── .env.example         # Plantilla de variables de entorno
```

---

## Documentación

| Audiencia | Enlace |
|-----------|--------|
| Índice general | [docs/README.md](docs/README.md) |
| Entrega al cliente | [docs/cliente/INDICE-ENTREGA.md](docs/cliente/INDICE-ENTREGA.md) |
| Manual de usuario | [docs/cliente/MANUAL-USUARIO.md](docs/cliente/MANUAL-USUARIO.md) |
| Instalación | [docs/tecnico/INSTALACION.md](docs/tecnico/INSTALACION.md) |
| Despliegue | [docs/tecnico/DESPLIEGUE.md](docs/tecnico/DESPLIEGUE.md) |
| Arquitectura | [docs/tecnico/ARQUITECTURA-APLICACION.md](docs/tecnico/ARQUITECTURA-APLICACION.md) |

---

## Despliegue

Compatible con **Vercel** (recomendado) o cualquier hosting Node.js. Ver [docs/tecnico/DESPLIEGUE.md](docs/tecnico/DESPLIEGUE.md).

---

## Licencia

Software privado — uso restringido al cliente SECTEI / GEO ARTE CDMX.
