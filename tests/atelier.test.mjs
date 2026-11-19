import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {execute,AtelierError,normalizeOutput} from "../atelier/engine.mjs";
import {algorithmLessons,cLessons,webLessons} from "../atelier/lessons.mjs";

test("chaque défi algorithmique possède une solution correcte",()=>{
 assert.ok(algorithmLessons.length>=12);
 for(const l of algorithmLessons){
  assert.equal(normalizeOutput(execute(l.solution).output),normalizeOutput(l.expected),l.id);
 }
});
test("les variables et les expressions arithmétiques fonctionnent",()=>{
 const x=execute('a = 6\nb = 4\nafficher (a + b) * 2');
 assert.deepEqual(x.output,["20"]);assert.equal(x.variables.a,6);
});
test("si/sinon et comparaisons fonctionnent",()=>{
 assert.deepEqual(execute('age = 16\nsi age >= 18 alors\n  afficher "Majeur"\nsinon\n  afficher "Mineur"\nfin').output,["Mineur"]);
});
test("les boucles pour et tantque sont bornées",()=>{
 assert.deepEqual(execute('pour i de 1 a 3\n afficher i\nfin').output,["1","2","3"]);
 assert.deepEqual(execute('n = 2\ntantque n > 0 faire\n afficher n\n n = n - 1\nfin').output,["2","1"]);
 assert.throws(()=>execute('n = 1\ntantque n > 0 faire\n afficher n\nfin'),AtelierError);
});
test("une syntaxe invalide ne peut pas exécuter du JavaScript",()=>{
 for(const source of ['eval("1+1")','afficher process.env','afficher fetch("https://example.com")','__proto__ = 2']){
  assert.throws(()=>execute(source),AtelierError);
 }
});
test("les programmes trop longs et les calculs dangereux sont refusés",()=>{
 assert.throws(()=>execute("afficher 1\n".repeat(300)),AtelierError);
 assert.throws(()=>execute("afficher 8 / 0"),/Division par zéro/);
 assert.throws(()=>execute("pour i de 1 a 800\n afficher i\nfin"),/Boucle trop grande/);
});
test("les contenus de cours sont complets, uniques et sans fausse compilation C",()=>{
 assert.ok(cLessons.length>=5);assert.ok(webLessons.length>=3);
 const ids=[...algorithmLessons,...cLessons,...webLessons].map(l=>l.id);
 assert.equal(new Set(ids).size,ids.length);
 for(const l of algorithmLessons)assert.ok(l.hint&&l.expected.length&&l.starter);
});
test("l'espace web annonce un aperçu sandboxé",()=>{
 const home=readFileSync(resolve("atelier/index.html"),"utf8");
 const app=readFileSync(resolve("atelier/app.js"),"utf8");
 assert.match(home,/id="web-preview"/);
 assert.match(home,/sandbox=""/);
 assert.match(app,/default-src 'none'/);
 assert.doesNotMatch(app,/\beval\s*\(|\bnew Function\s*\(/);
});
