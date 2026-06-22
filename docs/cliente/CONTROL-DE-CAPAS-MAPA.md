# Control de Capas del Mapa — GEO ARTE CDMX

**Versión:** 1.0  
**Fecha:** junio 2026  
**Audiencia:** desarrolladores, administradores y usuarios avanzados  
**Módulo:** Mapa interactivo (`/mapa`)

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Arquitectura del flujo de datos](#2-arquitectura-del-flujo-de-datos)
3. [Catálogo de capas](#3-catálogo-de-capas)
4. [Estado en React](#4-estado-en-react)
5. [Panel UI (MapCapasPanel)](#5-panel-ui-mapcapaspanel)
6. [Comportamiento al marcar/desmarcar](#6-comportamiento-al-marcar-desmarcar)
7. [Presets y reset](#7-presets-y-reset)
8. [Fuentes de datos](#8-fuentes-de-datos)
9. [Archivos clave del código](#9-archivos-clave-del-código)
10. [Resumen ejecutivo](#10-resumen-ejecutivo)

---

## 1. Visión general

El **Control de Capas** del mapa de GEO ARTE CDMX **no es un plugin de Leaflet**. Es un **panel React personalizado** (`MapCapasPanel`) que administra dos tipos de capas distintas:

| Tipo | Qué representa | Cómo se dibuja en el mapa |
|------|----------------|---------------------------|
| **Infraestructura cultural** (12 tipologías SIC) | Puntos: bibliotecas, museos, teatros, etc. | Marcadores circulares (`CircleMarker`) agrupados por tipo |
| **Capas territoriales / análisis** | Polígonos y líneas: transporte, densidad, brechas, cobertura | GeoJSON sobre Leaflet (`L.geoJSON`) |

La configuración de qué capas existen, sus iconos, etiquetas y valores por defecto vive en un **catálogo estático** (`mapaCapasSecciones`). El estado de qué está activo vive en **React** y se propaga al motor del mapa (`MapCanvas`).

**Importante:** marcar o desmarcar un checkbox **no dispara una nueva petición al servidor**. Los datos (espacios culturales, polígonos, métricas) ya están cargados al abrir el mapa; el panel solo decide qué mostrar u ocultar.

---

## 2. Arquitectura del flujo de datos

```
/mapa
  └── MapaLoader (Suspense + dynamic import, sin SSR)
        └── MapaController
              ├── GET /api/data/mapa
              │     └── getMapaData()
              │           ├── Espacios culturales (Supabase o mock)
              │           ├── Datos territoriales (polígonos, métricas, transporte)
              │           └── Configuración UI (mapaCapasSecciones, presets, colores)
              └── MapaInteractivo
                    ├── MapCapasPanel   ← panel lateral de capas
                    └── MapCanvas       ← motor Leaflet
                          └── map-overlays.ts  ← capas GeoJSON
```

### Pasos del flujo

1. La ruta **`/mapa`** carga `MapaLoader`, que importa `MapaController` de forma dinámica (`ssr: false`) porque Leaflet requiere el DOM del navegador.
2. **`MapaController`** solicita datos a `/api/data/mapa`, que ejecuta `getMapaData()` en el servidor.
3. Esa función obtiene:
   - **Espacios culturales** con coordenadas (desde Supabase o datos mock de demostración).
   - **Datos territoriales**: polígonos de alcaldías y macrozonas, métricas de cobertura/brecha, red de transporte.
   - **Configuración estática del panel**: secciones, presets de vista, colores por tipología.
4. Con los datos cargados, `MapaInteractivo` renderiza el panel y el mapa. Los cambios en los checkboxes actualizan el estado local y, en cascada, lo que Leaflet muestra.

---

## 3. Catálogo de capas

El catálogo está definido en `src/lib/data/mock/mapa.ts` como `mapaCapasSecciones`. Cada capa tiene esta estructura:

```ts
{
  id: "bibliotecas",
  label: "Bibliotecas",
  subtitulo: null,
  icon: "library",
  mapKey: "bibliotecas",      // null para capas territoriales
  defaultChecked: false,
  defaultOpacity: 80,
  conOpacidad: true,
}
```

### Secciones del panel

| Sección | ID | Contenido |
|---------|-----|-----------|
| Infraestructura Cultural | `infra` | 12 tipologías SIC con `mapKey` |
| Variables Territoriales | `territorial` | Transporte, densidad, vacíos territoriales |
| Análisis Geo Arte | `analisis` | Cobertura cultural, recursos cualitativos |

### Las 12 tipologías SIC (infraestructura)

| mapKey | Etiqueta en UI |
|--------|----------------|
| `auditorios` | Auditorios |
| `bibliotecas` | Bibliotecas |
| `bibliotecasDgb` | Bibliotecas DGB |
| `casasArtesanias` | Casas de artesanías |
| `casasCentrosCulturales` | Casas y centros culturales |
| `centrosPueblosIndigenas` | Centros Coord. de pueblos indígenas |
| `complejosCinematograficos` | Complejos cinematográficos |
| `galerias` | Galerías |
| `libreriasPuntosVenta` | Librerías y puntos de venta |
| `museos` | Museos |
| `teatros` | Teatros |
| `universidades` | Universidades |

### Capas sin `mapKey` (overlays y análisis)

| ID | Etiqueta | Tipo de geometría |
|----|----------|-------------------|
| `transporte` | Transporte Masivo | Líneas (Metro, Metrobús, Cablebús) |
| `densidad` | Densidad por macrozona | Polígonos coloreados |
| `nivel` | Vacíos territoriales | Polígonos de alcaldías con brecha alta |
| `cobertura` | Cobertura Cultural | Polígonos de alcaldías por % cobertura |
| `recursosCualitativos` | Recursos cualitativos | Puntos (entrevistas/encuestas) |

### Regla de enlace

- **Con `mapKey`** → capa de **puntos** (infraestructura SIC). El `mapKey` coincide con `EspacioTipo` en `src/lib/domain/mapa.ts`.
- **Sin `mapKey`** → capa **extra/overlay**, identificada por `capa.id` en el estado `capasExtra`.

---

## 4. Estado en React

El componente central `MapaInteractivo` mantiene dos objetos de estado principales.

### 4.1 `capaMapa` — las 12 tipologías SIC

Tipo definido en `src/lib/domain/mapa.ts`:

```ts
type CapaMapaState = Record<EspacioTipo, { visible: boolean; opacity: number }>;
```

Ejemplo conceptual:

```ts
{
  bibliotecas: { visible: true, opacity: 80 },
  museos: { visible: false, opacity: 80 },
  // ... resto de tipologías
}
```

**Inicialización:** la función `buildCapaMapaInitial()` recorre `mapaCapasSecciones` y asigna `defaultChecked` y `defaultOpacity` de cada capa con `mapKey`.

### 4.2 `capasExtra` — overlays y recursos cualitativos

Tipo en `src/lib/domain/mapa-territorial.ts`:

```ts
type MapaCapasToggleId =
  | "transporte"
  | "densidad"
  | "nivel"
  | "cobertura"
  | "recursosCualitativos";
```

Cada ID es un booleano (`true` = visible en el mapa).

**Inicialización:** `buildCapasExtraInitial()` lee `defaultChecked` de las capas sin `mapKey`.

### 4.3 Sincronización con filtros avanzados

Al cambiar la visibilidad de una tipología desde el panel, `onCapaMapaChange` también actualiza `filtrosAplicados.tipos` para mantener coherencia entre el panel de capas y el panel de **Filtros avanzados**.

---

## 5. Panel UI (MapCapasPanel)

Archivo: `src/components/mapa/MapCapasPanel.tsx`

Es un componente **presentacional**: no conoce Leaflet. Solo recibe estado y callbacks.

### Elementos de interfaz

| Elemento | Función |
|----------|---------|
| Cabecera con título | Muestra «Control de Capas»; botón para colapsar el panel |
| Secciones colapsables | Agrupan capas por categoría (Infraestructura, Territorial, Análisis) |
| `LayerItem` | Icono + nombre + checkbox (+ slider de opacidad si aplica) |
| Pie del panel | Fuente territorial, capa base activa (OpenStreetMap), botón «Resetear Vista» |

### Lógica de enlace por capa

```ts
if (capa.mapKey != null) {
  // Usa capaMapa[capa.mapKey] → onCapaMapaChange
} else {
  // Usa capasExtra[capa.id] → onCapaExtraChange
}
```

### Opacidad

Solo las capas de infraestructura con `conOpacidad: true` muestran un slider (rango 15–100 %) cuando están activas. La opacidad se aplica a los marcadores del `LayerGroup` correspondiente en Leaflet.

### Colapso del panel

En pantallas grandes (`lg:`), el panel puede contraerse a una barra estrecha (`lg:w-12`) para dar más espacio al mapa.

---

## 6. Comportamiento al marcar/desmarcar

### 6.1 Capas de infraestructura (puntos culturales)

**Secuencia:**

1. El usuario marca «Bibliotecas» en el panel.
2. `MapCapasPanel` llama `onCapaMapaChange("bibliotecas", { visible: true })`.
3. `MapaInteractivo` actualiza `capaMapa` y sincroniza filtros avanzados.
4. `espaciosFiltrados` (useMemo) excluye espacios cuyo tipo no está visible:
   ```ts
   base.filter((espacio) => capaMapa[espacio.tipo].visible)
   ```
5. `MapCanvas` recibe los espacios filtrados y:
   - **Crea/actualiza marcadores** en `syncEspacioMarkers()` — un `CircleMarker` por espacio, con color según `tipoColors`.
   - **Muestra u oculta el LayerGroup** del tipo en un `useEffect` sobre `capaMapa`:
     ```ts
     if (estado.visible) {
       group.addTo(map);
       applyOpacity(group, estado.opacity / 100);
     } else {
       group.remove();
     }
     ```

Cada tipología tiene su propio `L.LayerGroup` en Leaflet. Los marcadores se agrupan por tipo para poder controlar visibilidad y opacidad de forma independiente.

### 6.2 Capas territoriales (GeoJSON)

**Secuencia:**

1. El usuario marca «Transporte Masivo».
2. `onCapaExtraChange("transporte", true)` actualiza `capasExtra`.
3. `MapCanvas` ejecuta `syncOverlayVisibility()` para añadir o quitar la capa del mapa.

Las geometrías se construyen en `src/components/mapa/map-overlays.ts`:

| ID | Función constructora | Qué dibuja |
|----|---------------------|------------|
| `transporte` | `buildTransporteLayer()` | Líneas de Metro / Metrobús / Cablebús |
| `densidad` | `buildDensidadLayer()` | Polígonos de macrozonas coloreados por densidad de infraestructura |
| `nivel` | `buildVaciosLayer()` | Alcaldías con brecha territorial alta (vacíos de oferta) |
| `cobertura` | `buildCoberturaLayer()` | Alcaldías coloreadas por porcentaje de cobertura cultural |

Cuando cambian los datos territoriales o los filtros de brecha (`brechaMinima`, `soloVacios`), `rebuildOverlayLayers()` regenera las geometrías y vuelve a aplicar la visibilidad.

### 6.3 Recursos cualitativos (caso especial)

No pasa por `map-overlays.ts`. Si `capasExtra.recursosCualitativos === true`, `MapaInteractivo` pasa el arreglo `recursosFiltrados` a `MapCanvas`, que crea marcadores rosas (`#ec4899`) independientes de los espacios del padrón SIC.

### 6.4 Leyenda de capas activas

Cuando hay overlays territoriales visibles, `MapCanvas` muestra una leyenda en la esquina inferior izquierda con los nombres de las capas activas (`OVERLAY_LEGEND`).

---

## 7. Presets y reset

### Selector de vista (barra superior)

Definido en `mapaCapasPresets` y aplicado por `applyMapaPreset()` en `src/lib/mapa/map-presets.ts`:

| Preset | Valor | Efecto |
|--------|-------|--------|
| Puntos culturales | `infra` | Activa las 12 tipologías SIC; desactiva todos los overlays |
| Análisis territorial | `territorial` | Oculta todos los puntos; activa densidad + cobertura + vacíos |

### Botón «Resetear Vista»

1. Restaura `capaMapa` y `capasExtra` a los valores `defaultChecked` del catálogo.
2. Restaura filtros avanzados al estado por defecto.
3. Incrementa `resetNonce`, lo que hace que `MapCanvas` reencuadre el mapa en las 16 alcaldías de CDMX.

---

## 8. Fuentes de datos

| Dato | Origen | Función / repositorio |
|------|--------|----------------------|
| Espacios (puntos SIC) | Supabase (o mock) | `fetchEspaciosCulturalesForMapa()` |
| Recursos cualitativos | Supabase (o mock) | `fetchRecursosCualitativosActivosFromSupabase()` |
| Polígonos de alcaldías / macrozonas | Supabase / GeoJSON / fallback | `fetchMapaTerritorialDataServer()` |
| Métricas de cobertura y brecha | Supabase / estimación local | `fetchMapaTerritorialData()` |
| Red de transporte | Supabase / GeoJSON | `buildTransporteLayer()` |
| Catálogo del panel (nombres, iconos) | Estático | `src/lib/data/mock/mapa.ts` |
| Colores por tipología | Estático | `ESPEACIO_TIPO_COLORS` en `src/lib/domain/mapa.ts` |
| Capa base del mapa | OpenStreetMap tiles | `L.tileLayer` en `MapCanvas` |

### Modos de operación

- **Supabase configurado y con datos:** badge «Padrón Supabase»; conteo real de espacios en `dataSourceNote`.
- **Sin Supabase o sin coordenadas:** datos mock de demostración; la estructura del panel es idéntica.
- **Error de carga:** fallback a mock con mensaje de aviso en la UI.

El pie del panel muestra un resumen de fuentes territoriales mediante `formatTerritorialFuenteLabel()` (qué capas vienen de Supabase vs. estimación local).

---

## 9. Archivos clave del código

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/app/mapa/page.tsx` | Punto de entrada de la ruta `/mapa` |
| `src/components/mapa/MapaLoader.tsx` | Carga dinámica sin SSR |
| `src/components/features/mapa/MapaController.tsx` | Fetch de datos y estado de carga |
| `src/lib/services/mapa.service.ts` | `getMapaData()` — orquestación servidor |
| `src/lib/data/mock/mapa.ts` | Catálogo `mapaCapasSecciones`, presets, colores |
| `src/lib/domain/mapa.ts` | Tipologías SIC, `CapaMapaState`, colores |
| `src/lib/domain/mapa-territorial.ts` | IDs de overlays, filtros territoriales |
| `src/components/mapa/MapaInteractivo.tsx` | Estado global, filtros, orquestación UI |
| `src/components/mapa/MapCapasPanel.tsx` | Panel lateral con checkboxes |
| `src/components/mapa/MapCanvas.tsx` | Motor Leaflet (marcadores + capas) |
| `src/components/mapa/map-overlays.ts` | Construcción de capas GeoJSON |
| `src/lib/mapa/map-presets.ts` | Presets «Puntos culturales» / «Análisis territorial» |
| `src/lib/mapa/filter-espacios.ts` | Filtrado por búsqueda, alcaldía y métricas |

---

## 10. Resumen ejecutivo

El **Control de Capas** de GEO ARTE CDMX funciona así:

1. Un **catálogo declarativo** (`mapaCapasSecciones`) define qué capas existen, cómo se llaman y sus valores por defecto.
2. **Dos estados React** (`capaMapa` para puntos SIC, `capasExtra` para overlays) registran qué está activo.
3. El **panel** (`MapCapasPanel`) es UI pura: checkboxes y sliders que llaman callbacks.
4. **`MapaInteractivo`** filtra los datos según el estado y los pasa al mapa.
5. **`MapCanvas`** (Leaflet) muestra u oculta grupos de marcadores y capas GeoJSON según ese estado.
6. **No hay peticiones nuevas al servidor** al togglear capas; todo opera sobre datos ya cargados.

En una frase: *el panel es la interfaz, React es el cerebro, Leaflet es el renderizado, y Supabase (o mock) es la fuente de datos inicial.*

---

*Documento técnico generado para el proyecto GEO ARTE Web. Para el manual de uso orientado al usuario final, consulte [`docs/cliente/MANUAL-USUARIO.md`](../cliente/MANUAL-USUARIO.md).*
