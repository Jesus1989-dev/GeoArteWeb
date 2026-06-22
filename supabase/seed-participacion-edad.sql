-- Serie «Participación Edad» para el dashboard GeoArteCDMX.
-- Ejecutar en Supabase → SQL Editor (rol con permiso INSERT en estadisticas).
-- Reemplaza filas previas del mismo corte para evitar duplicados.

DELETE FROM estadisticas
WHERE categoria = 'Participación Edad'
  AND anio = 2026
  AND alcaldia_id IS NULL;

INSERT INTO estadisticas (
  titulo,
  categoria,
  valor,
  unidad,
  anio,
  alcaldia_id,
  disciplina_nombre,
  tipo_espacio_sic,
  segmento_nse
)
SELECT
  titulo,
  'Participación Edad',
  valor,
  '%',
  2026,
  NULL,
  rango_edad,
  NULL,
  NULL
FROM (
  VALUES
    ('Part. Mujeres', '18-29', 58.2),
    ('Part. Hombres', '18-29', 52.4),
    ('Part. No Binario', '18-29', 14.1),
    ('Part. Mujeres', '30-44', 54.6),
    ('Part. Hombres', '30-44', 56.8),
    ('Part. No Binario', '30-44', 12.3),
    ('Part. Mujeres', '45-59', 51.2),
    ('Part. Hombres', '45-59', 59.1),
    ('Part. No Binario', '45-59', 9.8),
    ('Part. Mujeres', '60+', 48.5),
    ('Part. Hombres', '60+', 61.3),
    ('Part. No Binario', '60+', 7.2)
) AS v(titulo, rango_edad, valor);
