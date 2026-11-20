import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projects} from "../campus/catalog.mjs";
import {lessons, getGuidedLesson, checkUnderstanding, learningStats} from "../campus/learning.mjs";

test("every guided project has a substantive explainer, walkthrough, stages and recall quiz",()=>{
 assert.equal(Object.keys(lessons).length,projects.length);
 for(const project of projects){
  const guide=getGuidedLesson(project.id);
  assert.ok(guide,project.id);
  assert.ok(guide.story.length>=70,project.id+" story");
  assert.ok(guide.analogy.length>=45,project.id+" analogy");
  assert.ok(guide.walkthrough.length>=2,project.id+" walkthrough");
  for(const part of guide.walkthrough){
   assert.ok(part.code.length>=3&&part.explain.length>=30,project.id+" explanation");
  }
  assert.equal(guide.stages.length,3,project.id+" stages");
  for(const stage of guide.stages){
   assert.ok(stage.title&&stage.instruction?.length>=28,project.id+" stage");
  }
  assert.equal(guide.question.options.length,3,project.id+" options");
  assert.ok(Number.isInteger(guide.question.correct)&&guide.question.correct>=0&&guide.question.correct<=2,project.id);
  assert.ok(guide.question.explanation.length>=45,project.id+" answer");
  assert.ok(guide.challenge.length>=30,project.id+" challenge");
 }
});
test("understanding check rejects invalid options; explains both right and wrong answers",()=>{
 const p=projects[0],guide=getGuidedLesson(p.id);
 assert.equal(checkUnderstanding(p.id,guide.question.correct).correct,true);
 const wrong=(guide.question.correct+1)%3;
 const feedback=checkUnderstanding(p.id,wrong);
 assert.equal(feedback.correct,false);
 assert.ok(feedback.explanation.length>=45);
 assert.equal(checkUnderstanding(p.id,99).correct,false);
 assert.equal(checkUnderstanding("__missing__",0).correct,false);
});
test("learning statistics distinguish completed projects from learning interactions",()=>{
 const result=learningStats(projects.map(p=>p.id).slice(0,3),projects);
 assert.equal(result.completed,3);
 assert.equal(result.total,projects.length);
 assert.equal(result.percent,25);
 assert.equal(learningStats(["wrong","wrong"],projects).completed,0);
});
test("guided experience exposes lesson navigation, short explanation, check and celebration",()=>{
 const html=readFileSync("campus/index.html","utf8");
 const app=readFileSync("campus/app.mjs","utf8");
 for(const id of ["learn-tabs","learning-step-title","learning-explainer","walkthrough","lesson-question","lesson-answer","answer-feedback","next-project","btn-restart-lesson","milestone-dialog"]){
  assert.ok(html.includes('id="'+id+'"'),id+" missing");
 }
 assert.match(app,/getGuidedLesson/);
 assert.match(app,/checkUnderstanding/);
 assert.match(app,/renderLearning/);
 assert.match(app,/showMilestone/);
 assert.doesNotMatch(app,/innerHTML\s*=/,"untrusted code must stay text-only");
});
