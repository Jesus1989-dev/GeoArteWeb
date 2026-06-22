# Documentación — GeoARTE Web

Índice central de la documentación del proyecto **GEO ARTE CDMX**.

---

## Para el cliente (usuarios y responsables)

| Documento | Formato | Descripción |
|-----------|---------|-------------|
| [Índice de entrega](cliente/INDICE-ENTREGA.md) | MD | Portada del paquete de entrega |
| [Manual de usuario](cliente/MANUAL-USUARIO.md) | [MD](cliente/MANUAL-USUARIO.md) · [PDF](cliente/MANUAL-USUARIO.pdf) | Funcionalidades, perfiles y navegación |
| [Panel de administración](cliente/PANEL-ADMINISTRACION.md) | [MD](cliente/PANEL-ADMINISTRACION.md) · [PDF](cliente/PANEL-ADMINISTRACION.pdf) | Guía del panel admin |
| [Control de capas del mapa](cliente/CONTROL-DE-CAPAS-MAPA.md) | [MD](cliente/CONTROL-DE-CAPAS-MAPA.md) · [PDF](cliente/CONTROL-DE-CAPAS-MAPA.pdf) | Capas del mapa territorial |

---

## Para el equipo técnico

| Documento | Formato | Descripción |
|-----------|---------|-------------|
| [Arquitectura y stack](tecnico/ARQUITECTURA-APLICACION.md) | [MD](tecnico/ARQUITECTURA-APLICACION.md) · [PDF](tecnico/ARQUITECTURA-APLICACION.pdf) | Stack, API, BD y diagramas |
| [Arquitectura MVC (desarrollo)](tecnico/ARQUITECTURA-DESARROLLO.md) | MD | Convenciones de código |
| [Operación del mapa](tecnico/OPERACION-MAPA.md) | MD | Seeds, sync y capas |
| [Instalación](tecnico/INSTALACION.md) | MD | Requisitos e instalación local |
| [Despliegue](tecnico/DESPLIEGUE.md) | MD | Producción en Vercel/Node |
| [Supabase](../supabase/README.md) | MD | Migraciones y seeds SQL |

---

## Generar PDFs

Desde la raíz del proyecto:

```bash
npm run docs:pdf
```

Genera los PDFs a partir de los archivos Markdown en `docs/cliente/` y `docs/tecnico/`.

---

## Estructura de carpetas

```
docs/
├── README.md           ← este índice
├── cliente/            ← entrega al cliente (manuales)
└── tecnico/            ← instalación, despliegue, arquitectura
```
