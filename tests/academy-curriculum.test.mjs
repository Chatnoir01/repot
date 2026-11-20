import test from "node:test";
import assert from "node:assert/strict";
import {lessons,casesFor,modules} from "../academy/curriculum.mjs";
test("a serious French C curriculum ships with progressive detailed lessons",()=>{
 assert.equal(lessons.length,10);assert.equal(modules.length,4);
 assert.equal(new Set(lessons.map(x=>x.id)).size,10);
 for(const l of lessons){
  assert.ok(modules.some(m=>m.id===l.module));
  for(const key of ["objective","theory","starter","solution","hint","pitfall","review"])assert.ok(l[key]?.length>15,l.id+" "+key);
  assert.ok(l.principles.length>=3);
 }
});
test("advanced challenges evaluate multiple distinct C function calls",()=>{
 const advanced=lessons.filter(l=>l.tests.some(t=>t.expression));
 assert.ok(advanced.length>=4);
 for(const lesson of advanced){
  const cases=casesFor(lesson,lesson.solution);
  assert.ok(cases.length>=3);
  assert.equal(new Set(cases.map(x=>x.source)).size,cases.length);
  assert.ok(cases.every(x=>x.source.includes("int main(void)")));
 }
});
