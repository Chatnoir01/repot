import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const root=resolve(import.meta.dirname,"..");
const read = path=>readFileSync(resolve(root,path),"utf8");
test("la navigation et l'accessibilité de base sont présentes",()=>{
  const home=read("index.html");
  assert.match(home,/href="#contenu"/);
  assert.match(home,/aria-controls="primary-navigation"/);
  assert.match(home,/data-theme-toggle/);
  assert.match(home,/lang="fr"/);
});
test("les scripts ne créent aucun suivi réseau ou formulaire factice",()=>{
  const script=read("assets/main.js");
  assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
  assert.match(script,/aria-expanded/);
  assert.match(script,/localStorage\.setItem/);
});
test("les recherches sont qualifiées d'expérimentales",()=>{
  const lab=read("laboratoire/index.html");
  assert.match(lab,/RECHERCHE PRIVÉE/);
  assert.match(lab,/pas encore un résultat validé/);
  const project=read("projets/stoparnaques/index.html");
  assert.match(project,/recherche expérimentale/);
});
test("aucun fichier GitHub privé n'est publié dans les pages",()=>{
  for(const path of ["index.html","projets/index.html","projets/stoparnaques/index.html","laboratoire/index.html"]){
    assert.doesNotMatch(read(path),/AntiFraudeAI|token personnel|PRIVATE KEY/);
  }
});
test("les styles adaptatifs et réduction du mouvement sont présents",()=>{
  const style=read("assets/styles.css");
  assert.match(style,/@media\(max-width:540px\)/);
  assert.match(style,/prefers-reduced-motion:reduce/);
});


test("la V2 présente un hero différencié et des onglets accessibles",()=>{
  const home=read("index.html");
  const script=read("assets/main.js");
  const css=read("assets/styles.css");
  assert.match(home,/class="hero-headline"/);
  assert.match(home,/data-stage-group/);
  assert.equal((home.match(/role="tab"/g)||[]).length,3);
  assert.equal((home.match(/role="tabpanel"/g)||[]).length,3);
  assert.match(script,/selectStage/);
  assert.match(script,/ArrowRight/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(home,/pas de données temps réel/);
});
