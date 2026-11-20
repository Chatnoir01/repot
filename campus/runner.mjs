/**
 * DEV/LAB Campus: sandboxed learning runners.
 * JavaScript runs in a dedicated worker inside an opaque-origin iframe with CSP.
 * Web HTML/CSS renders with scripts disabled. C reuses pinned Academy V4 wasm.
 */
export function normalized(value){return String(value??"").replace(/\r\n?/g,"\n").trim();}
export const JS_LIMIT=12000;
const bootstrap="(()=>{\n const workerSource=\"\\\"use strict\\\";\\nself.addEventListener(\\\"message\\\",event=>{\\n const d=event.data||{};\\n const logs=[];let chars=0;\\n const emit=(...args)=>{\\n  let line=args.map(v=>{try{return typeof v===\\\"string\\\"?v:JSON.stringify(v);}catch{return String(v);}}).join(\\\" \\\");\\n  if(chars>8000||logs.length>=80)return;\\n  chars+=line.length;logs.push(line.slice(0,1000));\\n };\\n const output={log:emit,info:emit,warn:emit,error:emit};\\n try{\\n  const code=String(d.code||\\\"\\\");\\n  const checks=Array.isArray(d.checks)?d.checks:[];\\n  if(code.length>12000||checks.length>12)throw Error(\\\"Programme trop long.\\\");\\n  const expressions=checks.map(t=>String(t.expression));\\n  const suffix=expressions.length?\\\"\\\\n;return [\\\"+expressions.map(e=>\\\"(\\\"+e+\\\")\\\").join(\\\",\\\")+\\\"];\\\":\\\"\\\";\\n  const values=new Function(\\\"console\\\",code+suffix)(output);\\n  const actual=Array.isArray(values)?values:[];\\n  const tests=checks.map((c,i)=>{\\n   let got=actual[i],pass=false;\\n   try{pass=JSON.stringify(got)===JSON.stringify(c.expected);}\\n   catch{got=\\\"[non sérialisable]\\\";}\\n   return {label:String(c.label||\\\"Test \\\"+(i+1)),ok:pass,got:String(typeof got===\\\"string\\\"?got:JSON.stringify(got)),expected:String(typeof c.expected===\\\"string\\\"?c.expected:JSON.stringify(c.expected))};\\n  });\\n  self.postMessage({ok:true,output:logs.join(\\\"\\\\n\\\"),tests});\\n }catch(error){\\n  self.postMessage({ok:false,error:String(error?.stack||error).slice(0,5000),output:logs.join(\\\"\\\\n\\\"),tests:[]});\\n }\\n});\";\n let running=null,blobUrl=null;\n window.addEventListener(\"message\",event=>{\n  if(event.source!==parent)return;\n  const data=event.data;\n  if(!data||typeof data.token!==\"string\")return;\n  if(data.action===\"stop\"){\n    if(running){running.terminate();running=null;}\n    if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=null;}\n    return;\n  }\n  if(data.action!==\"start\")return;\n  if(running)running.terminate();\n  if(blobUrl)URL.revokeObjectURL(blobUrl);\n  try{\n    blobUrl=URL.createObjectURL(new Blob([workerSource],{type:\"text/javascript\"}));\n    running=new Worker(blobUrl);\n    running.onmessage=msg=>{\n      window.parent.postMessage({token:data.token,kind:\"done\",result:msg.data},\"*\");\n      running.terminate();running=null;URL.revokeObjectURL(blobUrl);blobUrl=null;\n    };\n    running.onerror=e=>{\n      window.parent.postMessage({token:data.token,kind:\"error\",message:String(e.message||\"Erreur du Worker\")},\"*\");\n      running.terminate();running=null;\n      if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=null;}\n    };\n    running.postMessage({code:data.code,checks:data.checks});\n  }catch(e){window.parent.postMessage({token:data.token,kind:\"error\",message:String(e?.message||e)},\"*\");}\n });\n window.parent.postMessage({kind:\"ready\"},\"*\");\n})();";
export function sandboxDocument(){
 // Escape HTML script boundaries; code is always inserted as a JSON string.
 const safe=bootstrap.replace(/</g,"\\u003c");
 return '<!doctype html><html><head><meta charset="utf-8">'+
 '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; connect-src \'none\'; script-src \'unsafe-inline\' \'unsafe-eval\' blob:; worker-src blob:; img-src \'none\'; font-src \'none\'; frame-src \'none\'; object-src \'none\'; form-action \'none\'; base-uri \'none\'">'+
 '</head><body><script>'+safe+'</scr'+'ipt></body></html>';
}
export function runJavaScript(frame,code,checks=[],deadlineMs=3500,signal){
 if(typeof code!=="string"||code.length>JS_LIMIT)return Promise.resolve({ok:false,error:"Code JavaScript trop long.",output:"",tests:[]});
 if(!Array.isArray(checks)||checks.length>12)return Promise.resolve({ok:false,error:"Trop de tests.",output:"",tests:[]});
 if(frame?.getAttribute("sandbox")!=="allow-scripts")return Promise.resolve({ok:false,error:"Cadre JavaScript non isolé.",output:"",tests:[]});
 return new Promise(resolve=>{
  const token="campus-"+Math.random().toString(36).slice(2)+"-"+Date.now();
  let settled=false,timer=null;
  const finish=result=>{
   if(settled)return;settled=true;
   window.removeEventListener("message",onMessage);
   signal?.removeEventListener("abort",onAbort);
   if(timer!==null)clearTimeout(timer);
   try{frame.contentWindow?.postMessage({action:"stop",token},"*");}catch{}
   frame.srcdoc="";
   resolve(result);
  };
  const onAbort=()=>finish({ok:false,error:"Exécution interrompue.",output:"",tests:[]});
  const onMessage=event=>{
   if(event.source!==frame.contentWindow)return;
   const d=event.data||{};
   if(d.kind==="ready")frame.contentWindow?.postMessage({action:"start",token,code,checks},"*");
   else if(d.token===token&&d.kind==="done")finish(d.result||{ok:false,error:"Résultat manquant.",output:"",tests:[]});
   else if(d.token===token&&d.kind==="error")finish({ok:false,error:d.message||"Erreur isolée.",output:"",tests:[]});
  };
  window.addEventListener("message",onMessage);
  if(signal?.aborted){onAbort();return;}
  signal?.addEventListener("abort",onAbort,{once:true});
  timer=setTimeout(()=>finish({ok:false,error:"Temps d'exécution dépassé : programme interrompu.",output:"",tests:[]}),Math.max(1000,Math.min(deadlineMs,8000)));
  frame.srcdoc=sandboxDocument();
 });
}
export function webDocument(files){
 const html=String(files?.["index.html"]||"").slice(0,24000);
 const css=String(files?.["style.css"]||"").slice(0,24000).replace(/<\/style/gi,"<\\/style");
 return '<!doctype html><html lang="fr"><head><meta charset="utf-8">'+
 '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:; font-src data:; connect-src \'none\'; form-action \'none\'; base-uri \'none\'">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<style>'+css+'</style></head><body>'+html+'</body></html>';
}
export function previewWeb(frame,files){
 if(frame?.getAttribute("sandbox")!=="")throw new Error("Aperçu non isolé.");
 frame.srcdoc=webDocument(files);
}
export function runCWorker(cases,deadlineMs=28000,signal){
 if(!Array.isArray(cases)||cases.length===0||cases.length>5)return Promise.resolve({ok:false,error:"Cas C invalides.",results:[]});
 return new Promise(resolve=>{
  let done=false;
  const worker=new Worker("../academy-v4/compile-worker.js");
  const requestId=1;
  let timer=null;
  const finish=result=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener("abort",onAbort);worker.terminate();resolve(result);};
  const onAbort=()=>finish({ok:false,error:"Exécution interrompue.",results:[]});
  worker.onmessage=event=>{
   const d=event.data||{};
   if(d.requestId!==requestId)return;
   if(d.kind==="done")finish({ok:true,results:d.results||[]});
   else if(d.kind==="error")finish({ok:false,error:d.message||"Erreur C.",results:[]});
  };
  worker.onerror=e=>finish({ok:false,error:e.message||"Erreur du compilateur WebAssembly.",results:[]});
  if(signal?.aborted){onAbort();return;}
  signal?.addEventListener("abort",onAbort,{once:true});
  timer=setTimeout(()=>finish({ok:false,error:"Temps limite atteint : compilation ou boucle interrompue.",results:[]}),Math.max(2000,Math.min(deadlineMs,35000)));
  worker.postMessage({requestId,cases});
 });
}
