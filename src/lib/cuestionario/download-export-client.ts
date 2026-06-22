export async function downloadCuestionarioExportClient(options: {
  periodo: string;
  alcaldia: string;
  format: "PDF" | "XLSX";
}): Promise<void> {
  const params = new URLSearchParams({
    periodo: options.periodo,
    format: options.format,
  });
  if (options.alcaldia && options.alcaldia !== "Todas") {
    params.set("alcaldia", options.alcaldia);
  }

  const res = await fetch(`/api/cuestionario/export?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Error HTTP ${res.status}`);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const fileName = match?.[1] ?? `Cuestionario_${options.periodo}.${options.format === "PDF" ? "pdf" : "xlsx"}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
