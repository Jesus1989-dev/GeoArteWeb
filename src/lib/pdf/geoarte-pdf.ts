import type { jsPDF } from "jspdf";

export const GEO_PDF_COLORS = {
  navy: [31, 58, 95] as [number, number, number],
  navyDark: [21, 42, 69] as [number, number, number],
  pink: [225, 5, 153] as [number, number, number],
  surface: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

export type GeoArtePdfTableOptions = {
  fontSize?: number;
  columnStyles?: Record<number, { cellWidth?: number | "auto"; halign?: "left" | "center" | "right" }>;
};

/** Texto seguro para jsPDF (Helvetica / WinAnsi). */
export function sanitizePdfText(text: string): string {
  return text
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u00B7/g, " - ")
    .replace(/\u2022/g, "-")
    .replace(/«/g, '"')
    .replace(/»/g, '"')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sanitizeCell(value: string | number): string {
  return sanitizePdfText(String(value ?? ""));
}

export type GeoArtePdfWriter = {
  doc: jsPDF;
  margin: number;
  cursorY: number;
  writeDocumentTitle: (title: string) => void;
  writeMetaLine: (text: string) => void;
  writeSectionTitle: (title: string) => void;
  writeParagraph: (text: string, fontSize?: number) => void;
  addGap: (mm?: number) => void;
  addKeyValueTable: (rows: Array<[string, string | number]>) => void;
  addDataTable: (
    head: string[],
    body: Array<Array<string | number>>,
    options?: GeoArtePdfTableOptions,
  ) => void;
  writeFooter: (label?: string) => void;
  toBytes: () => Uint8Array;
};

export async function createGeoArtePdfWriter(options?: {
  orientation?: "portrait" | "landscape";
}): Promise<GeoArtePdfWriter> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: options?.orientation ?? "portrait",
  });

  const margin = 14;
  const lineHeight = 5.5;
  let cursorY = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;

  function ensureSpace(heightMm: number) {
    if (cursorY + heightMm > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
  }

  function writeLines(text: string, fontSize: number, bold: boolean, color?: [number, number, number]) {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    if (color) doc.setTextColor(...color);
    else doc.setTextColor(...GEO_PDF_COLORS.navyDark);

    const wrapped = doc.splitTextToSize(sanitizePdfText(text), contentWidth) as string[];
    for (const line of wrapped) {
      ensureSpace(lineHeight);
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    }
  }

  function addTable(
    head: string[],
    body: Array<Array<string | number>>,
    tableOptions?: GeoArtePdfTableOptions,
  ) {
    const fontSize = tableOptions?.fontSize ?? 8;

    autoTable(doc, {
      head: [head.map(sanitizeCell)],
      body: body.map((row) => row.map(sanitizeCell)),
      startY: cursorY,
      margin: { left: margin, right: margin },
      styles: {
        fontSize,
        cellPadding: 2.5,
        lineColor: GEO_PDF_COLORS.border,
        lineWidth: 0.1,
        textColor: GEO_PDF_COLORS.navyDark,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: GEO_PDF_COLORS.navy,
        textColor: GEO_PDF_COLORS.white,
        fontStyle: "bold",
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: GEO_PDF_COLORS.surface,
      },
      columnStyles: tableOptions?.columnStyles,
      theme: "grid",
      didDrawPage: () => {
        doc.setTextColor(...GEO_PDF_COLORS.navyDark);
      },
    });

    const finalY = (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? cursorY;
    cursorY = finalY + 6;
  }

  const writer: GeoArtePdfWriter = {
    doc,
    margin,
    get cursorY() {
      return cursorY;
    },
    set cursorY(value: number) {
      cursorY = value;
    },

    writeDocumentTitle(title: string) {
      writeLines(title, 16, true, GEO_PDF_COLORS.navy);
      cursorY += 2;
    },

    writeMetaLine(text: string) {
      writeLines(text, 9, false, GEO_PDF_COLORS.muted);
    },

    writeSectionTitle(title: string) {
      ensureSpace(10);
      cursorY += 2;
      writeLines(title, 11, true, GEO_PDF_COLORS.navy);
      cursorY += 1;
    },

    writeParagraph(text: string, fontSize = 9) {
      writeLines(text, fontSize, false);
      cursorY += 1;
    },

    addGap(mm = 4) {
      cursorY += mm;
    },

    addKeyValueTable(rows: Array<[string, string | number]>) {
      if (rows.length === 0) return;
      addTable(
        ["Campo", "Valor"],
        rows.map(([field, value]) => [field, value]),
        {
          columnStyles: {
            0: { cellWidth: 52 },
            1: { cellWidth: "auto" },
          },
        },
      );
    },

    addDataTable(head, body, tableOptions) {
      if (body.length === 0) return;
      addTable(head, body, tableOptions);
    },

    writeFooter(label = "Generado por GeoArte CDMX") {
      cursorY += 4;
      writeLines(`${label} · ${new Date().toISOString().slice(0, 10)}`, 8, false, GEO_PDF_COLORS.muted);
    },

    toBytes() {
      return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
    },
  };

  return writer;
}
