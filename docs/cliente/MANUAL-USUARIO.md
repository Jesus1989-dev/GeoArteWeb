# Manual de usuario — GEO ARTE CDMX

**Versión:** 1.2 · **Audiencia:** ciudadanos, investigadores y autoridades  
**Plataforma:** aplicación web Next.js · **Datos:** padrón SECTEI, métricas territoriales y repositorio cualitativo

GEO ARTE CDMX es una plataforma de **inteligencia territorial** para consultar, analizar y —según el perfil— gestionar la infraestructura cultural de las 16 alcaldías de la Ciudad de México.

Este manual explica:

1. Cómo funciona la interfaz global.
2. Los **tres tipos de inicio de sesión** y sus diferencias.
3. Cada pantalla, control y flujo de trabajo.
4. Qué miden los **KPIs, gráficos y exportaciones** y de qué fuentes provienen los datos ([capítulo 9](#9-referencia-de-kpis-y-gráficos), §9.1–9.8), incluidas las [columnas del padrón en Excel/CSV/JSON (§9.8)](#98-exportación-del-padrón--columnas-y-hojas).

---

## Tabla de contenidos

1. [Convenciones y modos de operación](#1-convenciones-y-modos-de-operación)
2. [Interfaz global](#2-interfaz-global)
3. [Autenticación y perfiles](#3-autenticación-y-perfiles)
4. [Navegación por tipo de usuario](#4-navegación-por-tipo-de-usuario)
5. [Módulos públicos](#5-módulos-públicos)
6. [Mi Perfil](#6-mi-perfil)
7. [Centro de reportes](#7-centro-de-reportes)
8. [Panel de administración](#8-panel-de-administración)
9. [Referencia de KPIs y gráficos](#9-referencia-de-kpis-y-gráficos)
10. [Glosario y estados](#10-glosario-y-estados)
11. [Preguntas frecuentes operativas](#11-preguntas-frecuentes-operativas)

---

## 1. Convenciones y modos de operación

### 1.1 Modo demo vs. Supabase

La aplicación puede mostrar datos de dos formas:

| Indicador en pantalla | Significado |
|----------------------|-------------|
| **Modo demo** / badge ámbar | Datos de ejemplo locales; no requiere base de datos |
| **Métricas Supabase** / badge verde | Datos reales desde Supabase (padrón, métricas, exportaciones) |

Cuando Supabase está configurado (`NEXT_PUBLIC_SUPABASE_*` en el entorno), las pantallas intentan cargar datos en vivo. Si falla la conexión, muchas secciones vuelven a modo demo con un aviso.

### 1.2 Rutas principales

| Ruta | Nombre en menú |
|------|----------------|
| `/` | Inicio |
| `/sobre-el-proyecto` | Proyecto |
| `/mapa` | Mapa |
| `/dashboard` | Dashboard |
| `/reportes` | Reportes |
| `/investigacion` | Investigación |
| `/politicas` | Políticas |
| `/contacto` | Soporte |
| `/admin` | Administración *(solo Autoridad)* |
| `/perfil` | Mi perfil *(sesión)* |
| `/login` | Iniciar sesión |
| `/registro` | Crear cuenta |

### 1.3 Alcaldías de la CDMX

La plataforma trabaja con las **16 demarcaciones territoriales** de Ciudad de México. Aparecen en filtros, búsquedas, comparadores y métricas de brecha/cobertura.

---

## 2. Interfaz global

### 2.1 Barra superior (Header)

**Logo GEO ARTE CDMX** → enlace a Inicio.

**Menú principal** (scroll horizontal en pantallas pequeñas):

- Orden: Inicio · Proyecto · Mapa · Admin *(solo Autoridad)* · Dashboard · Reportes · Investigación · Políticas · Soporte.
- El ítem activo se resalta según la ruta actual.

**Búsqueda cultural** (visible en pantallas `xl` y superiores):

- Campo compacto: *«Buscar alcaldía o espacio…»*.
- Autocompletado de **alcaldías** y **espacios culturales** (consulta remota cuando hay Supabase).
- Al seleccionar un resultado, navega al mapa con parámetros URL (`q`, `alcaldia`, `espacio`).

**Menú de usuario** (avatar o iniciales):

- Con sesión: enlace a **Mi perfil**, nombre, rol y **Cerrar sesión**.
- Sin sesión: enlace a **Iniciar sesión**.

### 2.2 Pie de página (Footer)

Enlaces rápidos a Mapa, Estadísticas (Dashboard), Investigación, Recomendaciones (Políticas), Proyecto y Soporte. Incluye aviso de copyright institucional.

### 2.3 Búsqueda cultural — uso detallado

La búsqueda aparece en tres variantes:

| Ubicación | Variante | Comportamiento |
|-----------|----------|----------------|
| Barra superior | `compact` | Navega al mapa al elegir sugerencia |
| Inicio (hero) | `hero` | Botón «Explorar Datos»; lista ampliada de alcaldías |
| Mapa | `map` | Filtra el visor sin salir de la página |

**Sugerencias mostradas:**

- **Alcaldía:** nombre de demarcación + subtítulo «Alcaldía · CDMX».
- **Espacio:** nombre del espacio cultural del padrón; al elegirlo, centra el mapa en ese pin.

**Atajos de teclado** en el desplegable: flechas arriba/abajo para navegar, Enter para confirmar, Escape para cerrar.

---

## 3. Autenticación y perfiles

### 3.1 Los tres perfiles

| Perfil | Icono | Descripción en pantalla | Campos extra en registro |
|--------|-------|-------------------------|------------------------|
| **Ciudadano** | Usuario | Consulta mapas, guarda recursos y participa | Ninguno |
| **Investigador** | Microscopio | Datos, reportes y análisis territorial | Institución, área de investigación |
| **Autoridad** | Escudo | Administra espacios, capas SIG y validaciones | Institución, cargo o área |

> **Importante:** al iniciar sesión debes seleccionar el **mismo perfil** con el que te registraste. Si no coincide, verás un error del tipo: *«Esta cuenta está registrada como investigador, no como ciudadano»*.

### 3.2 Iniciar sesión (`/login`)

**Pasos:**

1. Abre **Iniciar sesión** desde el menú de usuario o `/login`.
2. En **Tipo de perfil**, elige Ciudadano, Investigador o Autoridad.
3. Ingresa **correo** y **contraseña** (mínimo 6 caracteres).
4. Pulsa **Entrar**.

**Opciones adicionales:**

- **¿Olvidaste tu contraseña?** → `/recuperar-contrasena`.
- **¿No tienes cuenta?** → `/registro`.
- Parámetro `?next=/ruta` — tras login exitoso, te lleva a esa ruta (si es segura).

**Redirección automática tras login:**

| Perfil | Destino por defecto |
|--------|---------------------|
| Ciudadano | `/perfil` |
| Investigador | `/perfil` |
| Autoridad | `/admin` |

**Modo demo (sin Supabase):** aparece un bloque «Cuentas de demostración» con usuarios precargados (contraseña `demo123` para todos):

| Correo | Perfil |
|--------|--------|
| `ciudadano@geoarte.mx` | Ciudadano |
| `investigador@geoarte.mx` | Investigador |
| `autoridad@geoarte.mx` | Autoridad |

**Con Supabase:** si existen credenciales `TEST_LOGIN_*` en `.env`, se autocompletan al cambiar de perfil.

### 3.3 Crear cuenta (`/registro`)

**Campos comunes:**

- Nombre completo.
- Correo electrónico.
- Contraseña y confirmación.
- Aceptación de términos del servicio y política de privacidad CDMX.

**Campos condicionales:**

- **Investigador:** Institución u organización · Área de investigación (texto en mayúsculas).
- **Autoridad:** Institución u organización · Cargo o área (texto en mayúsculas).

Tras registrarse con Supabase, el correo debe **verificarse** antes de usar funciones completas.

### 3.4 Verificación y recuperación de contraseña

| Ruta | Función |
|------|---------|
| `/verificar-email` | Reenviar correo de verificación; simular verificación en demo |
| `/email-verificado` | Confirmación de cuenta activada |
| `/recuperar-contrasena` | Solicitar enlace de restablecimiento |
| `/restablecer-contrasena` | Definir nueva contraseña (requiere token válido del correo) |

Si inicias sesión con correo no verificado, se redirige automáticamente a **Verificar email**.

---

## 4. Navegación por tipo de usuario

### 4.1 Matriz de acceso

| Funcionalidad | Visitante | Ciudadano | Investigador | Autoridad |
|---------------|:---------:|:---------:|:------------:|:---------:|
| Inicio, Proyecto, Mapa, Dashboard, Investigación, Políticas, Contacto | ✅ | ✅ | ✅ | ✅ |
| Ver menú **Administración** | ❌ | ❌ | ❌ | ✅ |
| Entrar a `/admin` | ❌ | ❌ | ❌ | ✅ |
| **Mi Perfil** | ❌ | ✅ | ✅ | ✅ |
| Guardar espacios en mapa | ❌ | ✅ | ✅ | ✅ |
| **Reportes** (Supabase) | ❌ | ✅* | ✅ | ✅ |
| Generar exportaciones remotas | ❌ | ✅* | ✅ | ✅ |
| Gestionar padrón y usuarios | ❌ | ❌ | ❌ | ✅ |

\* Requiere cuenta Supabase verificada.

### 4.2 Rutas de trabajo recomendadas

**Ciudadano**

```
Inicio → Mapa (explorar y guardar) → Políticas (contexto) → Perfil (recursos guardados)
```

**Investigador**

```
Dashboard (filtros) → Investigación (cualitativo) → Reportes (exportar) → Perfil (historial)
```

**Autoridad**

```
Admin (mantenimiento) → Mapa (validar georreferencia) → Dashboard (supervisión) → Logs (auditoría)
```

---

## 5. Módulos públicos

### 5.1 Inicio (`/`)

#### Propósito

Panorama ejecutivo de la infraestructura cultural: indicadores clave, vista previa del mapa y alertas de brecha territorial.

#### Secciones de la pantalla

**A. Hero**

- Título: *Visualización y Análisis de la Infraestructura Cultural en CDMX*.
- **Búsqueda por alcaldía** con autocompletado (misma lógica que la barra superior).
- Botón **Explorar Datos** → navega al mapa con la alcaldía o consulta seleccionada.

**B. Tarjetas de indicadores (4 KPIs)**

| KPI | Qué muestra |
|-----|-------------|
| Total Espacios | Conteo del padrón georreferenciado |
| Alcaldías | Cobertura territorial (p. ej. `16 / 16`) |
| Cobertura Prom. | Índice promedio de accesibilidad |
| Periodo | Corte de datos (año o semestre) |

- Badge **Supabase** y botón **Actualizar** cuando hay datos en vivo.

**C. Explorador espacial**

- Mini-mapa con pins de muestra del padrón.
- Contador de espacios georreferenciados visibles.
- Enlace **Abrir mapa completo**.

**D. Accesos directos**

| Tarjeta | Destino | Uso |
|---------|---------|-----|
| Visor Geográfico | `/mapa` | Capas y vacíos territoriales |
| Tablero Estadístico | `/dashboard` | Gráficas comparativas |
| Generador de Reportes | `/reportes` | Informes sectoriales *(destacado)* |
| Gestión de Datos | `/admin` | Solo útil para Autoridad |

**E. Monitoreo de infraestructura**

Dos paneles analíticos:

1. **Crecimiento del padrón** (gráfico de área): evolución anual del número de espacios (eje X: años; eje Y: total de espacios).
2. **Brecha territorial** (barras horizontales): déficit por alcaldía, dividido en:
   - *Mayor déficit* — alcaldías con brecha más alta.
   - *Menor déficit* — alcaldías con mejor cobertura relativa.

Cada barra muestra el **% de brecha** y el número de espacios. Las prioridades son:

| Prioridad | Significado |
|-----------|-------------|
| **Crítico** | Brecha muy alta; intervención urgente |
| **Atención** | Brecha moderada |
| **Estable** | Situación relativamente equilibrada |

Enlace **Ver Dashboard Completo** al final de la sección.

---

### 5.2 Proyecto (`/sobre-el-proyecto`)

#### Propósito

Documentación institucional: por qué existe la plataforma, cómo se construyeron los datos y quién participa.

#### Contenido

| Bloque | Descripción |
|--------|-------------|
| **Hero** | Presentación del proyecto GEO ARTE CDMX |
| **Objetivos estratégicos** | Metas de visualización, análisis y política pública |
| **Metodología** | Pasos: recolección → georreferenciación → validación → publicación |
| **Fuentes de información** | SECTEI, padrón cultural, fuentes abiertas; badge de origen de datos |
| **Barra lateral** | Equipo core, colaboradores, licencia de datos |
| **CTA datos crudos** | Enlace al centro de contacto / datasets |

No requiere sesión. Ideal para citar la plataforma en informes académicos o memorias técnicas.

---

### 5.3 Mapa interactivo (`/mapa`)

#### Propósito

Visor GIS principal: espacios del padrón SIC, capas territoriales, recursos cualitativos y herramientas de filtrado.

#### Layout de la pantalla

```
┌─────────────────────────────────────────────────────────┐
│  Búsqueda  │  Preset capas  │  Capas  │  Filtros  │ ⛶  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    MAPA (Leaflet)                       │
│                                                         │
│              [Panel flotante de espacio/recurso]        │
└─────────────────────────────────────────────────────────┘
```

#### Controles superiores

| Control | Función |
|---------|---------|
| **Búsqueda** | Filtra por alcaldía o nombre de espacio |
| **Preset Infraestructura** | Muestra las 12 tipologías SIC del padrón |
| **Preset Territorial** | Oculta pins; activa capas de densidad, cobertura y NSE |
| **Capas** | Panel lateral: visibilidad y opacidad por tipología |
| **Filtros avanzados** | Tipos, brecha mínima, solo vacíos culturales |
| **Pantalla completa** | Expande el mapa a todo el viewport |

#### Las 12 tipologías SIC (capas de infraestructura)

Cada tipo tiene color propio en el mapa:

1. Auditorios  
2. Bibliotecas  
3. Bibliotecas DGB  
4. Casas de artesanías  
5. Casas y centros culturales  
6. Centros coord. de pueblos indígenas  
7. Complejos cinematográficos  
8. Galerías  
9. Librerías y puntos de venta  
10. Museos  
11. Teatros  
12. Universidades  

#### Capas territoriales adicionales

| Capa | Qué representa |
|------|------------------|
| **Transporte** | Red de transporte público (líneas/estaciones) |
| **Densidad** | Densidad de infraestructura por macrozona |
| **Nivel socioeconómico** | Segmentación NSE territorial |
| **Cobertura** | Índice de cobertura cultural por zona |

#### Filtros avanzados

- **Tipos de espacio:** activar/desactivar cada tipología SIC.
- **Brecha mínima (%):** slider para mostrar solo zonas con déficit igual o superior.
- **Solo vacíos culturales:** oculta espacios en zonas ya saturadas.
- **Alcaldía:** limita el análisis a una demarcación.
- Botones **Aplicar** y **Restablecer**.

#### Interacción con espacios

1. **Clic en un pin** → panel inferior con:
   - Fotografía del espacio (si existe en Storage/SIC).
   - Tipología, nombre, dirección.
   - **Cómo llegar** → abre Google Maps con coordenadas.
   - **Guardar espacio** / **Quitar de guardados** *(requiere sesión)*.
   - **Mi perfil** → acceso directo a recursos guardados.

2. Sin sesión, el botón de guardar muestra **Inicia sesión para guardar**.

#### Recursos cualitativos en el mapa

Si un recurso de investigación tiene coordenadas, puede abrirse con `?recurso=ID`. Se muestra un panel con snippet, investigador y enlace al detalle en Investigación.

#### Parámetros URL (enlaces profundos)

| Parámetro | Ejemplo | Efecto |
|-----------|---------|--------|
| `q` | `?q=Iztapalapa` | Búsqueda de texto |
| `alcaldia` | `?alcaldia=Coyoacán` | Filtra por demarcación |
| `espacio` | `?espacio=UUID` | Centra y abre ficha del espacio |
| `recurso` | `?recurso=c1` | Abre recurso cualitativo |
| `lat` + `lng` | `?lat=19.43&lng=-99.14` | Centra el mapa en coordenadas |

#### Fuente de datos

- **Espacios:** tabla `espacios_culturales` (Supabase) o mock local.
- **Territorial:** métricas por alcaldía, polígonos, densidad macrozonal, transporte.
- Badge inferior indica si las capas vienen de Supabase o estimación local.

---

### 5.4 Dashboard estadístico (`/dashboard`)

#### Propósito

Análisis cuantitativo del padrón con filtros cruzados, gráficos interactivos, comparador entre alcaldías y exportación masiva.

#### Barra de filtros avanzados

Seis selectores que recalculan **todos** los KPIs, gráficos y la tabla:

| Filtro | Opciones típicas | Efecto |
|--------|------------------|--------|
| **Alcaldía** | Todas + 16 demarcaciones | Cambia KPIs a vista local; recarga densidad por macrozona |
| **Disciplina** | Todas, Música, Teatro, Artes visuales, Danza… | Filtra espacios y participación |
| **Periodo** | Años académicos (p. ej. 2023-2024) | Puede recargar métricas de otro `anioCorte` vía API |
| **NSE** | Todos, Bajo, Medio, Alto | Segmenta estadísticas socioeconómicas |
| **Rango de edad** | Todos, 18-29, 30-44, 45-59, 60+ | Activa serie «Participación Edad» si existe en Supabase |
| **Género** | Todos, Mujer, Hombre, No binario/otro | Filtra visualización del gráfico de participación |

Debajo de los filtros aparece un **resumen textual** del corte activo (p. ej. *«Toda la CDMX · corte 2024»*).

**Avisos (badge ámbar):** si no hay datos para la combinación de filtros (p. ej. participación por género vacía), se muestra un mensaje explicativo.

#### Cabecera del tablero

- Título **Dashboard Estadístico** + año de corte.
- Badge **Métricas Supabase** o **Modo demo**.
- **Exportar Datos** → PDF del snapshot actual.
- **Generar Reporte** → `/reportes`.

#### KPIs (4 tarjetas superiores)

Ver [sección 9.2](#92-dashboard--kpis) para el detalle completo según filtro de alcaldía.

#### Gráficos principales

Ver [sección 9.3](#93-dashboard--gráficos).

**Interacción:**

- **Participación por género:** desplazamiento horizontal en móvil (muchas tipologías SIC).
- **Tooltips:** al pasar el cursor sobre barras, líneas o sectores del donut.
- Leyenda scrollable en distribución por tipología.

#### Tabla «Detalle de espacios culturales»

| Columna | Descripción |
|---------|-------------|
| ID | Identificador abreviado del registro |
| Nombre | Denominación oficial |
| Alcaldía | Demarcación |
| Completitud | % de campos llenos en el padrón (0–100) |
| Estado | Publicado · Revisión · Borrador |

- Paginación: **20 registros por página**.
- Exportar página o conjunto completo: **CSV** o **JSON**.

#### Panel lateral — Comparador territorial

1. Selecciona **Alcaldía A** (indicador azul marino).
2. Pulsa el botón central ⇅ para **intercambiar** A y B.
3. Selecciona **Alcaldía B** (indicador rosa).

**Métricas comparadas (Supabase):**

- Espacios culturales (conteo).
- Cobertura (%).
- Brecha territorial (%).

**Hallazgo automático:** texto del tipo *«Alcaldía X y Y difieren N pp en brecha territorial»*.

**Ver Recomendaciones** → `/politicas`.

#### Exportación rápida (panel inferior derecho)

| Formato | Contenido |
|---------|-----------|
| **GeoJSON** | Geometrías de espacios filtrados |
| **XLSX** | Libro Excel multi-hoja (KPIs, participación, tendencia y hoja **Espacios** con el padrón completo — [9.8](#98-exportación-del-padrón--columnas-y-hojas)) |
| **CSV / JSON** | Padrón filtrado desde botones de la tabla (mismas columnas que [9.8](#98-exportación-del-padrón--columnas-y-hojas)) |
| **PDF** | Informe visual del tablero con filtros aplicados |

---

### 5.5 Investigación (`/investigacion`)

#### Propósito

Repositorio de **datos cualitativos** geolocalizados: entrevistas, encuestas, grupos focales y otros materiales de campo.

#### KPIs de cabecera

| KPI | Cálculo |
|-----|---------|
| Recursos totales | Conteo de entradas activas en catálogo |
| Digitalizados | % con flag `digitalizado = true` |
| Alcaldías | Demarcaciones distintas con al menos un recurso |

#### Panel izquierdo — catálogo

- **Búsqueda** por texto en título/snippet.
- **Filtros** desplegables: tipo de recurso, alcaldía.
- **Limpiar filtros** restablece la vista.
- Lista paginada; cada tarjeta muestra tipo, fecha, título, snippet y badge de verificación.

**Tipos de recurso:** p. ej. Entrevista, Encuesta, Grupo focal *(según catálogo activo)*.

#### Panel derecho — detalle

**Pestaña Ficha:**

- Título, investigador, fecha, alcaldía.
- Resumen ejecutivo.
- Transcripción por turnos (Investigador / Informante).
- Badge **Verificado** si pasó validación institucional.

**Pestaña Herramientas:**

| Acción | Resultado |
|--------|-----------|
| Generar informe | PDF del recurso vía API |
| Exportar JSON | Archivo estructurado del recurso |
| Exportar CSV | Tabla resumida |
| Ver en mapa | `/mapa?recurso=ID&lat=…&lng=…` |

Si el recurso no tiene coordenadas, el enlace al mapa muestra aviso.

#### Estado vacío

Si no hay recursos publicados, se invita a crear contenido desde **Admin → Investigación cualitativa**.

---

### 5.6 Políticas públicas (`/politicas`)

#### Propósito

Traducir el diagnóstico territorial en **recomendaciones accionables** para inversión cultural y equidad de género.

#### Hero

- Badge de fase de implementación.
- KPIs: intervenciones planificadas, impacto social estimado, presupuesto MXN, alcance (16 municipios).
- Botón **Descargar informe completo** (PDF).

#### Evidencia del diagnóstico

- Texto narrativo con cifras destacadas (p. ej. déficit > 70%).
- **Gráfico de brecha de inversión** por alcaldía: barras comparativas para priorizar zonas.

#### Recomendaciones estratégicas

- **Filtro por objetivo:** Todos · Equidad de género · Cobertura territorial · Infraestructura · etc.
- Tarjetas de acción con:
  - Prioridad (Alta / Media / Baja).
  - Indicador de costo ($ a $$$).
  - Alcaldía objetivo.
  - Descripción e impacto estimado en ciudadanos.
  - Enlaces a Dashboard o Mapa cuando aplica.
  - **Descargar brief** (PDF individual por acción).

---

### 5.7 Soporte / Contacto (`/contacto`)

#### Propósito

Canal de ayuda, documentación técnica y acceso a datos abiertos.

#### Secciones

**A. Buzón de consultas**

Formulario con nombre, correo, asunto y mensaje. Las consultas llegan al panel **Admin → Consultas de contacto** (Autoridad).

**B. Preguntas frecuentes**

Acordeón con temas: actualización de datos, uso del mapa, API, licencias, etc.

**C. API de datos abiertos**

- URL base del API.
- Listado de endpoints (`/api/data/home`, `/api/data/mapa`, `/api/data/dashboard`, etc.).
- Ejemplo **cURL** listo para copiar.
- Token de acceso *(si está configurado en el entorno)*.

**D. Datasets**

Catálogo de conjuntos descargables (GeoJSON del padrón, CSV de métricas, etc.) con descripción y enlace.

**E. Políticas de uso**

Términos de reutilización de datos abiertos CDMX.

---

## 6. Mi Perfil

**Ruta:** `/perfil` · **Requisito:** sesión activa.

### 6.1 Cabecera

- Avatar (foto subida o iniciales del nombre).
- Nombre, subtítulo según rol e institución.
- Badge de rol (Ciudadano / Investigador / Autoridad).
- Estadísticas personales: recursos guardados, reportes generados.

### 6.2 Pestaña «Mis Recursos»

Lista de **espacios culturales guardados** desde el mapa.

| Acción | Descripción |
|--------|-------------|
| Filtrar por tipo | Desplegable con tipologías presentes en tu lista |
| Abrir | Enlace al mapa centrado en el espacio |
| Eliminar | Quita el espacio de favoritos *(Supabase)* |
| Explorar mapa | Botón para descubrir más espacios |

Estado vacío: mensaje invitando a guardar desde el visor geográfico.

### 6.3 Pestaña «Historial»

Registro de **exportaciones y descargas**:

- Título del informe o dataset.
- Formato (PDF, Excel, o CSV si es una exportación anterior).
- Fecha de generación.
- Volver a descargar o eliminar del historial.

### 6.4 Pestaña «Configuración»

- **Nombre para mostrar:** editable con Supabase.
- **Correo:** solo lectura.
- **Avatar:** subida de imagen al bucket `avatars` *(Supabase)*.

---

## 7. Centro de reportes

**Ruta:** `/reportes` · **Requisito:** sesión con Supabase (cualquier perfil verificado).

### 7.1 Vista general

- 4 KPIs personales de exportación (ver [9.4](#94-reportes--kpis)).
- Enlace **Explorar métricas** → Dashboard.

### 7.2 Generar un reporte — paso a paso

1. **Elegir plantilla** en la cuadrícula de plantillas:

   | Plantilla | Contenido típico | Formatos |
   |-----------|------------------|----------|
   | Diagnóstico Territorial | Brechas y cobertura por demarcación | PDF, Excel (.xlsx) |
   | Impacto Social | Participación por género, NSE y edad | PDF, Excel (.xlsx) |
   | Resumen Ejecutivo | Panorama CDMX para autoridades | PDF, Excel (.xlsx) |

2. **Ajustar filtros** (mismos ejes que Dashboard): alcaldía, disciplina, periodo, NSE, edad, género.

3. **Vista previa** del resumen de filtros antes de generar.

4. Pulsar el botón del formato deseado: **PDF** o **Excel**.

5. El archivo se descarga y queda registrado en **Historial de exportaciones**.

> **Nota:** El Centro de reportes **no ofrece CSV** como informe (un solo archivo plano). Para datos tabulares del padrón con muchas columnas, usa **Excel** o la exportación **CSV / JSON** desde el [Dashboard](#54-dashboard-estadístico-dashboard).

### 7.3 Contenido del Excel (.xlsx)

El libro generado en reportes incluye varias hojas (misma lógica que el informe completo del Dashboard):

| Hoja | Contenido |
|------|-----------|
| **Resumen** | Filtros aplicados, avisos y total de espacios filtrados |
| **KPIs** | Indicadores del tablero con los filtros actuales |
| **Participación** | Porcentajes por género (tipologías agregadas) |
| **Tendencia** | Serie de existencia anual del padrón (según territorio) |
| **Espacios** | Padrón filtrado — ver [columnas en 9.8](#98-exportación-del-padrón--columnas-y-hojas) |

### 7.4 Historial

Tabla con título, categoría, estado (Publicado / Generado / Borrador), fecha y autor.

- Menú de acciones: **Descargar de nuevo**, **Eliminar**.
- Los reportes generados en esta sesión/web quedan vinculados a tu `userId`.
- El historial puede incluir exportaciones **CSV antiguas**; las nuevas generaciones en web son **PDF** y **Excel**.

### 7.5 Panel de ayuda

Texto contextual sobre interpretación de filtros, formatos y tiempos de generación.

---

## 8. Panel de administración

**Ruta:** `/admin` · **Requisito:** rol **Autoridad** con Supabase.

Si no cumples el requisito, verás un mensaje con enlace a login (`?next=/admin`).

### 8.1 Vista general

- **Menú lateral** (desktop) o selector desplegable (móvil).
- **Cabecera:** título, botón **Nuevo Espacio**, acceso rápido a **Logs del Sistema**.
- **4 KPIs administrativos** (ver [9.7](#97-administración--kpis)).

### 8.2 Espacios culturales

Tres sub-pestañas:

#### Listado maestro

- Búsqueda por ID o nombre.
- Tabla: ID, nombre, alcaldía, tipo, estado, acciones (editar / eliminar).
- Paginación server-side con Supabase.
- **Nuevo espacio** abre modal de alta.

#### Flujo de revisión

Kanban del ciclo de vida:

```
Borrador → Revisión → Publicado
```

- Arrastrar o botón **Publicar** mueve espacios entre columnas.
- Solo espacios **Publicados** aparecen en el mapa público.

#### Editor cartográfico

- Seleccionar espacio sin coordenadas válidas.
- Introducir **latitud** y **longitud** manualmente.
- **Guardar coordenadas** actualiza el padrón y el pin en mapa.

### 8.3 Capas SIG

CRUD del catálogo de capas vectoriales/raster:

- Nombre, tipo, URL de servicio, estado activo/inactivo.
- Las capas activas alimentan el visor y el contador de KPI «Capas SIG».

### 8.4 Capas del mapa

Panel operativo para sincronización territorial:

- Estado de capas: métricas, densidad, geometrías, transporte.
- Botón **Sincronizar** ejecuta el pipeline admin (`sync:mapa`).
- Registro en `mapa_sync_log` *(visible en logs)*.

### 8.5 Fuentes de información

Metadatos de procedencia: institución, URL, fecha de corte, notas de calidad.

### 8.6 Políticas públicas

Editor de recomendaciones mostradas en `/politicas`:

- Secciones por objetivo estratégico.
- Acciones con prioridad, costo, alcaldía, impacto.
- Publicar/desactivar entradas.

### 8.7 Investigación cualitativa

Alta/edición de recursos del repositorio público:

- Tipo, título, alcaldía, investigador, resumen, transcripción JSON.
- Coordenadas opcionales para geolocalización en mapa.
- Flags: verificado, digitalizado, activo.

### 8.8 Centro de reportes (admin)

Gestión de **plantillas** disponibles en `/reportes`:

- Título, descripción, categoría, formatos permitidos.
- Filtros por defecto al seleccionar la plantilla.

### 8.9 Consultas de contacto

Bandeja de mensajes del buzón `/contacto`:

- Listado con fecha, correo, asunto.
- Modal de detalle; marcar como atendida.

### 8.9 Usuarios

- Listado de cuentas registradas.
- **Crear usuario** (correo, nombre, rol inicial).
- **Cambiar rol** (Ciudadano / Investigador / Autoridad).
- Solo accesible vía API protegida `require-autoridad`.

### 8.10 Historial / logs

Auditoría consolidada:

- Altas y cambios de espacios, capas, usuarios.
- Sincronizaciones de mapa.
- Exportaciones relevantes.
- Filtro por fecha y tipo de evento.

### 8.11 Pendientes

Cola de **validaciones institucionales** (contenido en revisión, consultas sin responder, espacios incompletos). El badge numérico en el menú indica cuántos ítems requieren atención.

---

## 9. Referencia de KPIs y gráficos

Índice del capítulo:

1. [9.1 Inicio](#91-inicio)
2. [9.2 Dashboard — KPIs](#92-dashboard--kpis)
3. [9.3 Dashboard — gráficos](#93-dashboard--gráficos)
4. [9.4 Reportes — KPIs](#94-reportes--kpis)
5. [9.5 Investigación — KPIs](#95-investigación--kpis)
6. [9.6 Políticas — KPIs del hero](#96-políticas--kpis-del-hero)
7. [9.7 Administración — KPIs](#97-administración--kpis)
8. [9.8 Exportación del padrón — columnas y hojas](#98-exportación-del-padrón--columnas-y-hojas)

### 9.1 Inicio

| Elemento | Tipo | Qué mide | Fuente |
|----------|------|----------|--------|
| Total Espacios | KPI | Registros georreferenciados | RPC / conteo padrón |
| Alcaldías | KPI | Demarcaciones con cobertura | Métricas territoriales |
| Cobertura Prom. | KPI | Media de índice de accesibilidad | `metricas_alcaldia` |
| Periodo | KPI | Año-semestre del corte | Config `anioCorte` |
| Crecimiento padrón | Área | Espacios por año | Serie existencia anual |
| Brecha por alcaldía | Barras H | % déficit + nº espacios + prioridad | Brecha territorial SECTEI |

### 9.2 Dashboard — KPIs

**Alcaldía = «Todas»**

| KPI | Valor | Nota bajo el número |
|-----|-------|-------------------|
| Total Espacios | Conteo nacional | «Padrón SECTEI» |
| Alcaldías | Normalmente 16 | «Demarcaciones» |
| Cobertura Territorial | % promedio CDMX | «Ciudad completa» |
| Brecha Promedio | Media de brechas | «Por demarcación» |

**Alcaldía específica**

| KPI | Significado |
|-----|-------------|
| Espacios en demarcación | Conteo local |
| Cobertura local | % en esa alcaldía |
| Brecha territorial | % déficit SECTEI |
| Tipologías activas | Tipos SIC distintos en el filtro |

### 9.3 Dashboard — gráficos

| Gráfico | Ejes / series | Interpretación |
|---------|---------------|----------------|
| **Participación por Género** | X: tipología SIC · Y: % · Series: Masculino, Femenino, Otros | Equidad de participación por tipo de espacio |
| **Existencia anual del padrón** | X: año · Y: espacios · Serie 2: variación anual | Crecimiento del padrón en el tiempo |
| **Indicadores de movilidad** | X: mes · Y: minutos promedio | Tiempo de acceso cuando no hay serie de existencia |
| **Densidad de infraestructura** | X: macrozona · Y: índice 0–100 | Concentración relativa Centro/Sur/Oriente/Poniente/Norte |
| **Distribución por tipología** | Sectores: tipo SIC · Valor: conteo | Composición del padrón filtrado |
| **Comparador A vs B** | Barras proporcionales por métrica | Brecha entre dos demarcaciones elegidas |

**Estados de espacio en tabla**

| Estado | Color | Significado |
|--------|-------|-------------|
| Publicado | Verde | Visible en mapa y estadísticas públicas |
| Revisión | Ámbar | En validación institucional |
| Borrador | Gris | Solo visible en admin |

### 9.4 Reportes — KPIs

*(Con Supabase — datos de tu cuenta)*

| KPI | Significado |
|-----|-------------|
| Total exportaciones | Registros en historial personal |
| Informes PDF | Conteo de PDFs generados |
| Datos tabulares | Archivos **Excel (.xlsx)** generados |
| Generador web | Exportaciones en el **mes en curso**; si no hay ninguna, texto *PDF · Excel disponibles*; si hay, fecha de la última exportación |

### 9.5 Investigación — KPIs

| KPI | Fórmula |
|-----|---------|
| Recursos totales | `COUNT(recursos activos)` |
| Digitalizados | `ROUND(digitalizados / total × 100)%` |
| Alcaldías | `COUNT(DISTINCT alcaldia)` |

### 9.6 Políticas — KPIs del hero

| KPI | Contenido |
|-----|-----------|
| Intervenciones | Acciones planificadas en el documento |
| Impacto social | Ciudadanos estimados beneficiados |
| Presupuesto | MXN estimados de inversión |
| Municipios | Alcaldías cubiertas (16) |

### 9.7 Administración — KPIs

| KPI | Origen |
|-----|--------|
| Total Espacios | Espacios activos georreferenciados |
| Pendientes | Registros en estado Revisión |
| Capas SIG | Capas con `activo = true` |
| Usuarios activos | Perfiles con sesión reciente |

### 9.8 Exportación del padrón — columnas y hojas

Aplica a la hoja **Espacios** del Excel generado en **Centro de reportes** y **Dashboard**, y a las descargas **CSV / JSON / GeoJSON** del padrón en Dashboard (con Supabase activo).

| Columna | Descripción |
|---------|-------------|
| ID del espacio | UUID o identificador en `espacios_culturales` |
| ID corto (vista tabla) | Primeros 8 caracteres del ID (mayúsculas) |
| Nombre | Denominación del espacio |
| Tipología SIC | Tipo oficial del registro |
| Alcaldía | Demarcación territorial |
| Dirección | Domicilio o referencia de ubicación *(si está capturada en el padrón)* |
| Descripción | Texto descriptivo del espacio *(si está capturada)* |
| Horario | Horario de servicio |
| Teléfono | Contacto telefónico |
| Latitud (WGS84) | Coordenada norte |
| Longitud (WGS84) | Coordenada este |
| Completitud (%) | Índice 0–100 según coordenadas, horario y teléfono |
| Estado editorial | Publicado · Revisión · Borrador |

**Origen de datos:** tabla `espacios_culturales` en Supabase. Celdas vacías indican que el campo no fue capturado o está pendiente de validación editorial.

**PDF (reportes):** incluye resumen de métricas y, en el anexo, una muestra de espacios con nombre, alcaldía, dirección/teléfono (si existen) y completitud — no replica todas las columnas del Excel.

---

## 10. Glosario y estados

### 10.1 Términos clave

| Término | Definición |
|---------|------------|
| **Padrón SECTEI** | Inventario oficial de espacios culturales de CDMX |
| **Tipología SIC** | Clasificación oficial del tipo de espacio (12 categorías) |
| **Brecha territorial** | % de déficit de infraestructura respecto a la demanda estimada |
| **Cobertura** | % de satisfacción del índice de accesibilidad cultural |
| **Completitud** | % de campos obligatorios llenos en un registro |
| **Recurso cualitativo** | Entrevista, encuesta u otro material de investigación de campo |
| **Macrozona** | Agrupación territorial: Centro, Sur, Oriente, Poniente, Norte |
| **NSE** | Nivel socioeconómico (Bajo, Medio, Alto) |
| **Corte / anioCorte** | Año de referencia de las métricas mostradas |

### 10.2 Formatos de exportación

| Formato | Dónde se genera | Contenido |
|---------|-----------------|-----------|
| PDF | Dashboard, Reportes, Políticas, Investigación | Informe visual o brief |
| CSV | Dashboard, Investigación | Padrón o transcripciones en texto plano (coma + UTF-8 en padrón; ver [9.8](#98-exportación-del-padrón--columnas-y-hojas)) |
| XLSX | Dashboard, Reportes | Libro Excel multi-hoja; padrón en hoja **Espacios** ([9.8](#98-exportación-del-padrón--columnas-y-hojas)) |
| GeoJSON | Dashboard | Features con propiedades del padrón ([9.8](#98-exportación-del-padrón--columnas-y-hojas)) |
| JSON | Dashboard, Investigación | Snapshot estructurado (padrón o recurso cualitativo) |

---

## 11. Preguntas frecuentes operativas

**¿Puedo usar la plataforma sin registrarme?**  
Sí. Inicio, Proyecto, Mapa, Dashboard, Investigación, Políticas y Contacto son públicos. Necesitas cuenta para guardar espacios, generar reportes (Supabase) y acceder a Admin.

**¿Por qué no veo el menú Administración?**  
Solo aparece con sesión de **Autoridad**. Investigadores y ciudadanos no lo ven por diseño.

**¿Por qué los números del Dashboard no cambian al filtrar?**  
En modo demo algunos indicadores son estáticos. Con Supabase, verifica el badge verde y que existan métricas para el `anioCorte` seleccionado.

**¿Cómo comparto un espacio específico del mapa?**  
Copia la URL del navegador tras seleccionar el espacio; incluirá `?espacio=ID` o coordenadas.

**¿Qué significa «Sin datos de participación para los filtros actuales»?**  
La combinación alcaldía + disciplina + género + edad no tiene filas en la tabla de estadísticas. Prueba ampliar filtros a «Todas» / «Todos».

**¿Cómo actualizo las capas del mapa tras una migración?**  
Como Autoridad: Admin → Capas del mapa → **Sincronizar**. Consulta también la [documentación técnica del mapa](ARCHITECTURE.md#mapa-territorial--seeds-y-sincronización).

**¿Puedo cambiar mi rol después del registro?**  
No desde la interfaz pública. Una **Autoridad** puede reasignar roles en Admin → Usuarios.

---

## Documentación relacionada

- [Arquitectura MVC y operación del mapa territorial](ARCHITECTURE.md#mapa-territorial--seeds-y-sincronización) — capas Supabase, seeds y sincronización.
- [README del proyecto](../README.md) — instalación y arranque en desarrollo.

---

*GEO ARTE CDMX · Gobierno de la Ciudad de México · Manual de usuario v1.1*
