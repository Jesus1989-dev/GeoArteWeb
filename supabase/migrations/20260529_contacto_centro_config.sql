-- Configuración editorial de /contacto (Recursos y Soporte).

create table if not exists public.contacto_centro_config (
  id text primary key default 'default',
  hero jsonb not null,
  buzon jsonb not null,
  faq_titulo text not null,
  faq_items jsonb not null default '[]'::jsonb,
  api jsonb not null,
  api_endpoints jsonb not null default '[]'::jsonb,
  datasets_section jsonb not null,
  datasets jsonb not null default '[]'::jsonb,
  politicas jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.contacto_centro_config enable row level security;

drop policy if exists "contacto_centro_config_select_public" on public.contacto_centro_config;
create policy "contacto_centro_config_select_public"
  on public.contacto_centro_config
  for select
  to anon, authenticated
  using (true);

insert into public.contacto_centro_config (
  id, hero, buzon, faq_titulo, faq_items, api, api_endpoints, datasets_section, datasets, politicas
) values (
  'default',
  '{"breadcrumbInicio":"Inicio","breadcrumbActual":"Contacto y documentación","titulo":"Recursos y Soporte","subtitulo":"Acceda a la infraestructura de datos abiertos de la Ciudad de México y resuelva sus dudas sobre el proyecto GEO ARTE."}'::jsonb,
  '{"badge":"Institucional","titulo":"Buzón de Consultas","descripcion":"Para solicitudes de datos específicos, convenios de investigación o soporte técnico.","btnEnviar":"Enviar Mensaje","campos":{"nombre":{"label":"Nombre completo","placeholder":"Ej. Juan Pérez"},"email":{"label":"Correo electrónico","placeholder":"juan@ejemplo.com"},"asunto":{"label":"Asunto","placeholder":"Tipo de consulta"},"mensaje":{"label":"Mensaje","placeholder":"Describa su solicitud detalladamente..."}}}'::jsonb,
  'Preguntas Frecuentes',
  '[
    {"id":"actualizacion","question":"¿Cómo se actualizan los datos de los espacios culturales?","answer":"Nuestros datos se sincronizan mensualmente con el Sistema de Información Cultural (SIC) y se validan mediante inspecciones territoriales y encuestas directas a los administradores de los recintos."},
    {"id":"mapas-investigacion","question":"¿Puedo utilizar los mapas en mi propia investigación?","answer":"Sí, siempre que cite la fuente GEO ARTE CDMX, la fecha de consulta y respete la licencia de datos abiertos aplicable a cada capa. Para publicaciones académicas puede solicitar metadatos ampliados mediante el buzón de consultas."},
    {"id":"brecha","question":"¿Qué es una \"brecha de cobertura cultural\"?","answer":"Es la diferencia entre la oferta cultural registrada y la demanda o necesidad territorial estimada en una demarcación. Se calcula a partir de indicadores de densidad, accesibilidad y equipamiento por habitante."},
    {"id":"reportar","question":"¿Cómo reportar un dato incorrecto en el mapa?","answer":"Use el formulario de esta página indicando el ID del espacio o la ubicación aproximada. El equipo de validación revisará el reporte y, de ser procedente, actualizará el registro en el siguiente ciclo de sincronización con el SIC."}
  ]'::jsonb,
  '{"titulo":"API de Datos Georreferenciados","subtitulo":"Endpoints públicos para integración técnica y consumo de datos en tiempo real.","btnDocumentacion":"Documentación Completa","curlTitulo":"Consumo vía CURL","btnCopiarToken":"Copiar Token de Prueba","demoToken":"geoarte_demo_cdmx_2026"}'::jsonb,
  '[
    {"method":"GET","path":"/api/v1/espacios/geojson","description":"Retorna la colección completa de espacios culturales en formato FeatureCollection de GeoJSON."},
    {"method":"GET","path":"/api/v1/alcaldias/{id}/stats","description":"Obtiene estadísticas agregadas por alcaldía, incluyendo índices de brecha cultural."},
    {"method":"GET","path":"/api/v1/layers/transporte","description":"Capa de infraestructura de transporte público (Metro, Metrobús, Cablebús) georreferenciada."},
    {"method":"GET","path":"/api/v1/search?query={q}","description":"Búsqueda global por nombre de espacio, disciplina artística o colonia."}
  ]'::jsonb,
  '{"titulo":"Datasets para Descarga Directa","btnDescargar":"Descargar ahora"}'::jsonb,
  '[
    {"id":"espacios","title":"Capa Base de Espacios","format":"GeoJSON (GIS)","size":"Dinámico","accent":"blue","filename":"geoarte-capa-espacios.geojson"},
    {"id":"indicadores","title":"Matriz de Indicadores","format":"Excel (XLSX)","size":"Dinámico","accent":"green","filename":"geoarte-matriz-indicadores.xlsx"},
    {"id":"reporte","title":"Reporte Anual","format":"PDF","size":"Dinámico","accent":"red","filename":"geoarte-reporte-anual.pdf"},
    {"id":"api-backup","title":"API Full Backup","format":"JSON","size":"Dinámico","accent":"orange","filename":"geoarte-api-full-backup.json"}
  ]'::jsonb,
  '{"politicas":{"titulo":"Políticas de Datos Abiertos","descripcion":"La información contenida en esta plataforma es pública conforme a la Ley de Transparencia de la Ciudad de México y puede reutilizarse con las restricciones señaladas en cada conjunto.","linkLabel":"Leer política completa","linkHref":"/sobre-el-proyecto"},"atribucion":{"titulo":"Atribución y Licencia","descripcion":"Salvo indicación contraria, los datos se publican bajo licencia Creative Commons BY 4.0. Debe citar a GEO ARTE CDMX, la Secretaría de Cultura y la fecha de consulta.","linkLabel":"Guía de citación","linkHref":"/contacto#datasets"},"apiKey":{"titulo":"¿Necesitas una API Key dedicada?","descripcion":"Para integraciones de alta demanda, acceso a datos restringidos o soporte técnico institucional.","btnLabel":"Solicitar Credenciales","btnHref":"/contacto#api"}}'::jsonb
)
on conflict (id) do update set
  hero = excluded.hero,
  buzon = excluded.buzon,
  faq_titulo = excluded.faq_titulo,
  faq_items = excluded.faq_items,
  api = excluded.api,
  api_endpoints = excluded.api_endpoints,
  datasets_section = excluded.datasets_section,
  datasets = excluded.datasets,
  politicas = excluded.politicas,
  updated_at = now();
