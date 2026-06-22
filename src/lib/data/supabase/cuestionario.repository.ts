import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildCuestionarioKpis,
  etiquetaCostoCuestionario,
  etiquetaPctMujeresCuestionario,
  etiquetaRangoEdadCuestionario,
  etiquetaTiempoViajeCuestionario,
  type CuestionarioAdminRow,
  type CuestionarioDetalleEspacio,
  type CuestionarioEstatusRevision,
  type CuestionarioKpi,
  type CuestionarioResumenAlcaldia,
} from "@/lib/domain/cuestionario";
import {
  filaInstitucionalFromRaw,
  type CuestionarioInstitutionalRow,
} from "@/lib/cuestionario/cuestionario-institutional";
import {
  esPeriodoCuestionario,
  periodoSemestralActual,
  periodosSemestralesRecientes,
} from "@/lib/cuestionario/cuestionario-periodo";

function mapResumenRow(row: Record<string, unknown>): CuestionarioResumenAlcaldia {
  return {
    periodo: String(row.periodo ?? ""),
    alcaldiaId: row.alcaldia_id != null ? String(row.alcaldia_id) : null,
    alcaldiaNombre: String(row.alcaldia_nombre ?? "Sin alcaldía"),
    respuestasCapturadas: Number(row.respuestas_capturadas) || 0,
    espaciosConRespuesta: Number(row.espacios_con_respuesta) || 0,
    totalUsuariosInscritos: Number(row.total_usuarios_inscritos) || 0,
    aforoInstaladoTotal: Number(row.aforo_instalado_total) || 0,
    empleoRemuneradoTotal: Number(row.empleo_remunerado_total) || 0,
    conveniosReportados: Number(row.convenios_reportados) || 0,
    pctMujeresPromedio:
      row.pct_mujeres_promedio != null
        ? Number(row.pct_mujeres_promedio)
        : null,
    espaciosPerfilJovenes: Number(row.espacios_perfil_jovenes) || 0,
    espaciosGratuitos: Number(row.espacios_gratuitos) || 0,
  };
}

function mapDetalleRow(row: Record<string, unknown>): CuestionarioDetalleEspacio {
  const espRaw = row.espacios_culturales;
  const esp =
    espRaw != null && typeof espRaw === "object"
      ? (espRaw as Record<string, unknown>)
      : null;

  const costo = row.p3_costo != null ? String(row.p3_costo) : null;
  const pctMujeres = row.p5_pct_mujeres != null ? String(row.p5_pct_mujeres) : null;
  const rangoEdad = row.p6_rango_edad != null ? String(row.p6_rango_edad) : null;
  const tiempoViaje = row.p9_tiempo_viaje != null ? String(row.p9_tiempo_viaje) : null;

  return {
    id: String(row.id ?? ""),
    periodo: String(row.periodo ?? ""),
    espacioId: String(row.espacio_id ?? ""),
    espacioNombre: String(esp?.nombre ?? "Sin nombre"),
    espacioAlcaldia: String(esp?.alcaldia ?? "—"),
    aforo: row.p2_aforo != null ? Number(row.p2_aforo) : null,
    costo,
    costoEtiqueta: etiquetaCostoCuestionario(costo),
    usuarios: row.p4_usuarios != null ? Number(row.p4_usuarios) : null,
    pctMujeres,
    pctMujeresEtiqueta: etiquetaPctMujeresCuestionario(pctMujeres),
    rangoEdad,
    rangoEdadEtiqueta: etiquetaRangoEdadCuestionario(rangoEdad),
    tiempoViaje,
    tiempoViajeEtiqueta: etiquetaTiempoViajeCuestionario(tiempoViaje),
    personal: row.p10_personal != null ? Number(row.p10_personal) : null,
    convenios: row.p11_convenios != null ? Number(row.p11_convenios) : null,
    actualizadoEl: row.updated_at != null ? String(row.updated_at) : null,
  };
}

export async function fetchResumenCuestionarioWithClient(
  client: SupabaseClient,
  periodo: string,
): Promise<CuestionarioResumenAlcaldia[]> {
  const { data, error } = await client
    .from("v_cuestionario_resumen_alcaldia")
    .select("*")
    .eq("periodo", periodo)
    .order("alcaldia_nombre");

  if (error) {
    throw new Error(`Supabase v_cuestionario_resumen_alcaldia: ${error.message}`);
  }

  return (data ?? []).map((row) =>
    mapResumenRow(row as Record<string, unknown>),
  );
}

export async function fetchDetalleCuestionarioWithClient(
  client: SupabaseClient,
  options: { periodo: string; alcaldiaNombre?: string },
): Promise<CuestionarioDetalleEspacio[]> {
  const { data, error } = await client
    .from("respuestas_cuestionario")
    .select(
      "id, periodo, espacio_id, p2_aforo, p3_costo, p4_usuarios, p5_pct_mujeres, p6_rango_edad, p9_tiempo_viaje, p10_personal, p11_convenios, updated_at, espacios_culturales(nombre, alcaldia)",
    )
    .eq("periodo", options.periodo)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase respuestas_cuestionario: ${error.message}`);
  }

  let rows = (data ?? []).map((row) =>
    mapDetalleRow(row as Record<string, unknown>),
  );

  if (options.alcaldiaNombre && options.alcaldiaNombre !== "Todas") {
    const filtro = options.alcaldiaNombre.trim().toLowerCase();
    rows = rows.filter(
      (r) => r.espacioAlcaldia.trim().toLowerCase() === filtro,
    );
  }

  return rows;
}

async function fetchAuxiliaresForRespuestas(
  client: SupabaseClient,
  respuestaIds: string[],
): Promise<{
  p1: Map<string, string[]>;
  p7: Map<string, string[]>;
  p8: Map<string, Array<{ barrera: string; valor: number }>>;
}> {
  const p1 = new Map<string, string[]>();
  const p7 = new Map<string, string[]>();
  const p8 = new Map<string, Array<{ barrera: string; valor: number }>>();

  if (respuestaIds.length === 0) return { p1, p7, p8 };

  const [p1Res, p7Res, p8Res] = await Promise.all([
    client.from("respuestas_p1_disciplinas").select("respuesta_id, disciplina").in("respuesta_id", respuestaIds),
    client.from("respuestas_p7_vulnerabilidad").select("respuesta_id, grupo").in("respuesta_id", respuestaIds),
    client.from("respuestas_p8_barreras").select("respuesta_id, barrera, valor").in("respuesta_id", respuestaIds),
  ]);

  for (const row of p1Res.data ?? []) {
    const rid = String((row as { respuesta_id: string }).respuesta_id);
    const val = String((row as { disciplina: string }).disciplina);
    const list = p1.get(rid) ?? [];
    list.push(val);
    p1.set(rid, list);
  }
  for (const row of p7Res.data ?? []) {
    const rid = String((row as { respuesta_id: string }).respuesta_id);
    const val = String((row as { grupo: string }).grupo);
    const list = p7.get(rid) ?? [];
    list.push(val);
    p7.set(rid, list);
  }
  for (const row of p8Res.data ?? []) {
    const rid = String((row as { respuesta_id: string }).respuesta_id);
    const barrera = String((row as { barrera: string }).barrera);
    const valor = Number((row as { valor: number }).valor) || 0;
    const list = p8.get(rid) ?? [];
    list.push({ barrera, valor });
    p8.set(rid, list);
  }

  return { p1, p7, p8 };
}

export async function fetchInstitutionalRowsWithClient(
  client: SupabaseClient,
  options: { periodo: string; alcaldiaNombre?: string },
): Promise<CuestionarioInstitutionalRow[]> {
  const { data, error } = await client
    .from("respuestas_cuestionario")
    .select(
      "id, p2_aforo, p3_costo, p4_usuarios, p5_pct_mujeres, p6_rango_edad, p9_tiempo_viaje, p10_personal, p11_convenios, espacios_culturales(nombre, alcaldia)",
    )
    .eq("periodo", options.periodo)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase respuestas (institucional): ${error.message}`);
  }

  const filas = (data ?? []) as Record<string, unknown>[];
  const ids = filas.map((f) => String(f.id ?? ""));
  const aux = await fetchAuxiliaresForRespuestas(client, ids);

  const out: CuestionarioInstitutionalRow[] = [];
  for (const fila of filas) {
    const espRaw = fila.espacios_culturales;
    const esp =
      espRaw != null && typeof espRaw === "object"
        ? (espRaw as Record<string, unknown>)
        : null;
    const alcaldia = String(esp?.alcaldia ?? "—");
    if (
      options.alcaldiaNombre &&
      options.alcaldiaNombre !== "Todas" &&
      alcaldia.trim().toLowerCase() !== options.alcaldiaNombre.trim().toLowerCase()
    ) {
      continue;
    }
    const rid = String(fila.id ?? "");
    out.push(
      filaInstitucionalFromRaw({
        espacioNombre: String(esp?.nombre ?? "Sin nombre"),
        espacioAlcaldia: alcaldia,
        p2Aforo: fila.p2_aforo != null ? Number(fila.p2_aforo) : null,
        p3Costo: fila.p3_costo != null ? String(fila.p3_costo) : null,
        p4Usuarios: fila.p4_usuarios != null ? Number(fila.p4_usuarios) : null,
        p5PctMujeres: fila.p5_pct_mujeres != null ? String(fila.p5_pct_mujeres) : null,
        p6RangoEdad: fila.p6_rango_edad != null ? String(fila.p6_rango_edad) : null,
        p9TiempoViaje: fila.p9_tiempo_viaje != null ? String(fila.p9_tiempo_viaje) : null,
        p10Personal: fila.p10_personal != null ? Number(fila.p10_personal) : null,
        p11Convenios: fila.p11_convenios != null ? Number(fila.p11_convenios) : null,
        p1Disciplinas: aux.p1.get(rid) ?? [],
        p7Vulnerabilidad: aux.p7.get(rid) ?? [],
        p8Barreras: aux.p8.get(rid) ?? [],
      }),
    );
  }
  return out;
}

export async function fetchAdminCuestionarioRowsWithClient(
  client: SupabaseClient,
  periodo: string,
): Promise<CuestionarioAdminRow[]> {
  const { data, error } = await client
    .from("respuestas_cuestionario")
    .select(
      "id, periodo, espacio_id, capturado_por, p2_aforo, p3_costo, p4_usuarios, p5_pct_mujeres, p6_rango_edad, p9_tiempo_viaje, p10_personal, p11_convenios, updated_at, espacios_culturales(nombre, alcaldia)",
    )
    .eq("periodo", periodo)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase admin cuestionario: ${error.message}`);
  }

  const filas = (data ?? []) as Record<string, unknown>[];
  const ids = filas.map((f) => String(f.id ?? ""));

  const revisionMap = new Map<
    string,
    { estatus: CuestionarioEstatusRevision; notas: string | null; revisado_at: string | null }
  >();

  if (ids.length > 0) {
    const { data: revData, error: revError } = await client
      .from("cuestionario_revision_admin")
      .select("respuesta_id, estatus, notas, revisado_at")
      .in("respuesta_id", ids);

    if (!revError) {
      for (const rev of revData ?? []) {
        const r = rev as {
          respuesta_id: string;
          estatus: CuestionarioEstatusRevision;
          notas: string | null;
          revisado_at: string | null;
        };
        revisionMap.set(r.respuesta_id, {
          estatus: r.estatus,
          notas: r.notas,
          revisado_at: r.revisado_at,
        });
      }
    }
  }

  return filas.map((row) => {
    const base = mapDetalleRow(row);
    const rid = String(row.id ?? "");
    const rev = revisionMap.get(rid);
    return {
      ...base,
      capturadoPor: row.capturado_por != null ? String(row.capturado_por) : null,
      estatusRevision: rev?.estatus ?? "pendiente",
      notasRevision: rev?.notas ?? null,
      revisadoEl: rev?.revisado_at ?? null,
    };
  });
}

export async function upsertCuestionarioRevisionWithClient(
  client: SupabaseClient,
  input: {
    respuestaId: string;
    estatus: CuestionarioEstatusRevision;
    notas?: string | null;
    revisadoPor: string;
  },
): Promise<void> {
  const { error } = await client.from("cuestionario_revision_admin").upsert(
    {
      respuesta_id: input.respuestaId,
      estatus: input.estatus,
      notas: input.notas ?? null,
      revisado_por: input.revisadoPor,
      revisado_at: new Date().toISOString(),
    },
    { onConflict: "respuesta_id" },
  );
  if (error) {
    throw new Error(`No se pudo guardar revisión: ${error.message}`);
  }
}

export async function fetchPeriodosCuestionarioWithClient(
  client: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await client
    .from("respuestas_cuestionario")
    .select("periodo")
    .order("periodo", { ascending: false });

  if (error) {
    console.warn("[cuestionario] periodos:", error.message);
    return periodosSemestralesRecientes();
  }

  const set = new Set<string>();
  for (const row of data ?? []) {
    const p = String((row as { periodo?: string }).periodo ?? "").trim();
    if (esPeriodoCuestionario(p)) set.add(p);
  }

  const fromDb = [...set];
  if (fromDb.length > 0) return fromDb;

  return periodosSemestralesRecientes();
}

export type CuestionarioSupabasePayload = {
  periodo: string;
  periodoOpciones: string[];
  alcaldiaOpciones: string[];
  resumenAlcaldia: CuestionarioResumenAlcaldia[];
  detalleEspacios: CuestionarioDetalleEspacio[];
  kpis: CuestionarioKpi[];
  totalDetalle: number;
};

export async function fetchCuestionarioPayloadWithClient(
  client: SupabaseClient,
  options?: { periodo?: string; alcaldia?: string },
): Promise<CuestionarioSupabasePayload> {
  const periodoOpciones = await fetchPeriodosCuestionarioWithClient(client);
  const periodo =
    options?.periodo && esPeriodoCuestionario(options.periodo)
      ? options.periodo
      : periodoOpciones[0] ?? periodoSemestralActual();

  const alcaldia = options?.alcaldia?.trim() || "Todas";

  const [resumenAlcaldia, detalleEspacios] = await Promise.all([
    fetchResumenCuestionarioWithClient(client, periodo),
    fetchDetalleCuestionarioWithClient(client, {
      periodo,
      alcaldiaNombre: alcaldia !== "Todas" ? alcaldia : undefined,
    }),
  ]);

  const alcaldiasFromResumen = resumenAlcaldia
    .map((r) => r.alcaldiaNombre)
    .filter(Boolean);
  const alcaldiaOpciones = [
    "Todas",
    ...[...new Set(alcaldiasFromResumen)].sort((a, b) =>
      a.localeCompare(b, "es"),
    ),
  ];

  return {
    periodo,
    periodoOpciones,
    alcaldiaOpciones,
    resumenAlcaldia,
    detalleEspacios,
    kpis: buildCuestionarioKpis(resumenAlcaldia),
    totalDetalle: detalleEspacios.length,
  };
}
