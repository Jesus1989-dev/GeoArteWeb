-- Seed inicial — Fuentes de Información (página Proyecto).
-- Idempotente: ON CONFLICT actualiza estado y orden.

insert into public.fuentes_informacion (
  institucion,
  dataset,
  estado,
  tipo_estado,
  url_fuente,
  orden
) values
  (
    'INEGI',
    'DENUE (Servicios Culturales y Deportivos)',
    'Actualizado 2024',
    'activo',
    'https://www.inegi.org.mx/app/descarga/',
    1
  ),
  (
    'Secretaría de Cultura CDMX',
    'Cartelera y Directorio de Centros Culturales',
    'Sincronizado',
    'activo',
    'https://www.cultura.cdmx.gob.mx/',
    2
  ),
  (
    'ADIP CDMX',
    'Portal de Datos Abiertos - Movilidad y Transporte',
    'Conexión API',
    'api',
    'https://datos.cdmx.gob.mx/',
    3
  ),
  (
    'Censo de Población 2020',
    'Datos Demográficos por Manzana',
    'Estático',
    'estatico',
    'https://www.inegi.org.mx/programas/ccpv/2020/',
    4
  ),
  (
    'Encuesta de Consumo Cultural',
    'Preferencias y Hábitos de Participación',
    'Procesado',
    'procesado',
    null,
    5
  )
on conflict (institucion, dataset) do update set
  estado = excluded.estado,
  tipo_estado = excluded.tipo_estado,
  url_fuente = excluded.url_fuente,
  orden = excluded.orden,
  activo = true,
  updated_at = now();
