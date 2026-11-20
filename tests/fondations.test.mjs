import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {lessons,modules,makeCases,answerPrediction,traceFrame} from "../campus/fondations/curriculum.mjs";
const read=path=>readFileSync(path,"utf8");

test("18 progressive lessons, rich concept, 3 coaching stages and practice",()=>{
 assert.equal(lessons.length,18);
 assert.equal(modules.length,4);
 assert.equal(new Set(lessons.map(x=>x.id)).size,18);
 for(const lesson of lessons){
  assert.ok(modules.some(m=>m.id===lesson.module));
  for(const key of ["title","goal","concept","analogy","mistake","tip","mission","starter","solution","recap"]){
   assert.ok(lesson[key]&&lesson[key].length>14,lesson.id+" "+key);
  }
  assert.equal(lesson.steps.length,3,lesson.id);
  assert.ok(lesson.trace.length>=2,lesson.id+" visual trace");
  assert.ok(lesson.prediction.question.length>20);
  assert.equal(lesson.prediction.options.length,3);
  assert.ok(lesson.prediction.explanation.length>35);
  assert.ok(lesson.tests.length>0&&lesson.tests.length<=5);
  assert.ok(makeCases(lesson,lesson.solution).every(x=>x.source&&typeof x.expected==="string"));
 }
});
test("predict then explain without inflating code-test progress",()=>{
 const lesson=lessons[0];
 assert.equal(answerPrediction(lesson,lesson.prediction.correct).correct,true);
 assert.equal(answerPrediction(lesson,(lesson.prediction.correct+1)%3).correct,false);
 assert.equal(answerPrediction(lesson,8).correct,false);
 assert.ok(traceFrame(lesson,0).caption.length>10);
 assert.equal(traceFrame(lesson,500),null);
});
test("later function lessons verify at least 3 distinct genuine C inputs",()=>{
 const advanced=lessons.filter(l=>l.tests.some(t=>t.expression));
 assert.ok(advanced.length>=3);
 for(const l of advanced){
  const sources=makeCases(l,l.solution);
  assert.ok(sources.length>=3);
  assert.equal(new Set(sources.map(s=>s.source)).size,sources.length);
 }
});
test("foundations page supports responsive live code, predictions, trace and milestone",()=>{
 const html=read("campus/fondations/index.html");
 const script=read("campus/fondations/app.mjs");
 for(const id of ["lesson-nav","lesson-title","trace-state","trace-next","trace-previous","trace-caption","prediction-options","prediction-feedback","code-editor","compile-run","validate-code","stop-code","result-console","test-cases","completion-dialog","resume-button","lesson-progress"]){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(script,/new Worker/);
 assert.match(script,/\.terminate\(\)/);
 assert.match(script,/makeCases/);
 assert.match(script,/answerPrediction/);
 assert.doesNotMatch(script,/innerHTML\s*=/);
});
test("foundation examples are real C, no eval or arbitrary dynamic code execution",()=>{
 const script=read("campus/fondations/app.mjs");
 assert.doesNotMatch(script,/eval\(|new Function\(/);
 assert.match(script,/academy-v4\/compile-worker\.js/);
 const home=read("campus/index.html");
 assert.match(home,/fondations\/index\.html/);
});
