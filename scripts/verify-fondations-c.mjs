import {readFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import vm from "node:vm";
import {lessons,makeCases} from "../campus/fondations/curriculum.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const wasm1=readFileSync(resolve(root,"academy-v4/compiler.wasm"));
const wasm2=readFileSync(resolve(root,"academy-v4/assembler.wasm"));
function checkWasm(b,name){
 if(b.length<10000||b.subarray(0,4).toString("hex")!=="0061736d")throw new Error(name+" invalid or incomplete");
 console.log(name+": "+b.length+" bytes, valid wasm header");
}
checkWasm(wasm1,"compiler.wasm");checkWasm(wasm2,"assembler.wasm");
const imports={
 WebAssembly,TextEncoder,TextDecoder,Uint8Array,Uint16Array,Int32Array,DataView,ArrayBuffer,BigInt,
 Date,Math,JSON,Set,Map,Number,String,Error,Object,Promise,console,crypto:globalThis.crypto,
 fetch:async path=>{
  const name=String(path).replace(/^\.\//,"");
  if(!["compiler.wasm","assembler.wasm"].includes(name))throw new Error("Unexpected fetch "+name);
  const bytes=readFileSync(resolve(root,"academy-v4",name));
  return {ok:true,arrayBuffer:async()=>Uint8Array.from(bytes).buffer};
 }
};
const ctx=vm.createContext(imports);
vm.runInContext(readFileSync(resolve(root,"academy-v4/vendor/wasi-harness.js"),"utf8"),ctx,{filename:"wasi-harness.js"});
vm.runInContext(readFileSync(resolve(root,"academy-v4/vendor/compiler-api.js"),"utf8"),ctx,{filename:"compiler-api.js"});
async function compileRun(source,stdin=""){
 const wasm=await ctx.CompilerAPI.compileBinary(source);
 const harness=ctx.createWasiHarness({mode:"buffer",inputBytes:new TextEncoder().encode(stdin),args:["program"]});
 const mod=await WebAssembly.compile(wasm);
 const instance=await WebAssembly.instantiate(mod,harness.imports);
 harness.setMemory(instance.exports.memory);
 try{instance.exports._start();}catch(error){if(!harness.isExit(error))throw error;}
 return {stdout:harness.stdout.trim(),stderr:harness.stderr,code:harness.exitCode};
}
let total=0;
for(const l of lessons){
 const cases=makeCases(l,l.solution);
 for(const c of cases){
  let output;
  try{output=await compileRun(c.source,c.stdin);}catch(error){throw new Error(l.id+" "+c.name+": "+String(error.message||error)+"\nSource C :\n"+c.source);}
  if(output.stdout!==c.expected.trim()||output.code!==0)throw new Error(l.id+" "+c.name+": expected="+JSON.stringify(c.expected)+" actual="+JSON.stringify(output));
  total++;
 }
 console.log("PASS "+l.id+" ("+cases.length+" cases)");
}
const badSource="#include <stdio.h>\nint main(void) { printf(\"oops\" return 0; }\n";
try{await compileRun(badSource);throw new Error("Malformed code unexpectedly compiled.");}
catch(e){if(e.message==="Malformed code unexpectedly compiled.")throw e;console.log("PASS C compiler rejects syntactically invalid code");}
console.log("PASS Fondations C: "+lessons.length+" lessons and "+total+" true compiled C cases");
