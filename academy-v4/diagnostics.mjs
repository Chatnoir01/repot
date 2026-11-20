/** Parse compiler diagnostics as text, never as HTML. */
export function normalizeProgramOutput(value){return String(value||"").replace(/\r\n?/g,"\n").replace(/\\r\\n/g,"\n").trim();}
export function diagnoseCompilerOutput(stderr){
 const message=String(stderr||"Erreur C inconnue").slice(0,9000);
 const match=message.match(/(?:line|ligne)\s+(\d+)/i)||message.match(/(?:^|\s)(\d+):(\d+)(?::|\s)/m);
 const line=match?Number(match[1]):null;
 return {message,line:Number.isSafeInteger(line)&&line>0&&line<10000?line:null};
}
