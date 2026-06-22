# Instalación — GeoARTE Web

**Versión:** 0.1.0 · **Proyecto:** `geoarte-web`

---

## 1. Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js | 20.x LTS |
| npm | 10.x |
| Cuenta Supabase | Proyecto con PostgreSQL y Auth habilitados |

Opcional: Git para clonar el repositorio.

---

## 2. Obtener el código

```bash
git clone <URL_DEL_REPOSITORIO> geoarte-web
cd geoarte-web
```

Si recibe un paquete ZIP de entrega, descomprímalo y entre en la carpeta del proyecto.

---

## 3. Instalar dependencias

```bash
npm install
```

---

## 4. Variables de entorno

Copie la plantilla y edite los valores:

```bash
cp .env.example .env.local
```

En Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

### Variables obligatorias (producción)

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anónima |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (auth redirects) |

### Variables para scripts y administración

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (seeds, sync, panel admin) |

### Variables opcionales

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_ANIO_CORTE_METRICAS` | Año de corte de métricas |
| `TRANSPORTE_CAPA_SOURCE` | Fuente de capa de transporte (`auto`, `geojson`, `supabase`) |
| `GEOARTE_API_TOKEN` | Token de la API pública v1 |
| `GEOARTE_API_REQUIRE_TOKEN` | Exigir token en API v1 (`true`/`false`) |

> **Importante:** Nunca suba `.env` o `.env.local` a GitHub. Solo `.env.example` debe estar en el repositorio.

---

## 5. Base de datos Supabase

1. Cree un proyecto en [Supabase](https://supabase.com).
2. Aplique las migraciones SQL en orden desde `supabase/migrations/` (ver [supabase/README.md](../../supabase/README.md)).
3. Configure en Supabase → Authentication → URL Configuration:
   - **Site URL:** valor de `NEXT_PUBLIC_SITE_URL`
   - **Redirect URLs:** incluya `/auth/callback` y rutas de recuperación de contraseña.

---

## 6. Carga inicial del mapa (primer despliegue)

Con `SUPABASE_SERVICE_ROLE_KEY` configurada:

```bash
npm run seed:mapa
npm run sync:mapa
```

Consulte [OPERACION-MAPA.md](OPERACION-MAPA.md) para el detalle operativo.

---

## 7. Ejecutar en desarrollo

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Si el puerto 3000 está ocupado, Next.js usará otro puerto; ajuste `NEXT_PUBLIC_SITE_URL` en consecuencia.

---

## 8. Verificar la instalación

```bash
npm run lint
npm run build
```

Si el build termina sin errores, la instalación es correcta.

---

## 9. Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción |
| `npm run seed:mapa` | Carga geometrías y transporte |
| `npm run sync:mapa` | Sincroniza métricas del mapa |
| `npm run diagnostico:padron` | Diagnóstico del padrón de espacios |

---

## Documentación relacionada

- [Despliegue en producción](DESPLIEGUE.md)
- [Arquitectura completa](ARQUITECTURA-APLICACION.md)
- [Índice de entrega al cliente](../cliente/INDICE-ENTREGA.md)
