/**
 * Optional real-C runtime observation.
 *
 * This is NOT a universal C debugger. We only instrument simple, standalone
 * integer assignments inside main(). The SECOND source is actually compiled
 * and executed with c2wasm, and its normal stdout must match the original
 * program's output after removing unpredictable trace markers.
 * If unsupported or inconsistent, we show no runtime observations.
 */
const TOKEN=/^[a-f0-9]{12,24}$/;
const VALID_NAME=/^[a-zA-Z_][a-zA-Z0-9_]*$/;
const MAX_POINTS=24,MAX_FRAMES=96;
function braceDelta(line){
 // Best effort lexer for braces: ignore string/character literals and //.
 let depth=0,quote=null,escaped=false;
 for(let i=0;i<line.length;i++){
  const c=line[i],n=line[i+1];
  if(quote){
   if(escaped){escaped=false;continue;}
   if(c==="\\"){escaped=true;continue;}
   if(c===quote)quote=null;
   continue;
  }
  if(c==="'"||c==='"'){quote=c;continue;}
  if(c==="/"&&n==="/")break;
  if(c==="{")depth++;
  if(c==="}")depth--;
 }
 return depth;
}
export function instrumentCase(source,token){
 if(typeof source!=="string"||source.length>11200||!TOKEN.test(token))return null;
 const lines=source.split("\n"),out=[],points=[],initialized=new Set();
 let inMain=false,depth=0,foundMain=false;
 for(let i=0;i<lines.length;i++){
  const line=lines[i];
  out.push(line);
  if(!inMain&&/^\s*int\s+main\s*\(\s*(?:void)?\s*\)\s*\{\s*(?:\/\/.*)?$/.test(line)){
   inMain=true;foundMain=true;depth=1;continue;
  }
  if(!inMain)continue;
  const wasInside=depth>0;
  const diff=braceDelta(line);
  const single=line.trim();
  const isStatement=wasInside&&single.endsWith(";")&&!single.includes("/*")&&!single.includes("*/")&&!single.startsWith("//");
  let name=null;
  if(isStatement){
   const declaration=single.match(/^int\s+([A-Za-z_]\w*)\s*=\s*[^;]+;\s*$/);
   if(declaration){
    name=declaration[1];initialized.add(name);
   }else{
    const modification=single.match(/^([A-Za-z_]\w*)\s*(?:=(?!=)\s*[^;]+|\+\+|--|\+=\s*[^;]+|-=\s*[^;]+);\s*$/);
    if(modification&&initialized.has(modification[1]))name=modification[1];
   }
  }
  // Do not probe statements on brace-changing lines or C keywords.
  if(name&&VALID_NAME.test(name)&&diff===0&&points.length<MAX_POINTS){
   const indent=line.match(/^\s*/)?.[0]||"";
   const marker="__DLTRACE_"+token+"_"+(i+1)+"_"+name;
   out.push(indent+'printf("'+marker+':%d__\\n", '+name+');');
   points.push({line:i+1,name});
  }
  depth+=diff;
  if(depth<=0){inMain=false;depth=0;}
 }
 if(!foundMain||!points.length)return null;
 const transformed=out.join("\n");
 if(transformed.length>12000)return null;
 return {source:transformed,points};
}
export function extractExecutionTrace(stdout,token){
 const input=String(stdout??"");
 if(!TOKEN.test(token))return {frames:[],cleanOutput:input};
 const pattern=new RegExp("__DLTRACE_"+token+"_(\\d+)_([A-Za-z_]\\w*):(-?\\d+)__\\r?\\n?","g");
 const frames=[];
 const cleanOutput=input.replace(pattern,(match,line,name,value)=>{
  if(frames.length<MAX_FRAMES){
   frames.push({line:Number(line),name,value:Number(value)});
  }
  return "";
 });
 return {frames,cleanOutput};
}
export function sameExecutionOutput(original,observed){
 return String(original??"").replace(/\r\n?/g,"\n")===String(observed??"").replace(/\r\n?/g,"\n");
}
