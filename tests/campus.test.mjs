import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projects,tracks,projectMap,getCCases,jsChecks} from "../campus/catalog.mjs";
import {sandboxDocument,webDocument} from "../campus/runner.mjs";
import {normalizeState,defaultWorkspace,addFile,cleanFiles,completeProject} from "../campus/state.mjs";
test("Campus contains real C, JS and HTML/CSS projects with structured explanations",()=>{
 assert.ok(projects.length>=12);
 assert.equal(new Set(projects.map(p=>p.id)).size,projects.length);
 assert.equal(new Set(projects.map(p=>p.track)).size,3);
 assert.ok(tracks.some(t=>t.id==="python"&&t.status==="planned"));
 for(const p of projects){
  assert.ok(p.title.length>=6&&p.description.length>=12,p.id);
  assert.ok(p.files[p.entry],p.id);
  assert.ok(p.guide.mission&&p.guide.concept.length>=40,p.id);
  assert.ok(p.guide.steps.length>=3&&p.guide.hint,p.id);
  if(p.track==="js")assert.ok(jsChecks(p).length>=3,p.id);
  if(p.track==="c")assert.ok(getCCases(p,p.files[p.entry]).length>0,p.id);
 }
});
test("State is local-first, supports several project files and rejects prototype names",()=>{
 const project=projects.find(p=>p.track==="web");
 const w=defaultWorkspace(project);
 assert.equal(Object.keys(w.files).length,2);
 addFile(w,"notes.txt","exemple");
 assert.equal(w.activeFile,"notes.txt");
 assert.throws(()=>addFile(w,"__proto__","hack"));
 assert.throws(()=>addFile(w,"evil / file","hack"));
 const safe=cleanFiles({"valid.js":"hello","__proto__":"no"});
 assert.equal(safe["valid.js"],"hello");
 assert.equal(Object.getPrototypeOf(safe),null);
});
test("Persisted state is normalized to known projects, no arbitrary filenames",()=>{
 const raw={active:"js-first",completed:["js-first","unknown","js-first"],workspaces:{
  "js-first":{files:{"main.js":"return 1;","../secrets":"NO"},activeFile:"main.js",title:"X"},
  "unknown":{files:{"abc.txt":"invalid"}}
 }};
 const s=normalizeState(raw,projectMap);
 assert.deepEqual(s.completed,["js-first"]);
 assert.ok(s.workspaces["js-first"]);
 assert.equal(s.workspaces["unknown"],undefined);
 assert.equal(s.workspaces["js-first"].files["../secrets"],undefined);
 completeProject(s,"js-first");
 assert.equal(s.completed.length,1);
});
test("Campus code execution is real, sandboxed, and fails closed",()=>{
 const page=readFileSync("campus/index.html","utf8");
 const runner=readFileSync("campus/runner.mjs","utf8");
 const app=readFileSync("campus/app.mjs","utf8");
 assert.match(page,/id="code-editor"/);
 assert.match(page,/id="file-explorer"/);
 assert.match(page,/id="result-console"/);
 assert.match(page,/id="preview-frame"/);
 assert.match(page,/id="runner-frame"/);
 assert.match(page,/id="btn-test"/);
 assert.match(page,/id="btn-run"/);
 assert.match(page,/id="btn-export"/);
 assert.match(sandboxDocument(),/connect-src 'none'/);
 assert.match(webDocument({'index.html':'<h1>Test</h1>','style.css':'body {color:red}'}),/connect-src 'none'/);
 assert.match(runner,/sandbox/);
 assert.match(sandboxDocument(),/worker-src blob:/);
 assert.match(runner,/allow-scripts/);
 assert.match(app,/academy-v4\/compile-worker\.js/);
 assert.match(app,/new Worker/);
 assert.match(app,/\.terminate\(\)/);
});
