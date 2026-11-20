import {lessons,modules,casesFor} from "./curriculum.mjs";
import {diagnoseCompilerOutput,normalizeProgramOutput} from "./diagnostics.mjs";

const $=id=>document.getElementById(id);
const write=(id,value)=>{$(id).textContent=String(value);};
const make=(tag,cls,value)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(value!==undefined)node.textContent=String(value);
 return node;
};
const key="devlab-academy-v4-progress";
const validIds=new Set(lessons.map(l=>l.id));
function load(){
 try{
  const data=JSON.parse(localStorage.getItem(key)||"null");
  if(data&&Array.isArray(data.done)&&data.code&&typeof data.code==="object"){
   return {done:data.done.filter(x=>validIds.has(x)),code:data.code};
  }
 }catch{}
 return {done:[],code:{}};
}
const state=load();
let index=0,editor=null,worker=null,requestId=0,clock=null,locked=false,hintClicks=0,highlightedLine=null,activeMode=null;
const lesson=()=>lessons[index];
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
function source(){return editor?editor.getValue():$("c-editor").value;}
function setSource(code){if(editor)editor.setValue(code);else $("c-editor").value=code;}
function status(s){write("compiler-status",s);}
function feedback(message,error=false){
 const n=$("assistant-feedback");
 n.hidden=false;n.classList.toggle("error",error);n.textContent=message;
}
function clearFeedback(){
 const n=$("assistant-feedback");n.hidden=true;n.classList.remove("error");n.textContent="";
}
function record(){
 state.code[lesson().id]=source().slice(0,12000);
 save();write("saved-indicator","●");
}
function progress(){
 const count=state.done.filter(id=>validIds.has(id)).length;
 write("progress-number",count+" / "+lessons.length);
 $("progress-bar").style.width=(count/lessons.length*100)+"%";
}
function buildList(){
 const nav=$("syllabus");nav.replaceChildren();
 for(const m of modules){
  const section=make("div","module-group");
  section.append(make("div","module-title",m.name),make("p","module-desc",m.description));
  lessons.forEach((l,i)=>{
   if(l.module!==m.id)return;
   const b=make("button");b.type="button";
   b.setAttribute("aria-current",String(index===i?"page":"false"));
   b.append(make("span","num",String(i+1).padStart(2,"0")),make("span","",l.title));
   if(state.done.includes(l.id))b.append(make("span","done","✓"));
   b.addEventListener("click",()=>goTo(i));
   section.append(b);
  });
  nav.append(section);
 }
}
function clearCodeHighlight(){
 if(editor&&highlightedLine!==null){
  try{editor.removeLineClass(highlightedLine,"background","c-error-line");}catch{}
 }
 highlightedLine=null;
}
function markCodeLine(line){
 clearCodeHighlight();
 if(!Number.isInteger(line)||!editor||line<1||line>editor.lineCount())return;
 highlightedLine=line-1;
 editor.addLineClass(highlightedLine,"background","c-error-line");
 editor.scrollIntoView({line:highlightedLine,ch:0},90);
}
function diagnostic(message){
 const node=$("compiler-diagnostic");
 const d=diagnoseCompilerOutput(message);
 node.hidden=false;
 node.textContent=d.line?"Erreur du compilateur à la ligne "+d.line+" : "+d.message:d.message;
 markCodeLine(d.line);
}
function clearDiagnostic(){
 const d=$("compiler-diagnostic");d.hidden=true;d.textContent="";
 clearCodeHighlight();
}
function render(){
 const l=lesson();hintClicks=0;
 progress();buildList();
 write("crumb-lesson",String(index+1).padStart(2,"0"));
 write("lesson-module",modules.find(x=>x.id===l.module)?.name||l.module);
 write("lesson-duration",l.minutes+" MIN");
 write("lesson-title",l.title);write("lesson-theory",l.theory);
 write("lesson-goal",l.objective);
 write("difficulty",index<6?"DÉBUTANT":index<11?"INTERMÉDIAIRE":"PRATIQUE");
 write("pitfall",l.pitfall);write("review",l.review);
 const concepts=$("principles");concepts.replaceChildren();
 for(const p of l.principles)concepts.append(make("li","",p));
 setSource(typeof state.code[l.id]==="string"?state.code[l.id]:l.starter);
 write("file-title",l.tests.some(x=>x.expression)?"fonction.c":"main.c");
 write("terminal-output","Mode Exécuter : teste ton programme librement. Mode Valider : contrôle tous les exercices.");
 write("terminal-label","EN ATTENTE");write("test-counter","0 / "+l.tests.length);
 $("test-results").replaceChildren(make("li","","Les résultats seront affichés après la validation."));
 $("next-lesson").disabled=index>=lessons.length-1;
 $("hint-button").textContent="💡 Un indice (1/2)";
 clearFeedback();clearDiagnostic();
 if(editor)editor.refresh();
 status("PRÊT — VRAI COMPILATEUR C");
}
function stop(){
 if(clock!==null){clearTimeout(clock);clock=null;}
 if(worker){worker.terminate();worker=null;}
 locked=false;activeMode=null;
 $("run-code").disabled=false;$("validate-code").disabled=false;$("stop-code").disabled=true;
}
function goTo(position){
 if(position<0||position>=lessons.length)return;
 record();
 if(locked){++requestId;stop();}
 index=position;render();
}
function markDone(){
 const id=lesson().id;
 if(!state.done.includes(id)){state.done.push(id);save();}
 progress();buildList();
}
function reportTests(rows,expectedLesson){
 const list=$("test-results");list.replaceChildren();
 let passed=0;
 expectedLesson.tests.forEach((test,i)=>{
  const row=rows[i];
  const actual=normalizeProgramOutput(row?.stdout||"");
  const expected=normalizeProgramOutput(test.expected);
  const ok=!!row?.ok&&row.exitCode===0&&actual===expected;
  if(ok)passed++;
  const item=make("li",ok?"pass":"fail");
  item.append(make("strong","",(ok?"✓ PASSÉ : ":"✕ ÉCHEC : ")+test.label));
  if(!ok)item.append(make("small","",row?.phase==="compile"?"Compilation impossible."
   : "Attendu : "+JSON.stringify(expected)+"\nObtenu : "+JSON.stringify(actual)
    +(typeof test.stdin==="string"&&test.stdin?"\nEntrée : "+JSON.stringify(test.stdin):"")));
  list.append(item);
 });
 write("test-counter",passed+" / "+expectedLesson.tests.length);
 return passed===expectedLesson.tests.length;
}
function renderFreeResult(rows){
 const row=rows[0];
 const panel=$("test-results");panel.replaceChildren(make("li","",row?.ok?"Exécution libre terminée. Utilise « Valider » pour vérifier tous les tests.":"Exécution libre : erreur de compilation ou d'exécution."));
 write("test-counter","— / "+lesson().tests.length);
}
function start(runMode="run"){
 if(locked)return;
 const l=lesson(),code=source();
 if(!code.trim()){feedback("Écris du code C avant de lancer la compilation.",true);return;}
 if(code.length>12000){feedback("Limite : 12 000 caractères de code.",true);return;}
 const input=$("stdin-input").value;
 if(input.length>1024){feedback("Limite : 1 024 caractères sur l'entrée standard.",true);return;}
 const baseCases=casesFor(l,code);
 // Explore one real program execution; function-only challenges get a real main()
 // generated from the first test so the function can be invoked.
 const cases=runMode==="validate"?baseCases:[{...baseCases[0],stdin:input||baseCases[0].stdin}];
 record();clearFeedback();clearDiagnostic();
 const id=++requestId;
 const w=new Worker("compile-worker.js");worker=w;locked=true;activeMode=runMode;
 $("run-code").disabled=true;$("validate-code").disabled=true;$("stop-code").disabled=false;
 write("terminal-label",runMode==="validate"?"TESTS EN COURS":"EXÉCUTION");
 status("COMPILATION WEBASSEMBLY...");
 write("terminal-output",runMode==="validate"?"Compilation et validation des cas de test...":"Compilation et exécution de ton C...");
 if(runMode==="validate")$("test-results").replaceChildren(make("li","","Exécution des tests en cours…"));
 const deadline=Math.min(35000,12000+cases.length*4500);
 clock=setTimeout(()=>{
  if(id!==requestId)return;
  ++requestId;stop();status("DÉLAI D'EXÉCUTION DÉPASSÉ");
  write("terminal-label","TEMPS DÉPASSÉ");
  write("terminal-output","Limite de temps atteinte : vérifie les boucles infinies, la récursion et les calculs bloqués.");
  feedback("L'exécution a été interrompue automatiquement. Le navigateur est protégé par un processus isolé.",true);
 },deadline);
 w.onmessage=event=>{
  if(id!==requestId)return;
  const result=event.data;
  if(!result||result.requestId!==id)return;
  if(result.kind==="progress"){status("COMPILATION "+result.index+" / "+result.total);return;}
  if(result.kind==="error"){
   stop();write("terminal-label","ERREUR COMPILATEUR");status("IMPOSSIBLE D'EXÉCUTER");
   const message=result.message||"Erreur du compilateur.";
   write("terminal-output",message);diagnostic(message);
   feedback("Erreur pendant la compilation ou le lancement : consulte les diagnostics.",true);
   return;
  }
  if(result.kind!=="done")return;
  stop();
  const rows=result.results||[];
  const firstError=rows.find(row=>!row.ok);
  const first=rows[0];
  const consoleMessage=firstError?
   (firstError.stderr||"Erreur C inconnue."):
   ((first?.stdout||"")+(first?.stderr?"\n[stderr]\n"+first.stderr:""))||"(Aucune sortie)";
  write("terminal-output",consoleMessage);
  if(firstError)diagnostic(consoleMessage);
  const hasCompileError=firstError?.phase==="compile";
  write("terminal-label",hasCompileError?"ERREUR DE COMPILATION":firstError?"ERREUR D'EXÉCUTION":"COMPILATION RÉUSSIE");
  if(runMode==="run"){
   renderFreeResult(rows);
   status(firstError?"ERREUR — CONSULTE LE TERMINAL":"EXÉCUTION LIBRE TERMINÉE");
   feedback(firstError?"Ton code contient une erreur. Les détails sont affichés dans le terminal."
     :"Ton code a réellement été compilé et exécuté. Utilise « Valider les tests » pour vérifier l'exercice.",!!firstError);
   return;
  }
  const good=rows.length===cases.length&&reportTests(rows,l);
  if(good&&!firstError){
   status("TOUS LES TESTS RÉUSSIS");
   write("terminal-label","VALIDÉ");
   markDone();feedback("✓ Tous les tests de cette leçon sont verts. Tu peux avancer.");
  }else{
   status(firstError?"ERREUR — CORRIGE LE CODE":"TESTS NON VALIDÉS");
   feedback(firstError?"Une erreur empêche le programme de passer les tests. Consulte le terminal."
    :"Le programme compile, mais le résultat est incorrect pour au moins un test. Compare les sorties.",true);
  }
 };
 w.onerror=event=>{
  if(id!==requestId)return;
  stop();status("ERREUR D'ENVIRONNEMENT");write("terminal-label","ERREUR");
  const msg="Le compilateur n'a pas démarré : "+(event.message||"ressources WASM indisponibles.");
  write("terminal-output",msg);diagnostic(msg);
  feedback("Erreur technique réelle. Aucun résultat n'est simulé.",true);
 };
 try{w.postMessage({requestId:id,cases});}
 catch(error){++requestId;stop();feedback("Impossible de transmettre le programme au compilateur : "+error.message,true);}
}
function initEditor(){
 if(typeof window.CodeMirror==="function"){
  editor=window.CodeMirror.fromTextArea($("c-editor"),{mode:"text/x-csrc",lineNumbers:true,indentUnit:4,tabSize:4,indentWithTabs:false,smartIndent:true,lineWrapping:true,matchBrackets:true});
  editor.on("change",record);
 }else{
  $("c-editor").addEventListener("input",record);
 }
}
$("run-code").addEventListener("click",()=>start("run"));
$("validate-code").addEventListener("click",()=>start("validate"));
$("stop-code").addEventListener("click",()=>{
 ++requestId;stop();status("EXÉCUTION ARRÊTÉE");write("terminal-label","ARRÊTÉ");feedback("Exécution arrêtée. Tu peux modifier ton code et relancer.");
});
$("reset-code").addEventListener("click",()=>{
 if(locked)return;
 setSource(lesson().starter);record();clearDiagnostic();
 feedback("Code initial restauré. Ton exercice peut recommencer.");
});
$("copy-code").addEventListener("click",async()=>{
 try{await navigator.clipboard.writeText(source());feedback("Code C copié dans le presse-papiers.");}
 catch{feedback("Impossible de copier directement. Sélectionne le code dans l'éditeur.",true);}
});
$("download-code").addEventListener("click",()=>{
 record();
 const file=new Blob([source()],{type:"text/x-c;charset=utf-8"});
 const url=URL.createObjectURL(file);
 const anchor=document.createElement("a");
 anchor.href=url;anchor.download="devlab-"+lesson().id+".c";
 document.body.append(anchor);anchor.click();anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 feedback("Fichier .c créé. Tu peux l'ouvrir dans ton IDE local.");
});
$("hint-button").addEventListener("click",()=>{
 hintClicks++;
 const l=lesson();
 const message=hintClicks===1?("Piste : "+l.principles[0]):("Indice précis : "+l.hint);
 feedback("💡 "+message);
 $("hint-button").textContent=hintClicks<2?"💡 Un indice (2/2)":"💡 Relire les indices";
});
$("solution-button").addEventListener("click",()=>{
 if(locked)return;
 setSource(lesson().solution);record();
 feedback("Solution affichée pour étude. Elle n'est pas automatiquement validée : exécute puis explique son fonctionnement.");
});
$("next-lesson").addEventListener("click",()=>{goTo(index+1);window.scrollTo({top:0,behavior:"auto"});});
document.addEventListener("keydown",event=>{
 if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){
  event.preventDefault();start(event.shiftKey?"validate":"run");
 }
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="s"){
  event.preventDefault();record();feedback("Code enregistré localement.");
 }
});
window.addEventListener("pagehide",()=>{if(locked){++requestId;stop();}});
initEditor();render();
