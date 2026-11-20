import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=path=>readFileSync(path,"utf8");
test("Academy has a real C editor, terminal, stdin, run and stop controls",()=>{
 const html=file("academy/index.html");
 for(const id of ["c-editor","terminal-output","stdin-input","run-code","stop-code","test-results","syllabus","lesson-title"])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/C89\/C90/);
});
test("Academy isolates code execution in a worker with cancellation",()=>{
 const app=file("academy/studio.js"),worker=file("academy/compile-worker.js");
 assert.match(app,/new Worker/);
 assert.match(app,/\.terminate\(\)/);
 assert.match(worker,/CompilerAPI\.compileBinary/);
 assert.match(worker,/WebAssembly\.compile/);
 assert.match(worker,/createWasiHarness/);
 assert.doesNotMatch(app,/\beval\s*\(|\bFunction\(/);
});
