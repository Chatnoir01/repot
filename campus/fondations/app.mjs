import {lessons,modules,answerPrediction,traceFrame,makeCases} from "./curriculum.mjs";
import {instrumentCase,extractExecutionTrace,sameExecutionOutput} from "./live-trace.mjs";
import {explainCompilationFailure,explainTestFailure} from "./coaching.mjs";
const $=id=>document.getElementById(id);
const write=(id,value)=>{$(id).textContent=String(value);};
const element=(tag,className,text)=>{
 const node=document.createElement(tag);
 if(className)node.className=className;
 if(text!==undefined)node.textContent=String(text);
 return node;
};
const KEY="devlab-fondations-c-v1";
const validIds=new Set(lessons.map(l=>l.id));
function loadProgress(){
 const defaults={done:[],code:{}};
 try{
  const raw=JSON.parse(localStorage.getItem(KEY)||"null");
  if(!raw||typeof raw!=="object")return defaults;
  if(Array.isArray(raw.done))defaults.done=[...new Set(raw.done.filter(id=>validIds.has(id)))];
  if(raw.code&&typeof raw.code==="object"){
   for(const l of lessons)if(typeof raw.code[l.id]==="string")defaults.code[l.id]=raw.code[l.id].slice(0,12000);
  }
 }catch{}
 return defaults;
}
const state=loadProgress();
let index=0,traceIndex=0,selectedPrediction=null,activeWorker=null,timeout=null,runNumber=0,isRunning=false,hintClicks=0;
let actualTrace=[],actualTraceIndex=0,observingAbort=null,diagnosticLine=null;
const current=()=>lessons[index];
function save(){
 const ok=(()=>{try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{return false;}})();
 write("save-indicator",ok?"SAUVEGARDÉ LOCALEMENT":"SAUVEGARDE IMPOSSIBLE");
 return ok;
}
function storeCode(){
 state.code[current().id]=$("code-editor").value.slice(0,12000);
 save();
}
function code(){return $("code-editor").value;}
function setCode(value){
 $("code-editor").value=value;
 refreshLineNumbers();
}
function refreshLineNumbers(){
 const n=Math.max(14,code().split("\n").length);
 $("editor-line-numbers").textContent=Array.from({length:n},(_,i)=>i+1).join("\n");
 updateCursorPosition();
}
function updateCursorPosition(){
 const input=$("code-editor");if(!input)return;
 const before=input.value.slice(0,input.selectionStart||0);
 const lines=before.split("\n");
 write("editor-position","L"+lines.length+":C"+(lines.at(-1).length+1));
}
function gotoEditorLine(line){
 if(!Number.isInteger(line)||line<1)return;
 const input=$("code-editor"),lines=input.value.split("\n");
 if(line>lines.length)return;
 let position=0;
 for(let n=0;n<line-1;n++)position+=lines[n].length+1;
 input.focus();input.setSelectionRange(position,position+lines[line-1].length);
 updateCursorPosition();
 input.scrollIntoView({block:"center",behavior:"auto"});
}

function progress(){
 const n=state.done.filter(x=>validIds.has(x)).length;
 write("lesson-progress",n+" / "+lessons.length);
 $("lesson-progress-fill").style.width=(100*n/lessons.length)+"%";
 return n;
}
function drawNavigation(){
 const nav=$("lesson-nav");nav.replaceChildren();
 for(const module of modules){
  const wrap=element("div","nav-module");
  const heading=element("div","nav-module-heading");
  heading.append(element("span","",module.icon),element("span","",module.title));
  wrap.append(heading,element("p","nav-module-subtitle",module.subtitle));
  lessons.forEach((l,i)=>{
   if(l.module!==module.id)return;
   const button=element("button","nav-lesson");button.type="button";
   button.setAttribute("aria-current",String(index===i?"page":"false"));
   const n=element("span","nav-lesson-num",String(i+1).padStart(2,"0"));
   const title=element("span","nav-lesson-title",l.title);
   button.append(n,title);
   if(state.done.includes(l.id))button.append(element("span","nav-done","✓"));
   button.addEventListener("click",()=>selectLesson(i,true));
   wrap.append(button);
  });
  nav.append(wrap);
 }
}
function showTrace(){
 const lesson=current(),frame=traceFrame(lesson,traceIndex);
 if(!frame)return;
 const target=$("trace-state");target.replaceChildren();
 for(const [key,value] of Object.entries(frame.vars)){
  const card=element("div","trace-variable");
  card.append(element("span","trace-name",key),element("strong","trace-value",value));
  target.append(card);
 }
 write("trace-caption",frame.caption);
 write("trace-counter",(traceIndex+1)+" / "+lesson.trace.length);
 $("trace-previous").disabled=traceIndex===0;
 $("trace-next").disabled=traceIndex===lesson.trace.length-1;
 const dots=$("trace-dots");dots.replaceChildren();
 for(let i=0;i<lesson.trace.length;i++){
  const dot=element("span",i===traceIndex?"dot active":"dot");
  dots.append(dot);
 }
}
function resetMeasuredTrace(){
 actualTrace=[];actualTraceIndex=0;
 $("actual-trace").hidden=true;
 write("actual-trace-status","EN ATTENTE D'UNE MESURE");
 write("actual-trace-message","Clique sur « Observer mon code » pour mesurer les valeurs d'affectations entières compatibles.");
}
function showMeasuredTrace(){
 if(!actualTrace.length){resetMeasuredTrace();return;}
 actualTraceIndex=Math.max(0,Math.min(actualTraceIndex,actualTrace.length-1));
 const frame=actualTrace[actualTraceIndex];
 $("actual-trace").hidden=false;
 write("actual-trace-status","MESURÉ PAR LE VRAI PROGRAMME C");
 write("actual-trace-count",(actualTraceIndex+1)+" / "+actualTrace.length);
 const display=$("actual-trace-state");display.replaceChildren();
 const value=element("div","real-observed-line");
 value.append(element("span","",frame.name+"  /  entier (int)"),element("strong","",String(frame.value)));
 const origin=element("div","real-trace-instruction","Valeur observée après la ligne "+frame.line+" du code original.");
 display.append(value,origin);
 $("actual-trace-previous").disabled=actualTraceIndex===0;
 $("actual-trace-next").disabled=actualTraceIndex>=actualTrace.length-1;
 write("actual-trace-message","Trace vérifiée : la sortie normale est identique à celle du programme instrumenté, une fois les sondes retirées.");
}
function resetDiagnostic(){
 diagnosticLine=null;
 $("diagnostic-panel").hidden=true;
 $("diagnostic-jump").hidden=true;
 $("diagnostic-checks").replaceChildren();
 write("diagnostic-title","");
 write("diagnostic-detail","");
}
function showDiagnostic(diagnostic){
 if(!diagnostic)return;
 const box=$("diagnostic-panel");
 box.hidden=false;
 write("diagnostic-title",diagnostic.title||"Vérifie ton programme");
 write("diagnostic-detail",diagnostic.explanation||"Consulte le message exact du compilateur.");
 const list=$("diagnostic-checks");list.replaceChildren();
 for(const check of diagnostic.checks||[])list.append(element("li","",check));
 if(diagnostic.advice)list.append(element("li","", "Piste de la mission : "+diagnostic.advice));
 diagnosticLine=Number.isSafeInteger(diagnostic.line)?diagnostic.line:null;
 $("diagnostic-jump").hidden=diagnosticLine===null||diagnosticLine>code().split("\n").length;
 $("diagnostic-jump").textContent=diagnosticLine===null?"Voir le code":"Voir la ligne "+diagnosticLine+" dans l'éditeur →";
}
function showPrediction(){
 const lesson=current(),container=$("prediction-options");
 container.replaceChildren();
 write("prediction-prompt",lesson.prediction.question);
 lesson.prediction.options.forEach((option,i)=>{
  const button=element("button","prediction-choice");
  button.type="button";
  button.setAttribute("aria-pressed",String(i===selectedPrediction));
  button.append(element("span","choice-letter",String.fromCharCode(65+i)),element("span","",option));
  button.addEventListener("click",()=>{
   selectedPrediction=i;
   container.querySelectorAll("button").forEach((b,j)=>b.setAttribute("aria-pressed",String(j===i)));
   $("check-prediction").disabled=false;
   $("prediction-feedback").hidden=true;
  });
  container.append(button);
 });
 $("check-prediction").disabled=selectedPrediction===null;
 $("prediction-feedback").hidden=true;
}
function showSteps(){
 const node=$("lesson-steps");node.replaceChildren();
 current().steps.forEach((step,i)=>{
  const article=element("div","action-step");
  article.append(element("span","step-number",String(i+1)),element("div","step-text"));
  const content=article.querySelector(".step-text");
  content.append(element("strong","",step.title),element("p","",step.instruction));
  node.append(article);
 });
}
function renderLesson(){
 const lesson=current(),module=modules.find(m=>m.id===lesson.module);
 write("lesson-chapter",module.title.toUpperCase());
 write("lesson-number","MISSION "+String(index+1).padStart(2,"0"));
 write("lesson-chip","MISSION "+String(index+1).padStart(2,"0")+" / "+lessons.length);
 write("mission-level",index<4?"PREMIERS PAS":index<9?"VARIABLES":index<15?"LOGIQUE":"PROJET");
 write("lesson-title",lesson.title);
 write("lesson-goal",lesson.goal);
 write("lesson-duration",index<5?"8 MIN":index<13?"12 MIN":"16 MIN");
 write("lesson-tag",module.subtitle.toUpperCase());
 write("concept-text",lesson.concept);
 write("analogy-text",lesson.analogy);
 write("mission-text",lesson.mission);
 write("lesson-recap",lesson.recap);
 write("code-file",lesson.tests.some(t=>t.expression)?"fonction.c":"main.c");
 setCode(typeof state.code[lesson.id]==="string"?state.code[lesson.id]:lesson.starter);
 hintClicks=0;$("hint-content").hidden=true;
 traceIndex=0;selectedPrediction=null;showTrace();showPrediction();showSteps();
 resetMeasuredTrace();resetDiagnostic();
 write("runtime-status","PRÊT");
 write("result-console","Le code de la mission attend que tu l'exécutes…");
 write("test-counter","—");
 $("test-cases").replaceChildren(element("li","","Clique sur « Tester ma solution » pour vérifier les résultats."));
 $("test-explanation").hidden=true;$("test-explanation").textContent="";
 $("resume-button").disabled=index>=lessons.length-1;
 $("previous-lesson").disabled=index===0;
 progress();drawNavigation();save();
}
function selectLesson(number,scroll){
 if(number<0||number>=lessons.length)return;
 if(isRunning)cancelRun();
 storeCode();
 index=number;
 renderLesson();
 if(scroll)document.getElementById("lesson-main").scrollIntoView({block:"start",behavior:"auto"});
}
function cancelRun(){
 ++runNumber;
 if(timeout){clearTimeout(timeout);timeout=null;}
 if(activeWorker){activeWorker.terminate();activeWorker=null;}
 if(observingAbort){const abort=observingAbort;observingAbort=null;abort();}
 isRunning=false;
 $("compile-run").disabled=false;$("validate-code").disabled=false;$("observe-code").disabled=false;$("stop-code").disabled=true;
}
function showTestResults(rows,tests){
 const list=$("test-cases");list.replaceChildren();
 let passed=0;
 tests.forEach((tc,i)=>{
  const r=rows[i];
  const actual=String(r?.stdout||"").replace(/\r\n?/g,"\n").trim();
  const wanted=String(tc.expected).replace(/\r\n?/g,"\n").trim();
  const good=!!r?.ok&&r.exitCode===0&&actual===wanted;
  if(good)passed++;
  const item=element("li",good?"passed":"failed");
  item.append(element("strong","",(good?"✓ ":"✕ ")+tc.name));
  if(!good){
   item.append(element("small","","Attendu : "+JSON.stringify(wanted)+" | Obtenu : "+JSON.stringify(actual)));
  }
  list.append(item);
 });
 write("test-counter",passed+" / "+tests.length);
 return tests.length>0&&passed===tests.length&&rows.length===tests.length;
}
function explainFailure(stderr,isCompile){
 const text=String(stderr||"");
 if(isCompile){
  if(/expected|missing|semicolon|token|syntax/i.test(text))
   return "Le compilateur ne comprend pas la syntaxe. Vérifie les parenthèses, guillemets, accolades et points-virgules, puis relis la ligne signalée.";
  if(/undeclared|undefined|unknown identifier/i.test(text))
   return "Le programme utilise peut-être un nom non déclaré ou mal écrit. Vérifie les noms de variables et les fonctions disponibles.";
  return "Le compilateur a détecté une erreur dans le code C. Lis le détail exact dans le terminal ; aucune correction n'est supposée à ta place.";
 }
 return "Le programme s'exécute, mais au moins un résultat diffère de l'attendu. Compare les valeurs du test et relis la règle de la mission.";
}
function showCompletion(){
 const lesson=current();
 write("complete-title",index===lessons.length-1?"Parcours terminé !":"Mission réussie !");
 write("complete-description",index===lessons.length-1
  ?"Tu as validé la mission finale. Tu sais maintenant construire un programme avec variables, conditions, boucles et fonctions."
  :"Ton code a réellement passé les tests de « "+lesson.title+" ». Tu peux avancer vers une nouvelle notion.");
 $("continue-lesson").disabled=index>=lessons.length-1;
 const dialog=$("completion-dialog");
 if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();
}
function startRun(mode="run"){
 if(isRunning)return;
 const lesson=current(),source=code();
 if(!source.trim()){write("result-console","Écris d'abord ton programme C.");return;}
 if(source.length>12000){write("result-console","Limite de 12 000 caractères atteinte.");return;}
 storeCode();
 resetDiagnostic();
 write("test-counter","—");
 $("test-explanation").hidden=true;$("test-explanation").textContent="";
 const allCases=makeCases(lesson,source);
 const cases=mode==="test"?allCases:[allCases[0]];
 const id=++runNumber;
 let worker;
 try{worker=new Worker("../../academy-v4/compile-worker.js");}
 catch(error){write("result-console","Le compilateur est indisponible : "+error.message);return;}
 activeWorker=worker;isRunning=true;
 $("compile-run").disabled=true;$("validate-code").disabled=true;$("observe-code").disabled=true;$("stop-code").disabled=false;
 write("runtime-status",mode==="test"?"VÉRIFICATION…":"COMPILATION…");
 write("result-console","Le vrai compilateur C analyse et exécute ton programme…");
 if(mode==="test")$("test-cases").replaceChildren(element("li","","Les cas de test sont en cours…"));
 const limit=Math.min(32000,12000+cases.length*4100);
 timeout=setTimeout(()=>{
  if(id!==runNumber)return;
  cancelRun();
  write("runtime-status","TEMPS DÉPASSÉ");
  write("result-console","Le programme ou le compilateur a dépassé le temps autorisé. Vérifie les boucles et relance.");
  $("test-explanation").hidden=false;
  write("test-explanation","Ce programme a été arrêté pour protéger ton navigateur. Les boucles sans condition d'arrêt peuvent provoquer ce comportement.");
 },limit);
 worker.onmessage=event=>{
  const result=event.data||{};
  if(id!==runNumber||result.requestId!==id)return;
  if(result.kind==="progress"){write("runtime-status","TEST "+result.index+" / "+result.total);return;}
  if(result.kind==="error"){
   cancelRun();
   write("runtime-status","ERREUR TECHNIQUE");
   write("result-console",result.message||"Erreur du compilateur.");
   showDiagnostic(explainCompilationFailure(result.message||"Erreur inconnue du compilateur."));
   $("test-explanation").hidden=false;
   write("test-explanation","Le moteur d'exécution a échoué. Aucun résultat n'est simulé.");
   return;
  }
  if(result.kind!=="done")return;
  cancelRun();
  const rows=Array.isArray(result.results)?result.results:[];
  const error=rows.find(r=>!r.ok);
  const outputRow=error||rows[0];
  write("result-console",error?(error.stderr||"Une erreur a interrompu l'exécution."):(rows[0]?.stdout||"(aucune sortie)"));
  write("runtime-status",error?(error.phase==="compile"?"ERREUR DE COMPILATION":"ERREUR D'EXÉCUTION"):"EXÉCUTÉ");
  if(mode==="test"){
   const validated=showTestResults(rows,allCases);
   const message=validated?"Bravo ! Tous les cas demandés ont été vérifiés.":explainFailure(error?.stderr,!!error&&error.phase==="compile");
   if(!validated){
    if(error){showDiagnostic(explainCompilationFailure(error.stderr));}
    else {
     const failedIndex=allCases.findIndex((tc,i)=>{
      const row=rows[i];return !row?.ok||row.exitCode!==0||String(row.stdout||"").replace(/\r\n?/g,"\n").trim()!==String(tc.expected).replace(/\r\n?/g,"\n").trim();
     });
     if(failedIndex>=0){const tc=allCases[failedIndex],row=rows[failedIndex];
      showDiagnostic(explainTestFailure(lesson,{name:tc.name,expected:tc.expected,actual:row?.stdout||""}));
     }
    }
   }
   $("test-explanation").hidden=false;write("test-explanation",message);
   $("test-explanation").classList.toggle("success",validated);
   if(validated&&!state.done.includes(lesson.id)){
    state.done.push(lesson.id);save();progress();drawNavigation();showCompletion();
   }
  }else{
   $("test-cases").replaceChildren(element("li","","Exécution libre terminée. Tu peux maintenant vérifier ton code sur tous les cas."));
   write("test-counter","—");
   if(error){$("test-explanation").hidden=false;write("test-explanation",explainFailure(error.stderr,error.phase==="compile"));showDiagnostic(explainCompilationFailure(error.stderr));}
  }
 };
 worker.onerror=error=>{
  if(id!==runNumber)return;
  cancelRun();
  write("runtime-status","COMPILATEUR INDISPONIBLE");
  write("result-console","Impossible de lancer le compilateur C : "+(error.message||"ressources manquantes."));
 };
 worker.postMessage({requestId:id,cases});
}
function compileObservationOnce(oneCase,id,deadlineMs=12000){
 return new Promise(resolve=>{
  if(id!==runNumber){resolve({ok:false,error:"Exécution interrompue."});return;}
  let worker;
  try{worker=new Worker("../../academy-v4/compile-worker.js");}
  catch(error){resolve({ok:false,error:"Compilateur inaccessible : "+String(error?.message||error)});return;}
  activeWorker=worker;
  let finished=false;
  const abort=()=>finish({ok:false,error:"Exécution interrompue."});
  const finish=result=>{
   if(finished)return;finished=true;
   if(timeout!==null){clearTimeout(timeout);timeout=null;}
   if(activeWorker===worker)activeWorker=null;
   if(observingAbort===abort)observingAbort=null;
   worker.terminate();
   resolve(result);
  };
  observingAbort=abort;
  timeout=setTimeout(()=>finish({ok:false,error:"Limite de temps atteinte pour l'observation."}),deadlineMs);
  worker.onmessage=event=>{
   const data=event.data||{};
   if(data.requestId!==id)return;
   if(data.kind==="done")finish({ok:true,rows:data.results||[]});
   else if(data.kind==="error")finish({ok:false,error:String(data.message||"Erreur du compilateur.")});
  };
  worker.onerror=event=>finish({ok:false,error:String(event.message||"Le compilateur a échoué.")});
  try{worker.postMessage({requestId:id,cases:[oneCase]});}
  catch(error){finish({ok:false,error:String(error.message||error)});}
 });
}
async function runRealTrace(){
 if(isRunning)return;
 const source=code();
 if(!source.trim()||source.length>11200){
  write("actual-trace-message","Observation non disponible : le fichier est vide ou trop volumineux.");
  return;
 }
 storeCode();resetDiagnostic();resetMeasuredTrace();
 const base=makeCases(current(),source)[0];
 const random=crypto.getRandomValues(new Uint8Array(9));
 const token=Array.from(random,v=>v.toString(16).padStart(2,"0")).join("");
 const instrumented=instrumentCase(base.source,token);
 if(!instrumented){
  write("actual-trace-message","Ce programme n'a pas d'affectation entière simple observable dans main(). Ce mode ne sait pas encore suivre les fonctions complexes ou tous les types du C.");
  return;
 }
 const id=++runNumber;
 isRunning=true;
 $("compile-run").disabled=true;$("validate-code").disabled=true;$("observe-code").disabled=true;$("stop-code").disabled=false;
 try{
  write("runtime-status","OBSERVATION / 1 SUR 2");
  write("actual-trace-message","1/2 : exécution du code original avec le véritable compilateur C…");
  const normal=await compileObservationOnce(base,id,16000);
  if(id!==runNumber)return;
  const first=normal.rows?.[0];
  if(!normal.ok||!first?.ok||first.exitCode!==0){
   const reason=normal.error||first?.stderr||"Le code original ne peut pas être exécuté.";
   write("actual-trace-message","Aucune trace présentée : "+reason.slice(0,330));
   if(first?.phase==="compile")showDiagnostic(explainCompilationFailure(reason));
   return;
  }
  write("runtime-status","OBSERVATION / 2 SUR 2");
  write("actual-trace-message","2/2 : seconde compilation instrumentée, puis vérification des sorties…");
  const monitored=await compileObservationOnce({name:"Observation mesurée",source:instrumented.source,stdin:base.stdin,expected:base.expected},id,16000);
  if(id!==runNumber)return;
  const second=monitored.rows?.[0];
  if(!monitored.ok||!second?.ok||second.exitCode!==0){
   write("actual-trace-message","Aucune valeur affichée : le programme instrumenté n'a pas pu être exécuté. Ce mode reste limité au C compatible.");
   return;
  }
  const extracted=extractExecutionTrace(second.stdout,token);
  const validPoint=new Set(instrumented.points.map(point=>point.line+":"+point.name));
  const verified=extracted.frames.length>0&&extracted.frames.length<=96
   &&extracted.frames.every(frame=>validPoint.has(frame.line+":"+frame.name))
   &&sameExecutionOutput(first.stdout,extracted.cleanOutput);
  if(!verified){
   write("actual-trace-message","Trace non confirmée : les sorties des deux exécutions ne concordent pas, ou aucune variable n'a été mesurée. Aucune valeur n'est affichée.");
   return;
  }
  actualTrace=extracted.frames;
  actualTraceIndex=0;
  showMeasuredTrace();
  write("runtime-status","OBSERVATION VÉRIFIÉE");
  write("result-console",first.stdout||"(aucune sortie)");
 }catch(error){
  if(id===runNumber)write("actual-trace-message","Impossible de mesurer les variables : "+String(error?.message||error).slice(0,260));
 }finally{
  if(id===runNumber)cancelRun();
 }
}
function downloadCode(){
 storeCode();
 const file=new Blob([code()],{type:"text/x-c;charset=utf-8"});
 const url=URL.createObjectURL(file);
 const a=document.createElement("a");a.href=url;
 a.download=current().tests.some(t=>t.expression)?"fonction.c":"main.c";
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function closeCompletion(){const dialog=$("completion-dialog");if(dialog.open)dialog.close();}
$("trace-previous").addEventListener("click",()=>{traceIndex=Math.max(0,traceIndex-1);showTrace();});
$("trace-next").addEventListener("click",()=>{traceIndex=Math.min(current().trace.length-1,traceIndex+1);showTrace();});
$("check-prediction").addEventListener("click",()=>{
 const feedback=answerPrediction(current(),selectedPrediction);
 const node=$("prediction-feedback");node.hidden=false;
 node.classList.toggle("incorrect",!feedback.correct);
 node.textContent=(feedback.correct?"✓ Bien vu ! ":"Pas tout à fait. ")+feedback.explanation;
});
$("observe-code").addEventListener("click",runRealTrace);
$("actual-trace-previous").addEventListener("click",()=>{actualTraceIndex=Math.max(0,actualTraceIndex-1);showMeasuredTrace();});
$("actual-trace-next").addEventListener("click",()=>{actualTraceIndex=Math.min(actualTrace.length-1,actualTraceIndex+1);showMeasuredTrace();});
$("diagnostic-jump").addEventListener("click",()=>gotoEditorLine(diagnosticLine));
$("goto-line").addEventListener("click",()=>{
 const value=window.prompt("Numéro de la ligne à ouvrir :",String(code().slice(0,$("code-editor").selectionStart).split("\n").length));
 if(value===null)return;
 const line=Number(value);
 if(Number.isSafeInteger(line))gotoEditorLine(line);
});
$("compile-run").addEventListener("click",()=>startRun("run"));
$("validate-code").addEventListener("click",()=>startRun("test"));
$("stop-code").addEventListener("click",()=>{cancelRun();write("runtime-status","ARRÊTÉ");write("result-console","Tu as arrêté le programme. Tu peux corriger ton code et relancer.");});
$("reset-code").addEventListener("click",()=>{
 if(isRunning)return;
 if(!window.confirm("Repartir du code initial de cette mission ? Tes modifications actuelles seront remplacées."))return;
 setCode(current().starter);storeCode();
});
$("show-hint").addEventListener("click",()=>{
 hintClicks++;
 const message=hintClicks===1?current().tip:current().mistake;
 $("hint-content").hidden=false;
 write("hint-content",(hintClicks===1?"PISTE : ":"POINT À VÉRIFIER : ")+message);
});
$("download-code").addEventListener("click",downloadCode);
$("previous-lesson").addEventListener("click",()=>selectLesson(index-1,true));
$("resume-button").addEventListener("click",()=>selectLesson(index+1,true));
$("close-completion").addEventListener("click",closeCompletion);
$("stay-lesson").addEventListener("click",closeCompletion);
$("continue-lesson").addEventListener("click",()=>{closeCompletion();selectLesson(index+1,true);});
$("code-editor").addEventListener("input",()=>{refreshLineNumbers();storeCode();resetMeasuredTrace();});
$("code-editor").addEventListener("click",updateCursorPosition);
$("code-editor").addEventListener("keyup",updateCursorPosition);
$("code-editor").addEventListener("scroll",()=>{$("editor-line-numbers").scrollTop=$("code-editor").scrollTop;});
$("code-editor").addEventListener("keydown",event=>{
 const input=$("code-editor");
 if(!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.isComposing){
  const pairs={"(":")","[":"]","{":"}","\"":"\"","'":"'"};
  if(Object.hasOwn(pairs,event.key)&&input.selectionStart===input.selectionEnd){
   const start=input.selectionStart,next=input.value[start]||"";
   if(next===""||/\s/.test(next)){
    event.preventDefault();
    input.setRangeText(event.key+pairs[event.key],start,start,"end");
    input.setSelectionRange(start+1,start+1);
    input.dispatchEvent(new Event("input",{bubbles:true}));return;
   }
  }
  if([")","]","}","\"","'"].includes(event.key)&&input.value[input.selectionStart]===event.key&&input.selectionStart===input.selectionEnd){
   event.preventDefault();const next=input.selectionStart+1;input.setSelectionRange(next,next);updateCursorPosition();return;
  }
 }
 if(event.key==="Tab"){
  event.preventDefault();
  const input=$("code-editor"),start=input.selectionStart,end=input.selectionEnd;
  input.setRangeText("    ",start,end,"end");
  input.dispatchEvent(new Event("input",{bubbles:true}));
 }
});
document.addEventListener("keydown",event=>{
 if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();startRun(event.shiftKey?"test":"run");}
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="s"){event.preventDefault();storeCode();}
});
window.addEventListener("pagehide",()=>{if(isRunning)cancelRun();});
renderLesson();
