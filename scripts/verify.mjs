import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pages = [
  "index.html", "projets/index.html", "projets/stoparnaques/index.html",
  "laboratoire/index.html", "technologies/index.html", "a-propos/index.html",
  "journal/index.html", "journal/recherche-locale/index.html",
  "contact/index.html", "confidentialite/index.html"
];
let failures = 0;
for (const path of pages) {
  const source = readFileSync(resolve(root, path), "utf8");
  const fail = message => { console.error("FAIL", path, message); failures++; };
  if (!/<html lang="fr"/.test(source)) fail("langue absente");
  if (!/<main id="contenu">/.test(source)) fail("pas de contenu principal");
  if (!/<title>[^<]{5,}<\/title>/.test(source)) fail("titre absent");
  if (!/<meta name="description" content="[^"]+"/.test(source)) fail("description absente");
  if (!/aria-label="Navigation principale"/.test(source)) fail("navigation sans label");
  if (/<form\b/i.test(source)) fail("formulaire non configuré");
  if (/AntiFraudeAI|BEGIN PRIVATE KEY|sk-proj-|FRAUD_DNA_PRODUCER_SECRET/.test(source)) fail("chaîne interne ou secrète");
  const links = [...source.matchAll(/\b(?:href|src)="([^"]+)"/g)].map(m=>m[1]);
  for (const link of links) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(link)) continue;
    const clean = link.split(/[?#]/)[0];
    if (!existsSync(resolve(root, dirname(path), clean))) fail("ressource manquante : " + link);
  }
}
if (failures) { console.error(failures + " erreur(s)"); process.exitCode = 1; }
else console.log("OK — " + pages.length + " pages : liens, structure, métadonnées et secrets connus vérifiés");
