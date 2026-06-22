# Panel de Administración — GEO ARTE CDMX

**Versión:** 1.0  
**Fecha:** junio 2026  
**Audiencia:** administradores con rol Autoridad  
**Módulo:** Panel de administración (`/admin`)

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Requisitos de acceso](#2-requisitos-de-acceso)
3. [Cómo carga los datos](#3-cómo-carga-los-datos)
4. [Estructura de la pantalla](#4-estructura-de-la-pantalla)
5. [Espacios culturales](#5-espacios-culturales)
6. [Estados del padrón](#6-estados-del-padrón)
7. [Flujo de trabajo recomendado](#7-flujo-de-trabajo-recomendado)
8. [Otras secciones del menú](#8-otras-secciones-del-menú)
9. [Modo Supabase vs modo demo](#9-modo-supabase-vs-modo-demo)
10. [Resumen ejecutivo](#10-resumen-ejecutivo)

---

## 1. Visión general

El **Panel de Administración** es el centro de control del padrón cultural de la CDMX. Desde aquí una cuenta con rol **Autoridad** puede:

- Consultar métricas del padrón (espacios, pendientes, capas, usuarios).
- Crear, editar y eliminar espacios culturales.
- Revisar calidad de datos y publicar espacios en el mapa público.
- Gestionar capas SIG, fuentes, políticas, investigación, reportes, consultas y usuarios.
- Auditar cambios en el historial de logs.

**Ruta:** `/admin`

---

## 2. Requisitos de acceso

| Condición | Resultado |
|-----------|-----------|
| Supabase configurado + rol **Autoridad** | Acceso completo al panel con datos reales |
| Supabase configurado + otro rol | Mensaje «Acceso restringido» |
| Sin sesión | Redirección a login (`?next=/admin`) |
| Sin Supabase en `.env.local` | Modo demo (datos ficticios, cambios en memoria) |

---

## 3. Cómo carga los datos

Al abrir `/admin`, la aplicación ejecuta este flujo:

```
AdminController  →  GET /api/data/admin  →  Supabase
```

**Qué trae la carga inicial:**

- Los 4 KPIs administrativos.
- El menú lateral con badges (p. ej. pendientes de calidad).
- La primera página del listado maestro de espacios.
- Metadatos de capas SIG y validaciones.

El badge verde **«Métricas Supabase»** confirma que los números vienen de la base real. Si aparece **«Modo demo»**, los datos son de demostración.

Las acciones posteriores (editar, publicar, sincronizar mapa, etc.) usan APIs protegidas bajo `/api/admin/*`, accesibles solo para Autoridad.

---

## 4. Estructura de la pantalla

### Cabecera

- Título **Panel de Administración**.
- Botón **Logs del Sistema** → abre la sección de auditoría.
- Botón **+ Nuevo Espacio** → modal de alta directa.

### KPIs (4 tarjetas)

| KPI | Origen |
|-----|--------|
| **Total Espacios** | Tabla `espacios_culturales` |
| **Pendientes** | Vista `v_sectei_validacion_datos` + evidencias en revisión |
| **Capas temáticas** | Catálogo `categorias_espacios` |
| **Usuarios registrados** | Tabla `profiles` |

### Menú lateral (Gestión de datos)

| Sección | Función principal |
|---------|-------------------|
| Espacios culturales | CRUD del padrón y publicación |
| Capas SIG | Catálogo de tipologías del mapa |
| Capas del mapa | Sincronización territorial al visor |
| Fuentes de información | Metadatos de procedencia |
| Políticas públicas | Recomendaciones en `/politicas` |
| Investigación cualitativa | Recursos del repositorio público |
| Centro de reportes | Plantillas de `/reportes` |
| Consultas de contacto | Buzón de `/contacto` |
| Usuarios | Alta y cambio de roles |
| Historial / logs | Auditoría consolidada |

### Bloque Validaciones

Muestra el contador de **pendientes** (campos incompletos y evidencias por revisar). Al hacer clic se abre el detalle de calidad del padrón.

---

## 5. Espacios culturales

Sección principal del panel. Incluye **tres pestañas**:

### 5.1 Listado maestro

- Tabla paginada desde `espacios_culturales` (20 registros por página).
- **Búsqueda** por ID o nombre (server-side con Supabase).
- Columnas: ID, nombre, alcaldía, tipo, estado, última modificación, acciones.

**Acciones por fila:**

| Icono | Acción |
|-------|--------|
| Lápiz | Abre modal de edición |
| Papelera | Elimina el espacio en Supabase |
| Tres puntos | Abre el editor cartográfico de ese espacio |

### 5.2 Flujo de revisión

Organiza espacios en dos columnas:

- **Borrador** — sin coordenadas válidas.
- **Revisión** — faltan horario, teléfono u otros datos mínimos.

Desde aquí se puede:

- Editar el espacio.
- Ir al **Editor mapa** (solo en columna Borrador).
- Pulsar **Publicar** cuando el espacio cumple los requisitos.

> **Nota:** No es un tablero Kanban con arrastrar y soltar; la publicación se hace con el botón **Publicar**.

### 5.3 Editor cartográfico

- Seleccionar un espacio del listado.
- Introducir **latitud** y **longitud** (WGS84) manualmente.
- **Guardar coordenadas** persiste en `espacios_culturales`.
- Vista previa embebida con OpenStreetMap.
- Enlace **Ver en mapa** para comprobar la ubicación en `/mapa`.

> **Nota:** No es un editor de mapa interactivo para dibujar puntos; las coordenadas se capturan por formulario.

---

## 6. Estados del padrón

El estado de cada espacio se **calcula automáticamente** según la calidad de sus datos:

```
Borrador  →  sin coordenadas válidas
Revisión  →  faltan horario, teléfono u otros campos
Publicado →  listo para aparecer en el mapa público
```

Solo los espacios **Publicados** y sincronizados aparecen en el mapa interactivo (`/mapa`).

---

## 7. Flujo de trabajo recomendado

```
1. Revisar KPIs y el badge de pendientes
2. Listado maestro → buscar el espacio
3. Editar datos faltantes (horario, teléfono, descripción…)
4. Editor cartográfico → asignar latitud y longitud
5. Flujo de revisión → Marcar como publicado
6. Capas del mapa → Sincronizar (pipeline sync:mapa)
7. Verificar el pin en /mapa
```

---

## 8. Otras secciones del menú

### Capas SIG

CRUD del catálogo de capas vectoriales/raster. Las capas activas alimentan el visor y el contador de KPI «Capas temáticas».

### Capas del mapa

Panel operativo de sincronización territorial:

- Estado de capas: métricas, densidad, geometrías, transporte.
- Botón **Sincronizar** ejecuta el pipeline admin (`npm run sync:mapa`).
- Registro en `mapa_sync_log` (visible en logs).

### Fuentes de información

Metadatos de procedencia: institución, URL, fecha de corte, notas de calidad.

### Políticas públicas

Editor de recomendaciones mostradas en `/politicas`. Publicar o desactivar entradas por objetivo estratégico.

### Investigación cualitativa

Alta y edición de recursos del repositorio público. Coordenadas opcionales para geolocalización en mapa.

### Centro de reportes (admin)

Gestión de plantillas disponibles en `/reportes`: título, categoría, formatos permitidos.

### Consultas de contacto

Bandeja de mensajes del buzón `/contacto`. Modal de detalle; marcar como atendida.

### Usuarios

- Listado de cuentas registradas.
- **Crear usuario** (correo, nombre, rol inicial).
- **Cambiar rol** (Ciudadano / Investigador / Autoridad).

### Historial / logs

Auditoría de altas, cambios, sincronizaciones de mapa y exportaciones relevantes.

### Pendientes

Resumen de calidad del padrón desde `v_sectei_validacion_datos`. Idealmente los contadores «sin …» deben tender a cero.

---

## 9. Modo Supabase vs modo demo

| Aspecto | Métricas Supabase | Modo demo |
|---------|-------------------|-----------|
| KPIs | Datos reales de la base | Valores ficticios |
| Listado | Paginación server-side | Lista estática en memoria |
| Crear / editar / eliminar | Persiste en Supabase | Solo en memoria del navegador |
| Publicar espacio | Actualiza el padrón real | Simulación local |
| Sincronizar mapa | Ejecuta pipeline real | No disponible |

Para producción se requieren las variables `NEXT_PUBLIC_SUPABASE_*` en `.env.local` y una sesión con rol **Autoridad**.

---

## 10. Resumen ejecutivo

El panel `/admin` es **funcional y conectado a Supabase** cuando la configuración y el rol son correctos. La pantalla principal (KPIs + listado maestro de espacios) opera con datos reales del padrón SECTEI.

Las diferencias principales respecto a un flujo ideal documentado son:

- El **flujo de revisión** usa botones de publicación, no arrastrar y soltar entre columnas.
- El **editor cartográfico** captura coordenadas por formulario, no con un mapa interactivo de edición.

Para llevar un espacio desde borrador hasta el mapa público: completar datos → asignar coordenadas → publicar → sincronizar capas del mapa.

---

**Documentos relacionados**

- [Manual de usuario — §8 Panel de administración](MANUAL-USUARIO.md#8-panel-de-administración)
- [Control de capas del mapa](CONTROL-DE-CAPAS-MAPA.md)
- [Arquitectura del proyecto](ARCHITECTURE.md)
