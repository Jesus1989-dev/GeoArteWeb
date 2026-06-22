# Supabase — GeoARTE Web

Esquema SQL, migraciones y seeds para el backend PostgreSQL de GEO ARTE CDMX.

---

## Estructura

```
supabase/
├── migrations/          # Migraciones versionadas (aplicar en orden)
├── seed-fuentes-informacion.sql
└── seed-participacion-edad.sql
```

---

## Aplicar migraciones

### Opción A — SQL Editor (Supabase Dashboard)

1. Abra **SQL Editor** en su proyecto Supabase.
2. Ejecute cada archivo de `migrations/` **en orden cronológico** (prefijo `YYYYMMDD_`).
3. Verifique que no haya errores antes de continuar con el siguiente archivo.

### Opción B — Supabase CLI

```bash
supabase db push
```

Requiere tener la CLI configurada y vinculada al proyecto remoto.

---

## Migraciones incluidas

| Archivo | Contenido |
|---------|-----------|
| `20260529_fuentes_informacion.sql` | Fuentes de información |
| `20260529_consultas_contacto.sql` | Consultas de contacto |
| `20260529_contacto_centro_config.sql` | Configuración del centro de contacto |
| `20260529_politicas_recomendaciones.sql` | Recomendaciones de políticas |
| `20260529_politicas_centro_config.sql` | Config del centro de políticas |
| `20260529_recursos_cualitativos.sql` | Recursos cualitativos |
| `20260529_reporte_plantillas.sql` | Plantillas de reportes |
| `20260529_export_downloads_xlsx.sql` | Exportaciones XLSX |
| `20260530_mapa_geometrias_territoriales.sql` | Geometrías territoriales |
| `20260530_mapa_capa_transporte.sql` | Capa de transporte |
| `20260530_mapa_transporte_force2d.sql` | Corrección 2D transporte |
| `20260530_mapa_metricas_territoriales.sql` | Métricas por alcaldía |
| `20260530_mapa_sync_log.sql` | Log de sincronización del mapa |
| `20260530_storage_avatars_bucket.sql` | Bucket de avatares |
| `20260604_profiles_name_fields.sql` | Campos de nombre en perfiles |

> Las tablas base (`espacios_culturales`, `profiles`, etc.) deben existir previamente en el proyecto Supabase compartido con SECTEI.

---

## Seeds opcionales

Ejecute manualmente si necesita datos de referencia:

```sql
-- Contenido de seed-fuentes-informacion.sql
-- Contenido de seed-participacion-edad.sql
```

---

## Post-migración: mapa territorial

Desde la raíz del proyecto Node.js:

```bash
npm run seed:mapa
npm run sync:mapa
```

Ver [docs/tecnico/OPERACION-MAPA.md](../docs/tecnico/OPERACION-MAPA.md).

---

## Verificación

```bash
node scripts/ops/check-supabase-migrations.mjs
```

Requiere `.env` con `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
