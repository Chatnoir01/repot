import {projects,tracks,projectMap,getCCases,jsChecks} from "./catalog.mjs";
import {STORAGE_KEY,defaultWorkspace,readState,saveState,addFile,cleanFiles,projectDone,completeProject} from "./state.mjs";
import {runJavaScript,runCWorker,previewWeb,normalized} from "./runner.mjs";
import {getGuidedLesson,checkUnderstanding,learningStats} from "./learning.mjs";

const $=id=>document.getElementById(id);
const put=(id,value)=>{$(id).textContent=String(value)};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;};
const state=readState(localStorage,projectMap);
let libraryFilter="all", sidebarFilter="all",working=false,request=0,abortRun=null,hintLevel=0;
let learningStep=0,selectedAnswer=null,quizChecked=false;
const tracksById=Object.fromEntries(tracks.map(t=>[t.id,t]));
const genericGuide={
 mission:"Construit un programme personnel. Ici, tu explores librement, sans validation automatique.",
 concept:"Écris, exécute, observe puis corrige. Un projet personnel n'a pas de réponse prédéfinie ; la console montre le résultat réel.",
 steps:["Définis un petit objectif.","Écris un premier programme utilisable.","Teste le résultat puis apporte une amélioration."],
 hint:"Commence par une action simple puis ajoute une fonctionnalité à la fois.",
 review:"Tu as travaillé dans un vrai fichier de code.",
 pitfall:"Un programme qui s'exécute n'est pas nécessairement correct : vérifie toujours son comportement."
};
function allProjects(){return [...projects,...state.custom.map(c=>({
 ...c,level:"Libre",minutes:0,skills:[],entry:c.track==="c"?"main.c":c.track==="js"?"main.js":"index.html",
 guide:genericGuide,checks:[],files:{}
}))];}
function findProject(id){return projectMap[id]||allProjects().find(p=>p.id===id)||null;}
function currentProject(){return findProject(state.active)||projects[0];}
function workspace(){
 const project=currentProject();
 if(!state.workspaces[project.id]){
  state.workspaces[project.id]=project.files&&Object.keys(project.files).length?
   defaultWorkspace(project):
   {id:project.id,track:project.track,title:project.title,files:project.track==="c"?{"main.c":'#include <stdio.h>\nint main(void) {\n    printf("Bonjour !\\n");\n    return 0;\n}\n'}:project.track==="js"?{"main.js":'console.log("Bonjour du studio !");\n'}:{"index.html":"<h1>Mon projet</h1>\n","style.css":"h1 { color: #187b5c; }\n"},activeFile:project.entry,updated:0};
 }
 return state.workspaces[project.id];
}
if(!state.active||!findProject(state.active))state.active=projects[0].id;
function persist(){
 const ok=saveState(localStorage,state);
 put("save-status",ok?"SAUVEGARDÉ LOCALEMENT":"STOCKAGE INDISPONIBLE");
 return ok;
}
function showNotice(message,error=false){
 const box=$("workspace-notice");
 box.textContent=message;box.style.color=error?"#ffbaa0":"";
}
function saveEditor(){
 const w=workspace(),name=w.activeFile;
 if(name&&Object.hasOwn(w.files,name)){
  w.files[name]=$("code-editor").value.slice(0,24000);
  w.updated=Date.now();persist();
 }
}
function refreshLines(){
 const lines=$("code-editor").value.split("\n").length;
 $("line-numbers").textContent=Array.from({length:Math.max(16,lines)},(_,i)=>i+1).join("\n");
}
function updateEditor(){
 const w=workspace();
 const names=Object.keys(w.files);
 if(!names.includes(w.activeFile))w.activeFile=names[0];
 $("code-editor").value=w.files[w.activeFile]||"";
 put("active-file-name",w.activeFile||"aucun fichier");
 refreshLines();
 renderTabs();
 $("code-editor").setAttribute("aria-label","Code du fichier "+w.activeFile);
}
function renderTabs(){
 const w=workspace(),tabs=$("editor-tabs"),explorer=$("file-explorer");
 tabs.replaceChildren();explorer.replaceChildren();
 Object.keys(w.files).forEach(name=>{
  const tab=el("button","",name);tab.type="button";tab.setAttribute("aria-current",String(name===w.activeFile));
  tab.addEventListener("click",()=>openFile(name));
  tabs.append(tab);
  const file=el("button");file.type="button";file.setAttribute("aria-current",String(name===w.activeFile));
  file.append(el("span","file-icon",name.endsWith(".c")?"C":name.endsWith(".js")?"JS":name.endsWith(".css")?"#":"<>"),document.createTextNode(name));
  file.addEventListener("click",()=>openFile(name));
  explorer.append(file);
 });
}
function openFile(name){
 if(working)return;
 saveEditor();
 const w=workspace();if(!Object.hasOwn(w.files,name))return;
 w.activeFile=name;persist();updateEditor();showNotice("Fichier ouvert : "+name);
}
function renderNavigation(){
 const nav=$("project-navigation");nav.replaceChildren();
 for(const t of tracks.filter(t=>t.status==="ready")){
  if(sidebarFilter!=="all"&&sidebarFilter!==t.id)continue;
  const section=el("div","course-group");
  section.append(el("div","course-heading",t.name.toUpperCase()));
  const list=allProjects().filter(p=>p.track===t.id);
  list.forEach((p,i)=>{
   const b=el("button");b.type="button";b.setAttribute("aria-current",String(p.id===state.active));
   b.append(el("span","project-index",String(i+1).padStart(2,"0")),el("span","",p.title));
   if(projectDone(state,p.id))b.append(el("span","project-complete","✓"));
   b.addEventListener("click",()=>selectProject(p.id,true));
   section.append(b);
  });
  nav.append(section);
 }
}
function renderLibrary(){
 const grid=$("project-grid");grid.replaceChildren();
 projects.filter(p=>libraryFilter==="all"||p.track===libraryFilter).forEach((p,i)=>{
  const b=el("button","library-card");b.type="button";
  const label=el("span","",p.track.toUpperCase()+" / "+p.level.toUpperCase()+" / "+p.minutes+" MIN");
  b.append(label,el("h3","",p.title),el("p","",p.description));
  const footer=el("span","card-footer");
  footer.append(el("span","",p.skills.slice(0,2).join(" · ")),el("span","",projectDone(state,p.id)?"✓ TERMINÉ":"EXPLORER ↗"));
  b.append(footer);
  b.addEventListener("click",()=>selectProject(p.id,true));
  grid.append(b);
 });
 document.querySelectorAll("[data-library-filter]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.libraryFilter===libraryFilter)));
}
function progress(){
 const stats=learningStats(state.completed,projects);
 const count=stats.completed;
 const ratio=stats.percent;
 put("progress-percent",Math.round(ratio)+"%");
 put("progress-label",count+" / "+projects.length+" projets");
 $("progress-ring").style.setProperty("--percent",ratio+"%");
 $("progress-ring").setAttribute("aria-valuenow",String(count));
}
function renderGuide(){
 const p=currentProject();
 put("guide-concept",p.guide.concept);
 put("guide-pitfall",p.guide.pitfall);
 put("guide-review",p.guide.review);
 const steps=$("guide-steps");steps.replaceChildren();
 p.guide.steps.forEach(step=>steps.append(el("li","",step)));
 hintLevel=0;$("hint-output").hidden=true;$("hint-output").textContent="";
}
function renderLearning(){
 const project=currentProject(),guide=getGuidedLesson(project.id),section=$("guided-lesson");
 section.hidden=!guide;
 if(!guide)return; // Personal projects have no invented guided course.
 learningStep=Math.max(0,Math.min(learningStep,2));
 const step=guide.stages[learningStep];
 const first=learningStep===0,second=learningStep===1,last=learningStep===2;
 put("guided-lesson-title","Apprends en faisant, pas en devinant.");
 put("learning-step-counter","ÉTAPE "+(learningStep+1)+" / 3");
 put("learning-phase-tag",first?"DÉCODER":second?"PASSER À L'ACTION":"QUESTION ÉCLAIR");
 put("learning-skill",project.skills?.slice(0,2).join(" · ")||"Mission pratique");
 put("learning-step-title",first?"Voici comment ça marche.":step.title+". À toi de jouer !");
 put("learning-explainer",first?guide.story:step.instruction);
 $("learning-analogy").hidden=!first;
 put("learning-analogy-text",guide.analogy);
 const walk=$("walkthrough");walk.replaceChildren();walk.hidden=last;
 if(!last){
  const title=el("div","walkthrough-header",first?"LE CODE DÉCRYPTÉ, SANS JARGON":"REPÈRES UTILES DANS TON CODE");
  walk.append(title);
  guide.walkthrough.forEach((item,i)=>{
   const card=el("div","walkthrough-card");
   card.append(el("span","walkthrough-index",String(i+1).padStart(2,"0")));
   const content=el("div","walkthrough-content");
   const snippet=el("code","walkthrough-code",item.code);
   const explanation=el("p","walkthrough-explanation",item.explain);
   content.append(snippet,explanation);
   card.append(content);walk.append(card);
  });
 }
 const question=$("lesson-question");question.hidden=!last;
 $("learning-challenge").hidden=!last;
 if(last){
  put("question-prompt",guide.question.prompt);
  put("learning-challenge","POUR ALLER PLUS LOIN  ·  "+guide.challenge);
  const choices=$("question-choices");choices.replaceChildren();
  guide.question.options.forEach((label,i)=>{
   const button=el("button","question-choice");
   button.type="button";
   button.setAttribute("aria-pressed",String(selectedAnswer===i));
   button.append(el("span","answer-letter",String.fromCharCode(65+i)),el("span","",label));
   button.addEventListener("click",()=>{
    selectedAnswer=i;quizChecked=false;
    choices.querySelectorAll("button").forEach((b,j)=>b.setAttribute("aria-pressed",String(i===j)));
    $("answer-feedback").hidden=true;$("lesson-answer").disabled=false;
   });
   choices.append(button);
  });
  if(quizChecked&&selectedAnswer!==null){
   const evaluation=checkUnderstanding(project.id,selectedAnswer);
   const fb=$("answer-feedback");fb.hidden=false;
   fb.classList.toggle("wrong",!evaluation.correct);
   fb.textContent=(evaluation.correct?"✓ Bien compris ! ":"Pas encore — retiens ceci : ")+evaluation.explanation;
  }else{$("answer-feedback").hidden=true;}
  $("lesson-answer").disabled=selectedAnswer===null;
 }
 $("learn-tabs").querySelectorAll("[data-learn-step]").forEach(button=>{
  const active=Number(button.dataset.learnStep)===learningStep;
  button.setAttribute("aria-selected",String(active));button.tabIndex=active?0:-1;
 });
 put("btn-next-step",last?"Ouvrir l'éditeur ↓":second?"Passer à la vérification →":"Essayer dans le studio →");
}
function setLearningStep(value){
 if(!getGuidedLesson(currentProject().id))return;
 learningStep=Math.max(0,Math.min(2,value));
 renderLearning();
}
function showMilestone(manual=false){
 const project=currentProject();
 if(!Object.hasOwn(projectMap,project.id))return;
 const dialog=$("milestone-dialog");
 put("milestone-title",manual?"Atelier pratiqué !":"Mission validée !");
 put("milestone-description",manual
  ?"Tu as pratiqué le HTML et le CSS et marqué cet atelier comme réalisé. L'apparence n'est pas évaluée automatiquement."
  :"Ton programme a réellement réussi tous les tests de cette mission. Chaque erreur corrigée t'a fait progresser.");
 const trackProjects=projects.filter(p=>p.track===project.track);
 const nextInTrack=trackProjects.findIndex(p=>p.id===project.id)+1;
 const recommended=trackProjects[nextInTrack]||projects.find(p=>!state.completed.includes(p.id)&&p.id!==project.id);
 $("next-project").disabled=!recommended;
 $("next-project").dataset.projectId=recommended?.id||"";
 $("next-project").textContent=recommended?"Mission suivante : "+recommended.title+" →":"Tu as terminé toutes les missions !";
 if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();
}
function closeMilestone(){
 const dialog=$("milestone-dialog");if(dialog.open)dialog.close();
}
function renderProject(){
 const p=currentProject(),w=workspace(),t=tracksById[p.track];
 put("breadcrumb-track",t.name.toUpperCase());
 put("breadcrumb-project",p.title);
 put("engine-label",t.method.toUpperCase());
 put("mission-tag",p.id.startsWith("custom-")?"PROJET PERSONNEL":p.track.toUpperCase()+" / PROJET PRATIQUE");
 put("mission-time",(p.minutes?p.minutes+" MIN · ":"")+p.level.toUpperCase());
 put("mission-title",p.title);put("mission-description",p.description);
 put("mission-objective",p.guide.mission);
 $("stdin-row").hidden=p.track!=="c";
 $("preview-panel").hidden=p.track!=="web";
 $("btn-test").hidden=p.track==="web";
 $("btn-run").textContent=p.track==="web"?"↻ Aperçu":"▶ Exécuter";
 $("btn-stop").disabled=true;
 $("btn-run").disabled=false;$("btn-test").disabled=false;
 put("runtime-status","PRÊT");
 put("result-console",p.track==="web"?"Aperçu prêt. Modifie HTML ou CSS, puis actualise l'aperçu.":"Écris du code et clique sur « Exécuter » pour voir le résultat.");
 put("checks-count",p.track==="web"?"MANUEL":p.checks?.length? "0 / "+p.checks.length:"MODE LIBRE");
 $("check-results").replaceChildren(el("li","",p.track==="web"?"Vérifie visuellement la page, puis marque-la comme pratiquée.":"Les résultats des tests apparaîtront ici."));
 put("check-disclaimer",p.track==="web"?"Pas de validation automatique du HTML/CSS : le progrès reflète uniquement ta pratique.":"Les tests utilisent le moteur réel et les cas définis dans le cours.");
 put("editor-help",p.track==="web"?"L'aperçu utilise index.html et style.css. Aucun script n'est exécuté.":"Ctrl + Entrée : exécuter · Ctrl + Maj + Entrée : tester");
 updateEditor();
 renderNavigation();renderGuide();renderLearning();progress();
 if(p.track==="web")updateWebPreview();
 else $("preview-frame").srcdoc="";
 persist();
}
function selectProject(id,scroll=false){
 if(!findProject(id))return;
 if(working)stopExecution();
 saveEditor();state.active=id;
 learningStep=0;selectedAnswer=null;quizChecked=false;
 renderProject();
 if(scroll)document.getElementById("studio").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});
}
function updateWebPreview(){
 const p=currentProject();if(p.track!=="web")return;
 saveEditor();previewWeb($("preview-frame"),workspace().files);
 put("runtime-status","APERÇU ACTUALISÉ");
 showNotice("Aperçu isolé actualisé. Aucune ressource externe n'est chargée.");
}
function showTests(results){
 const list=$("check-results");list.replaceChildren();
 let count=0;
 for(const r of results){
  if(r.ok)count++;
  const li=el("li",r.ok?"pass":"fail");
  li.append(el("strong","",(r.ok?"✓ ":"✕ ")+r.label));
  if(!r.ok)li.append(el("small","",(r.expected!==undefined?"Attendu : "+r.expected+"\n":"")+(r.got!==undefined?"Obtenu : "+r.got:"")));
  list.append(li);
 }
 put("checks-count",count+" / "+results.length);
 return results.length>0&&count===results.length;
}
function stopExecution(){
 ++request;
 if(abortRun){abortRun.abort();abortRun=null;}
 $("runner-frame").srcdoc="";
 working=false;
 $("btn-stop").disabled=true;$("btn-run").disabled=false;$("btn-test").disabled=false;
 put("runtime-status","ARRÊTÉ");
}
function setWorking(value,mode){
 working=value;
 $("btn-run").disabled=value;$("btn-test").disabled=value;$("btn-stop").disabled=!value;
 if(value)put("runtime-status",mode==="test"?"TESTS EN COURS":"EXÉCUTION");
}
function markVerified(manual=false){
 const p=currentProject();
 if(!Object.hasOwn(projectMap,p.id))return;
 const wasDone=projectDone(state,p.id);
 completeProject(state,p.id);persist();progress();renderNavigation();renderLibrary();
 if(!wasDone)showMilestone(manual);
}
async function execute(mode="run"){
 if(working)return;
 saveEditor();
 const p=currentProject(),w=workspace();
 if(p.track==="web"){updateWebPreview();return;}
 if(!Object.hasOwn(w.files,p.entry)){
  showNotice("Le fichier d'entrée "+p.entry+" manque.",true);return;
 }
 const code=w.files[p.entry],id=++request;
 if(!code?.trim()){showNotice("Le fichier à exécuter est vide.",true);return;}
 if(code.length>12000){showNotice("Le fichier à exécuter dépasse 12 000 caractères.",true);return;}
 abortRun=new AbortController();
 setWorking(true,mode);
 $("check-results").replaceChildren(el("li","","Exécution des cas de test…"));
 put("result-console","Chargement du véritable environnement d'exécution…");
 try{
  let result,checks=[];
  if(p.track==="c"){
   const cases=getCCases(p,code);
   const selected=mode==="test"&&cases.length?cases:cases.length?[cases[0]]:[{name:"Exécution libre",source:code,stdin:"",expected:""}];
   const input=$("stdin-field").value.slice(0,1024);
   const runCases=selected.map(c=>({...c,stdin:mode==="run"&&input?input:c.stdin}));
   result=await runCWorker(runCases,30000,abortRun.signal);
   if(id!==request)return;
   if(!result.ok){
    put("result-console",result.error||"Le compilateur ne répond pas.");
    put("runtime-status","ÉCHEC RÉEL");showNotice("Erreur du compilateur WebAssembly : aucun résultat simulé.",true);return;
   }
   const firstError=result.results.find(r=>!r.ok);
   const first=firstError||result.results[0];
   const output=firstError?(firstError.stderr||"Erreur de compilation C."):((first?.stdout||"")+(first?.stderr?"\n[stderr]\n"+first.stderr:""));
   put("result-console",output||"(Aucune sortie)");
   if(mode==="test"&&cases.length){
    checks=cases.map((test,i)=>{
     const r=result.results[i];
     return {label:test.name,ok:!!r?.ok&&r.exitCode===0&&normalized(r.stdout)===normalized(test.expected),expected:normalized(test.expected),got:normalized(r?.stdout||"")};
    });
   }
   if(firstError){put("runtime-status","ERREUR C");showNotice("Le programme ne compile pas ou ne s'exécute pas. Consulte le terminal.",true);}
   else put("runtime-status","COMPILATION RÉUSSIE");
  }else{
   const testMode=mode==="test"&&!!p.checks?.length;
   const checksToRun=testMode?jsChecks(p):[];
   result=await runJavaScript($("runner-frame"),code,checksToRun,3500,abortRun.signal);
   if(id!==request)return;
   put("result-console",(result.output||"(Aucun console.log)")+(result.error?"\n[ERREUR]\n"+result.error:""));
   put("runtime-status",result.ok?"EXÉCUTION JS TERMINÉE":"ERREUR JS");
   if(testMode)checks=result.tests||[];
   if(!result.ok)showNotice("Le moteur JavaScript a signalé une erreur ou une interruption.",true);
  }
  if(mode==="test"){
   if(checks.length){
    const good=showTests(checks);
    if(good){markVerified();showNotice("✓ Tous les tests réels ont réussi. Projet validé.");}
    else showNotice("Certains tests échouent. Observe les résultats et corrige le code.",true);
   }else{
    $("check-results").replaceChildren(el("li","","Ce projet n'a pas de tests automatiques, ou l'exécution a échoué."));
    put("checks-count","0 / 0");
   }
  }else{
   $("check-results").replaceChildren(el("li","","Exécution libre terminée. Clique sur « Tester » pour valider le projet."));
   put("checks-count","—");
  }
 }catch(error){
  if(id===request){put("result-console",String(error?.message||error));put("runtime-status","ERREUR D'ENVIRONNEMENT");showNotice("L'environnement d'exécution a échoué : rien n'a été simulé.",true);}
 }finally{
  if(id===request){working=false;abortRun=null;$("btn-run").disabled=false;$("btn-test").disabled=false;$("btn-stop").disabled=true;}
 }
}
function download(name,text,mime){
 const blob=new Blob([text],{type:mime});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function makePersonal(){
 const p=currentProject(),type=p.track;
 const name=window.prompt("Nom du nouveau projet :", "Mon projet "+tracksById[type].name);
 if(name===null)return;
 const title=name.trim().slice(0,80);
 if(!title){showNotice("Le nom du projet est vide.",true);return;}
 if(state.custom.length>=12){showNotice("Maximum 12 projets personnels sur cet appareil.",true);return;}
 const id="custom-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
 state.custom.push({id,track:type,title,description:"Projet personnel"});
 persist();selectProject(id,true);
 showNotice("Projet personnel créé. Seul le fichier d'entrée est exécuté en C ou JavaScript ; HTML/CSS utilise ses deux fichiers.");
}
function importProject(file){
 if(!file||file.size>200000){showNotice("Le fichier est trop volumineux (max. 200 Ko).",true);return;}
 file.text().then(text=>{
  const data=JSON.parse(text);
  const imported=data?.workspace;
  if(!imported||!["c","js","web"].includes(imported.track))throw new Error("Format de projet invalide.");
  const files=cleanFiles(imported.files);
  if(Object.keys(files).length===0)throw new Error("Aucun fichier valide.");
  const title=String(imported.title||"Projet importé").slice(0,80);
  if(state.custom.length>=12)throw new Error("Nombre maximal de projets personnels atteint.");
  const id="custom-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
  const entry=imported.track==="c"?"main.c":imported.track==="js"?"main.js":"index.html";
  if(!Object.hasOwn(files,entry))throw new Error("Fichier d'entrée "+entry+" manquant.");
  state.custom.push({id,title,track:imported.track,description:"Projet personnel importé"});
  state.workspaces[id]={id,title,track:imported.track,files,activeFile:files[imported.activeFile]?imported.activeFile:entry,updated:Date.now()};
  persist();selectProject(id,true);showNotice("Projet importé localement : "+title);
 }).catch(error=>showNotice("Import impossible : "+error.message,true));
}
function initEditor(){
 $("code-editor").addEventListener("input",()=>{saveEditor();refreshLines();if(currentProject().track==="web")put("runtime-status","MODIFICATIONS EN ATTENTE");});
 $("code-editor").addEventListener("scroll",()=>{$("line-numbers").scrollTop=$("code-editor").scrollTop;});
 $("code-editor").addEventListener("keydown",event=>{
  if(event.key==="Tab"){
   event.preventDefault();
   const box=$("code-editor"),start=box.selectionStart,end=box.selectionEnd;
   box.setRangeText("  ",start,end,"end");
   box.dispatchEvent(new Event("input",{bubbles:true}));
  }
 });
}
$("learn-tabs").querySelectorAll("[data-learn-step]").forEach(button=>{
 button.addEventListener("click",()=>setLearningStep(Number(button.dataset.learnStep)));
 button.addEventListener("keydown",event=>{
  if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
  event.preventDefault();
  const next=event.key==="Home"?0:event.key==="End"?2:
   (learningStep+(event.key==="ArrowRight"?1:2))%3;
  setLearningStep(next);
  $("learn-tabs").querySelector('[data-learn-step="'+next+'"]')?.focus();
 });
});
$("btn-restart-lesson").addEventListener("click",()=>{
 selectedAnswer=null;quizChecked=false;setLearningStep(0);
 showNotice("Guide repris depuis le début. Tes modifications de code sont conservées.");
});
$("btn-next-step").addEventListener("click",()=>{
 if(learningStep<2)setLearningStep(learningStep+1);
 else $("code-editor").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"});
});
$("lesson-answer").addEventListener("click",()=>{
 const project=currentProject();
 if(selectedAnswer===null||!getGuidedLesson(project.id))return;
 const evaluation=checkUnderstanding(project.id,selectedAnswer);
 quizChecked=true;
 const feedbackBox=$("answer-feedback");
 feedbackBox.hidden=false;feedbackBox.classList.toggle("wrong",!evaluation.correct);
 feedbackBox.textContent=(evaluation.correct?"✓ Bien compris ! ":"Pas encore — retiens ceci : ")+evaluation.explanation;
});
$("close-milestone").addEventListener("click",closeMilestone);
$("back-to-code").addEventListener("click",closeMilestone);
$("next-project").addEventListener("click",()=>{
 const id=$("next-project").dataset.projectId;
 closeMilestone();
 if(findProject(id))selectProject(id,true);
});
document.querySelectorAll("[data-track-select]").forEach(b=>b.addEventListener("click",()=>{
 const p=projects.find(p=>p.track===b.dataset.trackSelect);
 if(p)selectProject(p.id,true);
}));
document.querySelectorAll("[data-library-filter]").forEach(b=>b.addEventListener("click",()=>{
 libraryFilter=b.dataset.libraryFilter;renderLibrary();
}));
$("track-filter").addEventListener("change",()=>{
 sidebarFilter=$("track-filter").value;renderNavigation();
});
$("btn-run").addEventListener("click",()=>execute("run"));
$("btn-test").addEventListener("click",()=>execute("test"));
$("btn-stop").addEventListener("click",()=>{stopExecution();showNotice("Exécution interrompue par l'utilisateur.");});
$("btn-practised").addEventListener("click",()=>{
 if(currentProject().track!=="web")return;
 markVerified(true);
 put("checks-count","PRATIQUÉ");
 $("check-results").replaceChildren(el("li","pass","✓ Projet marqué comme pratiqué, sans vérification automatique du rendu."));
 showNotice("Projet HTML/CSS marqué comme pratiqué (déclaration personnelle, pas une certification).");
});
$("btn-reset").addEventListener("click",()=>{
 if(working)return;
 const p=currentProject(),w=workspace();
 const initial=p.files?.[w.activeFile];
 if(typeof initial!=="string"){showNotice("Aucun modèle initial pour ce fichier.",true);return;}
 if(!window.confirm("Revenir au code de départ pour ce fichier ? Tes modifications seront remplacées."))return;
 w.files[w.activeFile]=initial;persist();updateEditor();showNotice("Code de départ restauré.");
});
$("btn-add-file").addEventListener("click",()=>{
 if(working)return;
 const name=window.prompt("Nom du nouveau fichier (ex. notes.txt) :","notes.txt");
 if(name===null)return;
 try{saveEditor();addFile(workspace(),name.trim(),"");persist();updateEditor();showNotice("Fichier ajouté. Seul le fichier principal est exécuté en C/JS ; les fichiers Web sont index.html et style.css.");}
 catch(error){showNotice(error.message,true);}
});
$("btn-new").addEventListener("click",makePersonal);
$("btn-import").addEventListener("click",()=>$("import-file").click());
$("import-file").addEventListener("change",()=>{
 const file=$("import-file").files?.[0];if(file)importProject(file);$("import-file").value="";
});
$("btn-export").addEventListener("click",()=>{
 saveEditor();
 const w=workspace();
 const payload={format:"devlab-campus",version:1,exportedAt:new Date().toISOString(),workspace:w};
 download("devlab-"+w.id+".json",JSON.stringify(payload,null,2),"application/json;charset=utf-8");
 showNotice("Projet exporté en JSON : il contient tes fichiers. Tu peux le réimporter ici.");
});
$("btn-download").addEventListener("click",()=>{
 saveEditor();const w=workspace();const name=w.activeFile;
 download(name,w.files[name]||"","text/plain;charset=utf-8");
 showNotice("Fichier "+name+" téléchargé.");
});
$("btn-hint").addEventListener("click",()=>{
 const guide=currentProject().guide;
 hintLevel=Math.min(hintLevel+1,2);
 $("hint-output").hidden=false;
 $("hint-output").textContent=hintLevel===1?"Piste : "+guide.steps[0]:"Indice précis : "+guide.hint;
});
document.addEventListener("keydown",event=>{
 if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){
  event.preventDefault();execute(event.shiftKey?"test":"run");
 }
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="s"){
  event.preventDefault();saveEditor();showNotice("Code sauvegardé dans ce navigateur.");
 }
});
window.addEventListener("pagehide",()=>{if(working)stopExecution();});
initEditor();renderProject();renderLibrary();
