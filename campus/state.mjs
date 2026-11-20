/** Local-first workspace persistence: no accounts, secrets, network or telemetry. */
export const STORAGE_KEY="devlab-campus-v1";
const MAX_FILE=24000,MAX_ITEMS=40;
const safeFilename=/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,59}$/;
export function defaultWorkspace(project){
 if(!project||!project.files)throw new Error("Projet invalide.");
 return {id:project.id,track:project.track,title:project.title,files:{...project.files},activeFile:project.entry||Object.keys(project.files)[0],updated:0};
}
export function cleanFiles(files){
 const result=Object.create(null);
 if(!files||typeof files!=="object"||Array.isArray(files))return result;
 for(const [name,source] of Object.entries(files).slice(0,10)){
  if(!safeFilename.test(name)||name==="__proto__"||name==="constructor"||name==="prototype"||typeof source!=="string")continue;
  result[name]=source.slice(0,MAX_FILE);
 }
 return result;
}
export function normalizeState(raw,projectMap={}){
 const fresh={version:1,active:undefined,completed:[],workspaces:{},custom:[]};
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return fresh;
 const completed=Array.isArray(raw.completed)?raw.completed.filter(id=>typeof id==="string"&&Object.hasOwn(projectMap,id)): [];
 fresh.completed=[...new Set(completed)].slice(0,MAX_ITEMS);
 const custom=Array.isArray(raw.custom)?raw.custom.slice(0,12):[];
 fresh.custom=custom.filter(x=>typeof x?.id==="string"&&/^custom-[a-zA-Z0-9-]{1,40}$/.test(x.id)&&["c","js","web"].includes(x.track)).map(x=>({
  id:x.id,track:x.track,title:String(x.title||"Projet personnel").slice(0,80),description:"Projet personnel"
 }));
 const allIds=new Set([...Object.keys(projectMap),...fresh.custom.map(x=>x.id)]);
 if(raw.workspaces&&typeof raw.workspaces==="object"&&!Array.isArray(raw.workspaces)){
  for(const [id,item] of Object.entries(raw.workspaces).slice(0,MAX_ITEMS)){
   if(!allIds.has(id)||!item||typeof item!=="object")continue;
   const files=cleanFiles(item.files);
   const names=Object.keys(files);
   if(!names.length)continue;
   const track=projectMap[id]?.track||fresh.custom.find(x=>x.id===id)?.track;
   fresh.workspaces[id]={id,track,title:String(item.title||projectMap[id]?.title||"Projet").slice(0,80),files,activeFile:names.includes(item.activeFile)?item.activeFile:names[0],updated:Number.isFinite(item.updated)?item.updated:0};
  }
 }
 if(typeof raw.active==="string"&&allIds.has(raw.active))fresh.active=raw.active;
 return fresh;
}
export function readState(storage,projectMap){
 try{return normalizeState(JSON.parse(storage.getItem(STORAGE_KEY)||"null"),projectMap);}
 catch{return normalizeState(null,projectMap);}
}
export function saveState(storage,state){
 try{storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}
 catch{return false;}
}
export function addFile(workspace,name,source=""){
 if(!safeFilename.test(name)||["__proto__","constructor","prototype"].includes(name))throw new Error("Nom de fichier invalide.");
 const names=Object.keys(workspace.files);
 if(names.includes(name))throw new Error("Ce fichier existe déjà.");
 if(names.length>=10)throw new Error("Maximum dix fichiers par projet.");
 workspace.files[name]=String(source).slice(0,MAX_FILE);workspace.activeFile=name;
 return workspace;
}
export function projectDone(state,id){return state.completed.includes(id);}
export function completeProject(state,id){if(!state.completed.includes(id))state.completed.push(id);}
