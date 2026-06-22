# Operación del mapa territorial — GeoARTE Web

Guía para cargar geometrías, sincronizar métricas y operar las capas del mapa interactivo.

---

## Requisitos previos

Tras aplicar las migraciones en `supabase/migrations/` (métricas, geometrías, transporte y `mapa_sync_log`), configura en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (requerida para scripts y panel admin)

Opcional: `NEXT_PUBLIC_ANIO_CORTE_METRICAS` para fijar el año de las métricas por alcaldía.

Consulte [INSTALACION.md](INSTALACION.md) para el detalle de variables de entorno.

---

## Carga inicial desde GeoJSON

```bash
npm run seed:mapa
```

Equivale a `seed:territorio` + `seed:transporte`. Carga:

- Polígonos de alcaldías desde `src/data/geo/cdmx-alcaldias.geojson`
- Líneas de referencia de transporte masivo (Metro / Metrobús)

Ejecutar cuando cambien esos archivos GeoJSON o en el primer despliegue.

Comandos individuales:

```bash
npm run seed:territorio
npm run seed:transporte
```

---

## Sincronización de métricas y macrozonas

Recalcula `metricas_alcaldia` desde el padrón georreferenciado y regenera macrozonas con `sync_macrozonas_desde_alcaldias`:

```bash
npm run sync:mapa
```

Úsalo tras importar o actualizar espacios culturales, o en un cron programado.

También puedes sincronizar desde el panel **Admin → Capas del mapa → Sincronizar ahora** (requiere sesión con rol Autoridad).

---

## Verificación rápida en Supabase

```sql
select tipo, count(*) from territorio_geometria group by tipo;
select count(*) from metricas_alcaldia;
select id, nombre from capa_transporte_linea;
select accion, ejecutado_en from mapa_sync_log order by ejecutado_en desc limit 5;
```

---

## Capa de transporte (API del mapa)

El mapa consume trazos detallados vía:

```http
GET /api/data/mapa/transporte
GET /api/data/mapa/transporte?source=geojson
GET /api/data/mapa/transporte?source=supabase
```

Por defecto (`auto`) usa GeoJSON empaquetado en `src/data/geo/cdmx-metro-lineas.geojson` y `cdmx-metrobus-lineas.geojson`.

API pública v1 (con token si está configurado):

```http
GET /api/v1/layers/transporte
```

Variable opcional en `.env.local`:

```bash
# auto | geojson | supabase | fallback
TRANSPORTE_CAPA_SOURCE=auto
```

Tras actualizar los GeoJSON, vuelve a cargar Supabase con:

```bash
npm run seed:transporte
```

---

## Documentación relacionada

- [Control de capas del mapa](../cliente/CONTROL-DE-CAPAS-MAPA.md) — guía funcional del panel de capas.
- [Arquitectura de desarrollo](ARQUITECTURA-DESARROLLO.md) — patrón MVC del código.
