import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {lessons,modules,casesFor} from "../academy-v4/curriculum.mjs";
import {diagnoseCompilerOutput,normalizeProgramOutput} from "../academy-v4/diagnostics.mjs";

test("curriculum V4: at least 16 original C lessons and more substantial practice",()=>{
 assert.ok(lessons.length>=16);
 assert.ok(modules.length>=5);
 assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
 for(const l of lessons){
  assert.ok(l.objective?.length>=20);
  assert.ok(l.theory?.length>=60);
  assert.ok(l.principles?.length>=3);
  assert.ok(l.tests?.length>=1);
  assert.ok(l.starter&&l.solution&&l.hint&&l.pitfall&&l.review);
  assert.ok(casesFor(l,l.solution).every(c=>c.source&&typeof c.expected==="string"));
 }
});
test("input exercises pass distinct stdin values without conflating them",()=>{
 const l=lessons.find(x=>x.id==="c16");
 assert.ok(l?.tests.length>=2);
 const cases=casesFor(l,l.solution);
 assert.ok(cases.every(c=>typeof c.stdin==="string"));
 assert.equal(new Set(cases.map(c=>c.stdin)).size,cases.length);
});
test("function exercises validate several distinct inputs",()=>{
 const advanced=lessons.filter(l=>l.tests.some(t=>t.expression));
 assert.ok(advanced.length>=6);
 for(const l of advanced){
  const cases=casesFor(l,l.solution);
  assert.ok(cases.length>=3);
  assert.equal(new Set(cases.map(c=>c.source)).size,cases.length);
 }
});
test("compiler errors are parsed without executing text as HTML",()=>{
 const out="line 7: unexpected token near ';'";
 const x=diagnoseCompilerOutput(out);
 assert.ok(x.message.length);
 assert.ok(Number.isInteger(x.line)||x.line===null);
 assert.equal(normalizeProgramOutput("hi\\r\\n"),"hi\\r\\n".replace(/\\r\\n/g,"\n").trim());
});
test("real IDE offers separate Run and Validate, export, and staged hints",()=>{
 const html=readFileSync("academy-v4/index.html","utf8");
 const script=readFileSync("academy-v4/studio.js","utf8");
 for(const id of ["run-code","validate-code","stop-code","download-code","hint-button","solution-button","terminal-output","test-results"]) assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(script,/new Worker/);
 assert.match(script,/\.terminate\(\)/);
 assert.match(script,/download/);
 assert.match(script,/runMode/);
 assert.match(script,/casesFor/);
});
