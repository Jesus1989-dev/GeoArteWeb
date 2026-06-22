-- Métricas cuantitativas por recomendación (impacto y presupuesto en padrón).

alter table public.politicas_recomendaciones
  add column if not exists impacto_ciudadanos integer
    check (impacto_ciudadanos is null or impacto_ciudadanos >= 0);

alter table public.politicas_recomendaciones
  add column if not exists presupuesto_mxn bigint
    check (presupuesto_mxn is null or presupuesto_mxn >= 0);

comment on column public.politicas_recomendaciones.impacto_ciudadanos is
  'Ciudadanos beneficiados estimados para la intervención.';
comment on column public.politicas_recomendaciones.presupuesto_mxn is
  'Presupuesto estimado en pesos mexicanos (MXN).';

update public.politicas_recomendaciones set
  impacto_ciudadanos = v.impacto_ciudadanos,
  presupuesto_mxn = v.presupuesto_mxn,
  updated_at = now()
from (values
  ('g1',  28500,  9000000::bigint),
  ('g2',   6000,  4500000::bigint),
  ('p1',  45000,  4500000::bigint),
  ('p2',  22000,  9000000::bigint),
  ('d1',  31200,  9000000::bigint),
  ('e1',  18500, 13500000::bigint)
) as v(id, impacto_ciudadanos, presupuesto_mxn)
where politicas_recomendaciones.id = v.id;
