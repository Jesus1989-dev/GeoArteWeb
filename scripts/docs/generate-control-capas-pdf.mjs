/**
 * Genera docs/CONTROL-DE-CAPAS-MAPA.pdf desde docs/CONTROL-DE-CAPAS-MAPA.md
 * Uso: node scripts/docs/generate-control-capas-pdf.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const mdPath = join(root, "docs", "cliente", "CONTROL-DE-CAPAS-MAPA.md");
const pdfPath = join(root, "docs", "cliente", "CONTROL-DE-CAPAS-MAPA.pdf");

const require = createRequire(import.meta.url);
const { jsPDF } = require("jspdf");

function sanitizePdfText(text) {
  return text
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u00B7/g, " - ")
    .replace(/\u2022/g, "-")
    .replace(/\u2192/g, "->")
    .replace(/`/g, "'")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", text: codeLines.join("\n") });
      i++;
      continue;
    }

    if (/^#{1,4}\s/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      blocks.push({ type: "heading", level, text: line.replace(/^#+\s*/, "") });
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (/^\|.+\|$/.test(line.trim())) {
      const tableLines = [];
      while (i < lines.length && /^\|.+\|$/.test(lines[i].trim())) {
        if (!/^\|[\s\-:|]+\|$/.test(lines[i].trim())) {
          tableLines.push(lines[i]);
        }
        i++;
      }
      blocks.push({ type: "table", rows: tableLines });
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(line.replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "olist", items });
      continue;
    }

    if (line.trim() === "") {
      blocks.push({ type: "space" });
      i++;
      continue;
    }

    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !/^\|.+\|$/.test(lines[i].trim()) &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", text: para.join(" ") });
  }

  return blocks;
}

function tableToText(rows) {
  return rows.map((row) => {
    const cells = row
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    return cells.join("  |  ");
  });
}

function generatePdf(blocks) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  function ensureSpace(mm = 6) {
    if (y + mm > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function writeLines(text, fontSize, bold = false, indent = 0) {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const wrapped = doc.splitTextToSize(sanitizePdfText(text), maxWidth - indent);
    for (const line of wrapped) {
      ensureSpace(fontSize * 0.45);
      doc.text(line, margin + indent, y);
      y += fontSize * 0.45;
    }
  }

  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        const sizes = { 1: 16, 2: 13, 3: 11, 4: 10 };
        const size = sizes[block.level] ?? 10;
        y += block.level === 1 ? 2 : 4;
        writeLines(block.text.replace(/\[.*?\]\(.*?\)/g, ""), size, true);
        y += 2;
        break;
      }
      case "paragraph": {
        const text = block.text
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
        writeLines(text, 9);
        y += 1;
        break;
      }
      case "list":
      case "olist": {
        block.items.forEach((item, idx) => {
          const prefix = block.type === "olist" ? `${idx + 1}. ` : "- ";
          const text = item
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/`([^`]+)`/g, "$1");
          writeLines(prefix + text, 9, false, 2);
        });
        y += 1;
        break;
      }
      case "table": {
        y += 2;
        for (const row of tableToText(block.rows)) {
          writeLines(row, 8);
        }
        y += 2;
        break;
      }
      case "code": {
        y += 2;
        doc.setFillColor(245, 245, 245);
        const codeLines = block.text.split("\n");
        const boxHeight = codeLines.length * 4.5 + 4;
        ensureSpace(boxHeight);
        doc.rect(margin, y - 3, maxWidth, boxHeight, "F");
        for (const codeLine of codeLines) {
          writeLines(codeLine, 7.5, false, 2);
        }
        y += 3;
        break;
      }
      case "hr": {
        y += 3;
        ensureSpace(4);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
        break;
      }
      case "space":
        y += 2;
        break;
      default:
        break;
    }
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(
      sanitizePdfText(`GEO ARTE CDMX - Control de Capas del Mapa  |  Pagina ${p} de ${totalPages}`),
      margin,
      pageHeight - 8,
    );
    doc.setTextColor(0, 0, 0);
  }

  return doc.output("arraybuffer");
}

const md = readFileSync(mdPath, "utf8");
const blocks = parseMarkdown(md);
const pdfBytes = generatePdf(blocks);
writeFileSync(pdfPath, Buffer.from(pdfBytes));

console.log(`PDF generado: ${pdfPath}`);
