/**
 * Genera un paquete ZIP de entrega al cliente en dist/
 * Uso: node scripts/ops/build-entrega.mjs
 */
import { createWriteStream, existsSync, readFileSync, statSync } from "node:fs";
import { mkdir, readdir, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const version = pkg.version ?? "0.0.0";
const outDir = join(root, "dist");
const zipName = `geoarte-entrega-v${version}.zip`;
const zipPath = join(outDir, zipName);

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  ".kilo",
  "dist",
]);

const EXCLUDE_FILES = new Set([
  ".env",
  ".env.local",
  ".env.production",
  "tsconfig.tsbuildinfo",
]);

const INCLUDE_ROOTS = [
  "src",
  "public",
  "supabase",
  "scripts",
  "docs",
  ".github",
  ".env.example",
  ".gitignore",
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "tsconfig.json",
  "postcss.config.mjs",
  "eslint.config.mjs",
  "vercel.json",
  "README.md",
  "CHANGELOG.md",
  "AGENTS.md",
];

async function addPath(zip, absPath, zipPrefix = "") {
  const st = await stat(absPath);
  if (st.isDirectory()) {
    const base = absPath.split(/[/\\]/).pop();
    if (EXCLUDE_DIRS.has(base)) return;
    const entries = await readdir(absPath);
    for (const entry of entries) {
      await addPath(zip, join(absPath, entry), zipPrefix);
    }
    return;
  }

  const rel = relative(root, absPath).replace(/\\/g, "/");
  const name = zipPrefix || rel;
  if (EXCLUDE_FILES.has(name.split("/").pop())) return;

  zip.file(name, readFileSync(absPath));
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const zip = new JSZip();

  for (const item of INCLUDE_ROOTS) {
    const abs = join(root, item);
    if (!existsSync(abs)) continue;
    const st = statSync(abs);
    if (st.isDirectory()) {
      await addPath(zip, abs);
    } else {
      zip.file(item, readFileSync(abs));
    }
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  await new Promise((resolve, reject) => {
    const stream = createWriteStream(zipPath);
    stream.on("finish", resolve);
    stream.on("error", reject);
    stream.end(buffer);
  });

  const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`Entrega generada: ${zipPath} (${sizeMb} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
