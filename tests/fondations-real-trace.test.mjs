import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {lessons,makeCases} from "../campus/fondations/curriculum.mjs";
import {instrumentCase,extractExecutionTrace} from "../campus/fondations/live-trace.mjs";
import {explainCompilationFailure,explainTestFailure} from "../campus/fondations/coaching.mjs";
test("instrumenter uses actual C printf probes, no invented trace values",()=>{
 const source=makeCases(lessons.find(l=>l.id==="f08"),lessons.find(l=>l.id==="f08").solution)[0].source;
 const probe=instrumentCase(source,"a1b2c3d4e5f6");
 assert.ok(probe?.source?.includes("printf("));
 assert.ok(probe.source.includes("__DLTRACE_a1b2c3d4e5f6"));
 assert.ok(probe.points.length>=2);
 assert.ok(!probe.source.includes("eval("));
 const printed="__DLTRACE_a1b2c3d4e5f6_4_score:5__\n__DLTRACE_a1b2c3d4e5f6_5_score:8__\n8\n";
 const extracted=extractExecutionTrace(printed,"a1b2c3d4e5f6");
 assert.equal(extracted.cleanOutput.trim(),"8");
 assert.deepEqual(extracted.frames.map(f=>f.value),[5,8]);
 assert.equal(extracted.frames[0].name,"score");
});
test("trace fails closed for unsupported sources and forged unrelated markers",()=>{
 assert.equal(instrumentCase("int main(void) { return 0; }","a1b2c3d4e5f6"),null);
 assert.equal(instrumentCase("int main(void) {\n int x = 4;\n}","not valid token"),null);
 const extracted=extractExecutionTrace("__DLTRACE_badtoken_2_x:5__\nOK","a1b2c3d4e5f6");
 assert.equal(extracted.frames.length,0);
 assert.match(extracted.cleanOutput,/DLTRACE_badtoken/);
});
test("compilation diagnostics cite real evidence, and a line number only if present",()=>{
 const syntax=explainCompilationFailure("line 7: unexpected token ';'");
 assert.ok(syntax.title&&syntax.explanation.length>35);
 assert.equal(syntax.line,7);
 const missing=explainCompilationFailure("unknown identifier: toto");
 assert.match(missing.explanation,/déclar|nom|variable/i);
 assert.equal(missing.line,null);
});
test("logical feedback includes actual test observation and lesson-specific coaching",()=>{
 const l=lessons[0];
 const result=explainTestFailure(l,{name:"Premier message",expected:"Bonjour DEVLAB !",actual:"Bonjour !"});
 assert.match(result.explanation,/Bonjour DEVLAB/);
 assert.match(result.explanation,/Bonjour !/);
 assert.ok(result.advice.length>=20);
});
test("Fondations real trace, coach and editor command are interactive",()=>{
 const html=readFileSync("campus/fondations/index.html","utf8");
 const app=readFileSync("campus/fondations/app.mjs","utf8");
 for(const id of ["observe-code","actual-trace","actual-trace-state","actual-trace-next","actual-trace-previous","actual-trace-status","real-trace-disclaimer","diagnostic-title","diagnostic-detail","diagnostic-jump","editor-position"]){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 for(const name of ["instrumentCase","extractExecutionTrace","explainCompilationFailure","explainTestFailure"])assert.ok(app.includes(name),name);
 assert.match(app,/new Worker/);
 assert.match(app,/\.terminate\(\)/);
 assert.doesNotMatch(app,/innerHTML\s*=/);
});
