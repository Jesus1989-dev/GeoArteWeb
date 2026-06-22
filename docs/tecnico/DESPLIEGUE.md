# Despliegue — GeoARTE Web

**Versión:** 0.1.0 · **Plataforma recomendada:** Vercel + Supabase

---

## 1. Resumen del proceso

1. Aplicar migraciones SQL en Supabase.
2. Configurar variables de entorno en el hosting.
3. Ejecutar seeds del mapa (primera vez).
4. Configurar URLs de autenticación en Supabase.
5. Desplegar la aplicación Next.js.

---

## 2. Supabase (backend)

### Migraciones

Ejecute en orden cronológico todos los archivos de `supabase/migrations/` en el SQL Editor de Supabase o con la CLI de Supabase.

Ver [supabase/README.md](../../supabase/README.md).

### Seeds opcionales

Los archivos `supabase/seed-*.sql` contienen datos de referencia (fuentes de información, participación por edad). Aplíquelos según necesidad del entorno.

### Auth

En **Authentication → URL Configuration**:

| Campo | Valor ejemplo |
|-------|---------------|
| Site URL | `https://geoarte.ejemplo.gob.mx` |
| Redirect URLs | `https://geoarte.ejemplo.gob.mx/auth/callback` |

Debe coincidir con `NEXT_PUBLIC_SITE_URL` en el hosting.

### Storage

La migración `20260530_storage_avatars_bucket.sql` crea el bucket de avatares. Verifique que las políticas RLS estén activas.

---

## 3. Vercel (recomendado)

El proyecto incluye `vercel.json` con framework `nextjs`.

### Pasos

1. Importe el repositorio en [Vercel](https://vercel.com).
2. Configure las variables de entorno (mismas que `.env.example`, con valores de producción).
3. Despliegue automático en cada push a la rama principal.

### Variables críticas en Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` solo se usa en build-time si algún script lo requiere; en runtime la app usa la clave anónima en el cliente y la service role en rutas admin del servidor.

---

## 4. Hosting Node.js alternativo

Cualquier servidor con Node.js 20+:

```bash
npm ci
npm run build
npm run start
```

Exponga el puerto configurado (por defecto 3000). Use un reverse proxy (nginx, Caddy) con HTTPS.

---

## 5. Post-despliegue (primera vez)

Desde una máquina con acceso a las credenciales de servicio:

```bash
npm run seed:mapa
npm run sync:mapa
```

Verifique en Supabase:

```sql
select count(*) from territorio_geometria;
select count(*) from metricas_alcaldia;
```

---

## 6. Sincronización periódica

Tras actualizar el padrón de espacios culturales:

```bash
npm run sync:mapa
```

También disponible desde **Admin → Capas del mapa → Sincronizar ahora** (rol Autoridad).

Considere programar `sync:mapa` con un cron o GitHub Action si el padrón se actualiza con frecuencia.

---

## 7. Checklist de producción

- [ ] Migraciones SQL aplicadas
- [ ] Variables de entorno configuradas (sin secretos en el repo)
- [ ] `NEXT_PUBLIC_SITE_URL` coincide con Supabase Auth
- [ ] `npm run build` exitoso
- [ ] Seeds del mapa ejecutados
- [ ] Login, registro y recuperación de contraseña probados
- [ ] Panel admin accesible solo para rol Autoridad
- [ ] HTTPS activo en el dominio de producción

---

## 8. CI (GitHub Actions)

El repositorio incluye `.github/workflows/ci.yml` que ejecuta `lint` y `build` en cada push y pull request.

---

## Documentación relacionada

- [Instalación local](INSTALACION.md)
- [Operación del mapa](OPERACION-MAPA.md)
- [Arquitectura y API](ARQUITECTURA-APLICACION.md)
