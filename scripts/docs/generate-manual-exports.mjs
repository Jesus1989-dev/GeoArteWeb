/**
 * Genera exportaciones institucionales del Manual de usuario:
 *   - MANUAL-USUARIO.pdf  (con imágenes incrustadas)
 *   - MANUAL-USUARIO.html (autocontenido, imágenes en base64)
 *   - MANUAL-USUARIO.docx (vía HTML → Word)
 *
 * Uso: node scripts/docs/generate-manual-exports.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { mdToPdf } from "md-to-pdf";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const docsDir = join(root, "docs", "cliente");
const mdPath = join(docsDir, "MANUAL-USUARIO.md");
const cssPath = join(__dirname, "manual-export.css");

const outPdf = join(docsDir, "MANUAL-USUARIO.pdf");
const outHtml = join(docsDir, "MANUAL-USUARIO.html");
const outDocx = join(docsDir, "MANUAL-USUARIO.docx");
const outDocxGdocs = join(docsDir, "MANUAL-USUARIO-GOOGLE-DOCS.docx");

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function embedImagesAsBase64(md, baseDir) {
  return md.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, src) => {
      if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
        return match;
      }
      const imgPath = join(baseDir, src.replace(/^\//, ""));
      if (!existsSync(imgPath)) {
        console.warn(`  [aviso] Imagen no encontrada: ${src}`);
        return match;
      }
      const ext = extname(imgPath).toLowerCase();
      const mime = MIME[ext] ?? "image/png";
      const b64 = readFileSync(imgPath).toString("base64");
      return `![${alt}](data:${mime};base64,${b64})`;
    },
  );
}

function wrapHtmlDocument(bodyHtml, title) {
  const css = readFileSync(cssPath, "utf8");
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>${css}</style>
</head>
<body>
${bodyHtml}
<footer style="margin-top:48px;padding-top:16px;border-top:1px solid #d0d7e2;font-size:9pt;color:#5a6478;text-align:center;">
  GEO ARTE CDMX · Gobierno de la Ciudad de México · Manual de usuario v2.0
</footer>
</body>
</html>`;
}

async function generatePdf(mdContent) {
  console.log("Generando PDF con imágenes…");
  const pdf = await mdToPdf(
    { content: mdContent },
    {
      dest: outPdf,
      basedir: docsDir,
      css: cssPath,
      pdf_options: {
        format: "A4",
        margin: { top: "18mm", right: "16mm", bottom: "22mm", left: "16mm" },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: "<span></span>",
        footerTemplate: `
          <div style="width:100%;font-size:8px;color:#888;text-align:center;padding:0 16mm;">
            GEO ARTE CDMX — Manual de usuario · Página <span class="pageNumber"></span> de <span class="totalPages"></span>
          </div>`,
      },
      launch_options: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
    },
  );
  if (!pdf?.filename) throw new Error("No se pudo generar el PDF");
  console.log(`  ✓ PDF: ${outPdf}`);
}

async function generateHtml(mdContent) {
  console.log("Generando HTML autocontenido…");
  const embedded = embedImagesAsBase64(mdContent, docsDir);
  const result = await mdToPdf(
    { content: embedded },
    {
      basedir: docsDir,
      css: cssPath,
      as_html: true,
      body_class: "manual-usuario",
    },
  );
  const bodyHtml = typeof result?.content === "string" ? result.content : String(result?.content ?? "");
  const fullHtml = wrapHtmlDocument(bodyHtml, "Manual de usuario — GEO ARTE CDMX");
  writeFileSync(outHtml, fullHtml, "utf8");
  console.log(`  ✓ HTML: ${outHtml}`);
  return fullHtml;
}

async function generateDocx(htmlContent) {
  console.log("Generando DOCX (Word)…");
  try {
    const HTMLtoDOCX = (await import("html-to-docx")).default;
    const docxBuffer = await HTMLtoDOCX(htmlContent, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
      font: "Calibri",
      fontSize: 22,
      title: "Manual de usuario — GEO ARTE CDMX",
      lang: "es-MX",
    });
    writeFileSync(outDocx, docxBuffer);
    writeFileSync(outDocxGdocs, docxBuffer);
    console.log(`  ✓ DOCX: ${outDocx}`);
    console.log(`  ✓ Google Docs: ${outDocxGdocs}`);
  } catch (err) {
    console.warn("  [aviso] DOCX no generado:", err.message);
    console.warn("  Instale html-to-docx o abra MANUAL-USUARIO.html en Word y guarde como .docx");
  }
}

async function main() {
  if (!existsSync(mdPath)) {
    console.error(`No se encontró: ${mdPath}`);
    process.exit(1);
  }

  const mdContent = readFileSync(mdPath, "utf8");
  console.log(`Fuente: ${mdPath}\n`);

  await generatePdf(mdContent);
  const html = await generateHtml(mdContent);
  await generateDocx(html);

  console.log("\nExportación completada.");
}

main().catch((err) => {
  console.error("Error en exportación:", err);
  process.exit(1);
});
