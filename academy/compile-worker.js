/* Compile and run actual C source using MIT-licensed c2wasm in an isolated Web Worker.
 * Restricted C89/C90 subset, not a full system GCC/Clang compiler.
 * Terminated by the parent after an execution deadline.
 */
"use strict";
importScripts("./vendor/wasi-harness.js","./vendor/compiler-api.js");
self.addEventListener("message",async event=>{
 const {requestId,cases}=event.data||{};
 if(!Number.isSafeInteger(requestId)||!Array.isArray(cases)||cases.length>5||cases.length<1){
   self.postMessage({requestId,kind:"error",message:"Requête de compilation invalide."});return;
 }
 const results=[];
 try{
  for(let i=0;i<cases.length;i++){
   const item=cases[i];
   if(typeof item.source!=="string"||item.source.length>12000||typeof item.stdin!=="string"||item.stdin.length>1024){
     throw new Error("Limites du code ou de l'entrée dépassées.");
   }
   self.postMessage({requestId,kind:"progress",index:i+1,total:cases.length});
   let compiled;
   try{compiled=await CompilerAPI.compileBinary(item.source);}
   catch(error){
     results.push({index:i,name:item.name,phase:"compile",ok:false,stderr:String(error?.message||error).slice(0,7000),stdout:"",exitCode:null});
     continue;
   }
   try{
    const context=createWasiHarness({mode:"buffer",inputBytes:new TextEncoder().encode(item.stdin),args:["programme"]});
    const module=await WebAssembly.compile(compiled);
    const instance=await WebAssembly.instantiate(module,context.imports);
    context.setMemory(instance.exports.memory);
    try{instance.exports._start();}
    catch(error){if(!context.isExit(error))throw error;}
    const out=context.stdout||"",err=context.stderr||"";
    results.push({index:i,name:item.name,phase:"run",ok:true,stdout:out.slice(0,10000),stderr:err.slice(0,7000),exitCode:context.exitCode});
   }catch(error){
    results.push({index:i,name:item.name,phase:"runtime",ok:false,stdout:"",stderr:String(error?.message||error).slice(0,7000),exitCode:null});
   }
  }
  self.postMessage({requestId,kind:"done",results});
 }catch(error){self.postMessage({requestId,kind:"error",message:String(error?.message||error).slice(0,7000)});}
});
