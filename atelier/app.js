import {execute,normalizeOutput} from "./engine.mjs";
import {algorithmLessons,cLessons,webLessons} from "./lessons.mjs";

const tracks={algo:algorithmLessons,c:cLessons,web:webLessons};
const lessons=[...algorithmLessons,...cLessons,...webLessons];
const ids=new Set(lessons.map(x=>x.id));
const key="devlab-atelier-progress-v1";
const $=id=>document.getElementById(id);
const set=(id,s)=>{$(id).textContent=String(s);};
const element=(tag,cls,s)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(s!==undefined)n.textContent=String(s);return n;};
function readProgress(){
 try{
  const p=JSON.parse(localStorage.getItem(key));
  if(p&&Array.isArray(p.done)){
   const obj=x=>x&&typeof x==="object"&&!Array.isArray(x)?x:{};
   return {done:p.done.filter(id=>ids.has(id)),code:obj(p.code),html:obj(p.html),css:obj(p.css)};
  }
 }catch{}
 return {done:[],code:{},html:{},css:{}};
}
let progress=readProgress(),track="algo",position=0,lang="js",showHint=false;
const lesson=()=>tracks[track][position];
function persist(){try{localStorage.setItem(key,JSON.stringify(progress));}catch{}}
function capture(){
 const l=lesson();
 if(track==="algo")progress.code[l.id]=$("algo-editor").value.slice(0,12000);
 if(track==="web"){progress.html[l.id]=$("html-editor").value.slice(0,25000);progress.css[l.id]=$("css-editor").value.slice(0,25000);}
 persist();
}
function progressUI(){
 const done=progress.done.filter(x=>ids.has(x)).length;
 const pct=Math.round(done*100/lessons.length);
 set("progress-percent",pct+"%");set("progress-count",done+" / "+lessons.length+" leçons");
 $("progress-circle").style.setProperty("--progress",pct+"%");
 $("progress-circle").setAttribute("aria-valuenow",done);
 $("progress-circle").setAttribute("aria-valuemax",lessons.length);
 set("track-progress",tracks[track].filter(l=>progress.done.includes(l.id)).length+" / "+tracks[track].length);
}
function markDone(){
 if(!progress.done.includes(lesson().id)){progress.done.push(lesson().id);persist();}
 progressUI();renderList();renderHeader();
}
function renderList(){
 const list=$("lesson-list");list.replaceChildren();
 tracks[track].forEach((l,i)=>{
  const li=element("li"),b=element("button");
  b.type="button";b.setAttribute("aria-current",String(position===i));
  b.append(element("span","lesson-num",String(i+1).padStart(2,"0")),element("span","",l.title));
  if(progress.done.includes(l.id))b.append(element("span","lesson-done","✓"));
  b.addEventListener("click",()=>{capture();position=i;render();});
  li.append(b);list.append(li);
 });
}
function renderHeader(){
 const l=lesson(),host=$("lesson-content");host.replaceChildren();
 const meta=element("div","lesson-meta");
 meta.append(element("span","","LEÇON "+(position+1)+" / "+tracks[track].length),element("span","",progress.done.includes(l.id)?"✓ TERMINÉ":(l.time||5)+" MIN ENV."));
 const concept=element("div","concept");
 concept.append(element("strong","",l.concept||"EN PRATIQUE"),element("p","",l.explanation||l.goal||""));
 const obj=element("div","objective");
 obj.append(element("strong","","TON OBJECTIF"),element("p","",track==="algo"?l.challenge:track==="c"?l.question:l.goal));
 host.append(meta,element("h3","lesson-title",l.title),element("p","lesson-description",l.explanation||l.goal||""),concept,obj);
 set("lesson-position","LEÇON "+(position+1)+" SUR "+tracks[track].length);
 $("next-lesson").disabled=position===tracks[track].length-1;
}
function feedback(id,message,good){
 const n=$(id);n.textContent=message;n.hidden=false;n.classList.toggle("bad",!good);
}
function clearFeedback(id){const n=$(id);n.textContent="";n.hidden=true;n.classList.remove("bad");}
function output(msg,status){set("console-output",msg);set("console-status",status);}
function comparison(){
 set("code-comparison",lang==="c"?lesson().c:lesson().js);
 document.querySelectorAll("[data-snippet]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.snippet===lang)));
}
function preview(){
 // This iframe has sandbox="" and an internal CSP: no script or external network.
 const html=$("html-editor").value.slice(0,25000);
 const css=$("css-editor").value.slice(0,25000).replace(/<\/style/gi,"<\\/style");
 const csp='<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src data:; font-src data:; form-action &#39;none&#39;; base-uri &#39;none&#39;">';
 $("web-preview").srcdoc='<!doctype html><html lang="fr"><head><meta charset="utf-8">'+csp+'<meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body>'+html+'</body></html>';
}
function render(){
 document.querySelectorAll("[data-track]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.track===track)));
 $("algorithm-workspace").hidden=track!=="algo";
 $("c-workspace").hidden=track!=="c";
 $("web-workspace").hidden=track!=="web";
 set("exercise-label",track==="algo"?"ALGORITHMIQUE":track==="c"?"LANGAGE C":"HTML & CSS");
 progressUI();renderList();renderHeader();
 const l=lesson();
 if(track==="algo"){
  $("algo-editor").value=typeof progress.code[l.id]==="string"?progress.code[l.id]:l.starter;
  showHint=false;$("algo-hint").hidden=true;clearFeedback("algo-feedback");output("Exécute ton programme pour voir la sortie.","EN ATTENTE");comparison();
 }else if(track==="c"){
  set("c-sample",l.snippet);set("c-question",l.question);
  const options=$("c-choices");options.replaceChildren();
  l.choices.forEach((answer,i)=>{
   const label=element("label","choice"),input=element("input");
   input.type="radio";input.name="answer-c";input.value=String(i);
   label.append(input,document.createTextNode(answer));options.append(label);
  });
  clearFeedback("c-feedback");
 }else{
  $("html-editor").value=typeof progress.html[l.id]==="string"?progress.html[l.id]:l.html;
  $("css-editor").value=typeof progress.css[l.id]==="string"?progress.css[l.id]:l.css;
  set("web-goal",l.goal);clearFeedback("web-feedback");preview();
 }
}
function chooseTrack(name){
 if(!Object.hasOwn(tracks,name))return;
 capture();track=name;position=0;render();
}
document.querySelectorAll("[data-track]").forEach(b=>b.addEventListener("click",()=>chooseTrack(b.dataset.track)));
document.querySelectorAll("[data-start]").forEach(b=>b.addEventListener("click",()=>{
 chooseTrack(b.dataset.start);
 $("atelier").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});
}));
document.querySelectorAll("[data-snippet]").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.snippet;if(track==="algo")comparison();}));
$("algo-editor").addEventListener("input",()=>{progress.code[lesson().id]=$("algo-editor").value.slice(0,12000);persist();});
$("reset-code").addEventListener("click",()=>{
 $("algo-editor").value=lesson().starter;capture();clearFeedback("algo-feedback");output("Code restauré.","EN ATTENTE");
});
$("show-hint").addEventListener("click",()=>{
 showHint=!showHint;$("algo-hint").hidden=!showHint;$("algo-hint").textContent="💡 "+lesson().hint;
});
$("show-solution").addEventListener("click",()=>{
 $("algo-editor").value=lesson().solution;capture();feedback("algo-feedback","Solution affichée : lis-la, puis essaie de la modifier.",true);
});
$("validate-algo").addEventListener("click",()=>{
 capture();
 try{
  const result=execute($("algo-editor").value).output;
  const correct=normalizeOutput(result)===normalizeOutput(lesson().expected);
  output(result.length?result.join("\n"):"(Aucune sortie)",correct?"SORTIE ATTENDUE":"SORTIE DIFFÉRENTE");
  if(correct){feedback("algo-feedback","✓ Bravo, tu obtiens la sortie attendue. Vérifie que tu comprends chaque instruction.",true);markDone();}
  else feedback("algo-feedback","Pas encore. Compare ta sortie avec la consigne et essaie à nouveau.",false);
 }catch(e){
  output(e.message||"Erreur","ERREUR");feedback("algo-feedback","Ton programme a une erreur : "+(e.message||"Erreur inconnue"),false);
 }
});
$("check-c").addEventListener("click",()=>{
 const selected=document.querySelector('input[name="answer-c"]:checked');
 if(!selected){feedback("c-feedback","Sélectionne une réponse.",false);return;}
 if(Number(selected.value)===lesson().correct){feedback("c-feedback","✓ Bonne réponse ! "+lesson().why,true);markDone();}
 else feedback("c-feedback","Ce n'est pas encore la bonne réponse. Relis l'exemple.",false);
});
$("html-editor").addEventListener("input",()=>{progress.html[lesson().id]=$("html-editor").value.slice(0,25000);persist();});
$("css-editor").addEventListener("input",()=>{progress.css[lesson().id]=$("css-editor").value.slice(0,25000);persist();});
$("update-preview").addEventListener("click",()=>{capture();preview();feedback("web-feedback","Aperçu actualisé. Compare le rendu avec ton objectif.",true);});
$("complete-web").addEventListener("click",()=>{capture();markDone();feedback("web-feedback","✓ Atelier marqué comme pratiqué, sans validation automatique de ton HTML/CSS.",true);});
$("web-hint-button").addEventListener("click",()=>feedback("web-feedback","💡 "+lesson().hint,true));
$("next-lesson").addEventListener("click",()=>{
 if(position<tracks[track].length-1){capture();position++;render();$("atelier").scrollIntoView({behavior:"auto"});}
});
render();
