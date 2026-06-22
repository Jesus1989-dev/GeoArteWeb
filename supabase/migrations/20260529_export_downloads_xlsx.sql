-- Ampliar formatos permitidos en export_downloads (Excel web).
-- Ejecutar en Supabase SQL Editor si la migración automática no corrió.

ALTER TABLE export_downloads
  DROP CONSTRAINT IF EXISTS export_downloads_format_check;

ALTER TABLE export_downloads
  ADD CONSTRAINT export_downloads_format_check
  CHECK (format = ANY (ARRAY['PDF'::text, 'CSV'::text, 'XLSX'::text]));
