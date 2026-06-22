# Changelog

Todos los cambios notables de **GeoARTE Web** se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [0.1.0] — 2026-06-22

### Añadido

- Plataforma web GEO ARTE CDMX con mapa territorial, dashboard, reportes, investigación y políticas.
- Panel de administración para rol Autoridad.
- Integración con Supabase (Auth, PostgreSQL, Storage).
- API pública v1 y API interna de datos.
- Documentación organizada en `docs/cliente/` y `docs/tecnico/`.
- Scripts de operación (`seed:mapa`, `sync:mapa`) y generación de PDFs.
- Script de empaquetado de entrega (`npm run build:entrega`).
- Migraciones SQL versionadas en `supabase/migrations/`.

### Organización

- Reestructuración de documentación para entrega al cliente y GitHub.
- Separación de scripts en `scripts/ops/` y `scripts/docs/`.
- README, CHANGELOG e índice de entrega actualizados.

---

[0.1.0]: https://github.com/ORGANIZACION/geoarte-web/releases/tag/v0.1.0
