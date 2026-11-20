import {lessons,modules,casesFor} from "./curriculum.mjs";
const $=id=>document.getElementById(id);
const write=(id,value)=>{$(id).textContent=String(value);};
const el=(tag,className,content)=>{
 const x=document.createElement(tag);
 if(className)x.className=className;
 if(content!==undefined)x.textContent=String(content);
 return x;
};
const key="devlab-academy-c-v3-progress";
function load(){
 try{
  const obj=JSON.parse(localStorage.getItem(key)||"null");
  if(obj&&Array.isArray(obj.done)&&typeof obj.code==="object"&&obj.code)return {done:obj.done.filter(x=>typeof x==="string"),code:obj.code};
 }catch{}
 return {done:[],code:{}};
}
const state=load();
let index=0,editor=null,worker=null,requestId=0,clock=null,locked=false,solved=false;
const lesson=()=>lessons[index];
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
function source(){return editor?editor.getValue():$("c-editor").value;}
function setSource(content){
 if(editor)editor.setValue(content);
 else $("c-editor").value=content;
}
function status(s){write("compiler-status",s);}
function feedback(msg,error=false){const n=$("assistant-feedback");n.hidden=false;n.classList.toggle("error",error);n.textContent=msg;}
function clearFeedback(){const n=$("assistant-feedback");n.hidden=true;n.textContent="";n.classList.remove("error");}
function record(){
 state.code[lesson().id]=source().slice(0,12000);save();
 write("saved-indicator","●");
}
function progress(){
 const passed=state.done.filter(id=>lessons.some(x=>x.id===id)).length;
 write("progress-number",passed+" / "+lessons.length);
 $("progress-bar").style.width=(passed*100/lessons.length)+"%";
}
function buildList(){
 const host=$("syllabus");host.replaceChildren();
 for(const m of modules){
  const wrapper=el("div","module-group");
  wrapper.append(el("div","module-title",m.name),el("p","module-desc",m.description));
  lessons.forEach((l,i)=>{
   if(l.module!==m.id)return;
   const b=el("button");
   b.type="button";b.setAttribute("aria-current",String(index===i?"page":"false"));
   b.append(el("span","num",String(i+1).padStart(2,"0")),el("span","",l.title));
   if(state.done.includes(l.id))b.append(el("span","done","✓"));
   b.addEventListener("click",()=>{record();index=i;render();});
   wrapper.append(b);
  });
  host.append(wrapper);
 }
}
function render(){
 const l=lesson();
 solved=state.done.includes(l.id);
 progress();buildList();
 write("crumb-lesson",String(index+1).padStart(2,"0"));
 write("lesson-module",modules.find(x=>x.id===l.module)?.name||l.module);
 write("lesson-duration",l.minutes+" MIN");
 write("lesson-title",l.title);write("lesson-theory",l.theory);
 write("lesson-goal",l.objective);write("difficulty",index>=6?"INTERMÉDIAIRE":"DÉBUTANT");
 write("pitfall",l.pitfall);write("review",l.review);
 const concepts=$("principles");concepts.replaceChildren();
 for(const p of l.principles)concepts.append(el("li","",p));
 setSource(typeof state.code[l.id]==="string"?state.code[l.id]:l.starter);
 write("file-title",l.tests[0]?.expression?"fonction.c":"main.c");
 write("terminal-output","Clique sur « Compiler & exécuter » pour voir les diagnostics et la sortie de ton programme C.");
 write("terminal-label","EN ATTENTE");write("test-counter","0 / "+l.tests.length);
 const results=$("test-results");results.replaceChildren(el("li","","Les tests apparaîtront après la compilation."));
 $("next-lesson").disabled=index===lessons.length-1;
 clearFeedback();if(editor)editor.refresh();status("PRÊT POUR LA COMPILATION");
}
function stop(){
 if(clock!==null){clearTimeout(clock);clock=null;}
 if(worker){worker.terminate();worker=null;}
 locked=false;$("run-code").disabled=false;$("stop-code").disabled=true;
}
function printResults(rows){
 const host=$("test-results");host.replaceChildren();
 let passed=0;
 rows.forEach((r,i)=>{
  const expected=lesson().tests[i].expected.trim();
  const out=(r.stdout||"").trim();
  const ok=r.ok&&r.exitCode===0&&out===expected;
  if(ok)passed++;
  const li=el("li",ok?"pass":"fail");
  li.append(el("strong","",(ok?"✓ RÉUSSI — ":"✕ ÉCHEC — ")+(r.name||"Test "+(i+1))));
  if(!ok)li.append(el("small","","Attendu : "+JSON.stringify(expected)+" | Obtenu : "+JSON.stringify(out)));
  host.append(li);
 });
 write("test-counter",passed+" / "+lesson().tests.length);
 return passed===lesson().tests.length;
}
function run(){
 if(locked)return;
 const code=source();
 if(!code.trim()){feedback("L'éditeur est vide. Écris ton programme C avant de le compiler.",true);return;}
 if(code.length>12000){feedback("Le code doit contenir moins de 12 000 caractères.",true);return;}
 const stdin=$("stdin-input").value;
 if(stdin.length>1024){feedback("L'entrée standard est limitée à 1024 caractères.",true);return;}
 const tests=casesFor(lesson(),code).map(t=>({...t,stdin:stdin||t.stdin}));
 record();clearFeedback();
 const id=++requestId;
 const w=new Worker("compile-worker.js");worker=w;locked=true;
 $("run-code").disabled=true;$("stop-code").disabled=false;
 write("terminal-label","COMPILATION");status("CHARGEMENT DU COMPILATEUR C...");
 write("terminal-output","Compilation C réelle en cours. Le premier chargement du compilateur peut prendre plusieurs secondes.");
 $("test-results").replaceChildren(el("li","","Préparation des tests…"));
 const deadline=Math.min(28000,10000+tests.length*4200);
 clock=setTimeout(()=>{
  if(requestId!==id)return;
  stop();write("terminal-label","TEMPS DÉPASSÉ");status("INTERRUPTION AUTOMATIQUE");
  write("terminal-output","L'exécution a dépassé la limite de temps. Vérifie tes boucles et réessaie.");
  feedback("Le compilateur ou ton programme a été arrêté pour protéger ton navigateur.",true);
 },deadline);
 w.onmessage=event=>{
  if(id!==requestId)return;
  const d=event.data;if(!d||d.requestId!==id)return;
  if(d.kind==="progress"){status("COMPILATION / TEST "+d.index+" SUR "+d.total);return;}
  if(d.kind==="error"){
   stop();write("terminal-label","ERREUR");status("COMPILATION IMPOSSIBLE");
   write("terminal-output",d.message||"Erreur technique");
   feedback("La compilation a échoué. Le message ci-dessus permet de comprendre ce qui bloque.",true);return;
  }
  if(d.kind==="done"){
   stop();
   const rows=d.results||[];
   const firstError=rows.find(r=>!r.ok);
   const good=rows.length===tests.length&&!firstError&&printResults(rows);
   // printResults even on compiler errors.
   if(firstError)printResults(rows);
   write("terminal-output",firstError?(firstError.stderr||"Erreur de compilation."):(rows[0]?.stdout||"(Aucune sortie)"));
   if(firstError)write("terminal-label",firstError.phase==="compile"?"ERREUR COMPILATION":"ERREUR EXÉCUTION");
   else write("terminal-label",good?"TESTS RÉUSSIS":"SORTIE INCORRECTE");
   status(firstError?"ERREUR — CONSULTE LE TERMINAL":good?"TOUS LES TESTS VERTS":"TESTS NON VALIDÉS");
   if(good){
    if(!state.done.includes(lesson().id)){state.done.push(lesson().id);save();}
    progress();buildList();feedback("✓ Bravo ! Tu as compilé ton propre C et réussi tous les tests. Tu peux poursuivre.");
   }else feedback(firstError?"Le compilateur indique une erreur. Lis son message et corrige le code.":"Ton code compile, mais ne satisfait pas encore tous les tests. Observe les valeurs attendues.",true);
  }
 };
 w.onerror=event=>{
  if(id!==requestId)return;
  stop();status("ERREUR DE CHARGEMENT");write("terminal-label","ERREUR");
  write("terminal-output","Le compilateur n'a pas pu démarrer : "+(event.message||"fichiers WebAssembly indisponibles."));
  feedback("Vérifie que les fichiers du compilateur sont réellement déployés. Ce site ne simule pas un résultat en cas d'échec.",true);
 };
 w.postMessage({requestId:id,cases:tests});
}
function initEditor(){
 if(typeof window.CodeMirror==="function"){
  editor=window.CodeMirror.fromTextArea($("c-editor"),{mode:"text/x-csrc",lineNumbers:true,indentUnit:4,tabSize:4,indentWithTabs:false,smartIndent:true,lineWrapping:true});
  editor.on("change",record);
 }else{
  $("c-editor").addEventListener("input",record);
 }
}
$("run-code").addEventListener("click",run);
$("stop-code").addEventListener("click",()=>{requestId++;stop();status("EXÉCUTION ARRÊTÉE");write("terminal-label","ARRÊTÉ");feedback("Exécution arrêtée par l'utilisateur.");});
$("reset-code").addEventListener("click",()=>{if(locked)return;setSource(lesson().starter);record();feedback("Code initial restauré. Tu peux recommencer.");});
$("copy-code").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(source());feedback("Code copié dans le presse-papiers.");}catch{feedback("La copie est indisponible sur ce navigateur.",true);}});
$("hint-button").addEventListener("click",()=>feedback("💡 "+lesson().hint));
$("solution-button").addEventListener("click",()=>{
 if(locked)return;
 setSource(lesson().solution);record();
 feedback("Solution affichée pour étude. Exécute-la pour voir le résultat réel ; essaie ensuite de l'expliquer.");
});
$("next-lesson").addEventListener("click",()=>{if(index<lessons.length-1){record();index++;render();window.scrollTo({top:0,behavior:"auto"});}});
document.addEventListener("keydown",event=>{
 if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();run();}
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="s"){event.preventDefault();record();feedback("Ton code est sauvegardé localement.");}
});
initEditor();render();
