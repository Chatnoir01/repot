/**
 * Atelier interpreter: deliberately small pseudocode DSL.
 * No eval(), Function(), user-authored JavaScript, network requests or arbitrary file access.
 * Pure and deterministic; bounded to prevent infinite loops and excessive output.
 */
const MAX_PROGRAM_CHARS=12000;
const MAX_LINES=200;
const MAX_STEPS=3000;
const MAX_OUTPUT_LINES=100;
const MAX_OUTPUT_CHARS=10000;
const forbiddenNames=new Set(["__proto__","constructor","prototype"]);

export class AtelierError extends Error {
  constructor(message, line=0) {
    super(line ? "Ligne "+line+" : "+message : message);
    this.name="AtelierError";
    this.line=line;
  }
}
function tokenize(expr,line) {
  const tokens=[];
  const regex=/\s*(?:(\d+(?:\.\d+)?)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([a-zA-Z_]\w*)|(>=|<=|==|!=|&&|\|\||[()+\-*/%!<>]))/y;
  let pos=0;
  while(pos<expr.length){
    if(/^\s+$/.test(expr.slice(pos))) break;
    regex.lastIndex=pos;
    const m=regex.exec(expr);
    if(!m)throw new AtelierError("Expression incorrecte près de « "+expr.slice(pos,pos+12)+" ».",line);
    pos=regex.lastIndex;
    if(m[1])tokens.push({type:"number",value:Number(m[1])});
    else if(m[2]){
      let str=m[2];
      const quote=str[0];
      str=str.slice(1,-1).replace(/\\([\\nrt"'])/g,(_,c)=>({n:"\n",r:"\r",t:"\t","\\":"\\",'"':'"',"'":"'"}[c]));
      tokens.push({type:"string",value:str});
    }
    else if(m[3])tokens.push({type:"identifier",value:m[3]});
    else tokens.push({type:"operator",value:m[4]});
    if(tokens.length>300)throw new AtelierError("Expression trop longue.",line);
  }
  return tokens;
}
const precedence={"||":1,"&&":2,"==":3,"!=":3,">":4,"<":4,">=":4,"<=":4,"+":5,"-":5,"*":6,"/":6,"%":6};
function evaluate(expr,variables,line){
  const tokens=tokenize(expr,line);
  let idx=0;
  function atom(){
    const t=tokens[idx++];
    if(!t)throw new AtelierError("Expression incomplète.",line);
    if(t.type==="number"||t.type==="string")return t.value;
    if(t.type==="identifier"){
      if(t.value==="vrai")return true;
      if(t.value==="faux")return false;
      if(!Object.hasOwn(variables,t.value))throw new AtelierError("Variable inconnue : "+t.value+".",line);
      return variables[t.value];
    }
    if(t.value==="("){
      const result=parse(1);
      if(tokens[idx]?.value!==")")throw new AtelierError("Parenthèse fermante manquante.",line);
      idx++;
      return result;
    }
    if(t.value==="-"){
      const n=atom();
      if(typeof n!=="number")throw new AtelierError("Le signe − nécessite un nombre.",line);
      return -n;
    }
    if(t.value==="!")return !Boolean(atom());
    throw new AtelierError("Symbole inattendu : "+t.value+".",line);
  }
  function binary(op,left,right){
    switch(op){
      case "+":return typeof left==="string"||typeof right==="string"?String(left)+String(right):left+right;
      case "-":return Number(left)-Number(right);
      case "*":return Number(left)*Number(right);
      case "/":if(Number(right)===0)throw new AtelierError("Division par zéro.",line);return Number(left)/Number(right);
      case "%":if(Number(right)===0)throw new AtelierError("Modulo par zéro.",line);return Number(left)%Number(right);
      case ">":return left>right;
      case "<":return left<right;
      case ">=":return left>=right;
      case "<=":return left<=right;
      case "==":return left===right;
      case "!=":return left!==right;
      case "&&":return Boolean(left)&&Boolean(right);
      case "||":return Boolean(left)||Boolean(right);
      default:throw new AtelierError("Opérateur inconnu.",line);
    }
  }
  function parse(min){
    let left=atom();
    while(idx<tokens.length){
      const op=tokens[idx]?.value,p=precedence[op];
      if(p===undefined||p<min)break;
      idx++;
      const right=parse(p+1);
      left=binary(op,left,right);
      if(typeof left==="number"&&!Number.isFinite(left))throw new AtelierError("Résultat numérique trop grand.",line);
    }
    return left;
  }
  if(tokens.length===0)throw new AtelierError("Expression vide.",line);
  const value=parse(1);
  if(idx!==tokens.length)throw new AtelierError("Élément inattendu après l'expression.",line);
  return value;
}
function parseProgram(source){
  if(typeof source!=="string"||source.length>MAX_PROGRAM_CHARS)throw new AtelierError("Programme trop long (maximum 12 000 caractères).");
  const lines=source.replace(/\r\n?/g,"\n").split("\n");
  if(lines.length>MAX_LINES)throw new AtelierError("Programme trop long (maximum 200 lignes).");
  const records=lines.map((s,i)=>({line:i+1,text:s.trim()})).filter(x=>x.text&&!/^(#|\/\/)/.test(x.text));
  let index=0;
  function block(stop){
    const nodes=[];
    while(index<records.length){
      const {line,text}=records[index], lower=text.toLowerCase();
      if(stop.includes(lower))return {nodes,end:lower};
      if(lower==="sinon"||lower==="fin")throw new AtelierError("« "+lower+" » sans bloc correspondant.",line);
      const si=/^si\s+(.+)\s+alors$/i.exec(text);
      if(si){
        index++;
        const thenBlock=block(["sinon","fin"]);
        if(!thenBlock.end)throw new AtelierError("Il manque « fin » après « si ».",line);
        let elseNodes=[];
        if(thenBlock.end==="sinon"){
          index++;
          const elseBlock=block(["fin"]);
          if(elseBlock.end!=="fin")throw new AtelierError("Il manque « fin » après « sinon ».",line);
          elseNodes=elseBlock.nodes;
        }
        index++;
        nodes.push({kind:"if",test:si[1],yes:thenBlock.nodes,no:elseNodes,line});
        continue;
      }
      const pour=/^pour\s+([a-zA-Z_]\w*)\s+de\s+(.+?)\s+a\s+(.+)$/i.exec(text);
      if(pour){
        if(forbiddenNames.has(pour[1]))throw new AtelierError("Nom de variable interdit.",line);
        index++;
        const inner=block(["fin"]);
        if(inner.end!=="fin")throw new AtelierError("Il manque « fin » après « pour ».",line);
        index++;
        nodes.push({kind:"for",name:pour[1],from:pour[2],to:pour[3],body:inner.nodes,line});
        continue;
      }
      const whileExpr=/^tantque\s+(.+)\s+faire$/i.exec(text);
      if(whileExpr){
        index++;
        const inner=block(["fin"]);
        if(inner.end!=="fin")throw new AtelierError("Il manque « fin » après « tantque ».",line);
        index++;
        nodes.push({kind:"while",test:whileExpr[1],body:inner.nodes,line});
        continue;
      }
      const echo=/^afficher\s+(.+)$/i.exec(text);
      const assign=/^([a-zA-Z_]\w*)\s*=\s*(.+)$/.exec(text);
      if(echo)nodes.push({kind:"print",expr:echo[1],line});
      else if(assign){
        if(forbiddenNames.has(assign[1])||assign[1]==="vrai"||assign[1]==="faux")throw new AtelierError("Nom de variable interdit.",line);
        nodes.push({kind:"assign",name:assign[1],expr:assign[2],line});
      } else throw new AtelierError("Instruction inconnue : « "+text.slice(0,40)+" ». Utilise afficher, si, pour, tantque ou une affectation.",line);
      index++;
    }
    return {nodes,end:null};
  }
  const root=block([]);
  return root.nodes;
}
function display(value){
  if(typeof value==="boolean")return value?"vrai":"faux";
  return String(value);
}
export function execute(source){
  const ast=parseProgram(source);
  const variables=Object.create(null),output=[];
  let steps=0,outputChars=0;
  function tick(line){
    if(++steps>MAX_STEPS)throw new AtelierError("Limite de calcul atteinte : vérifie tes boucles.",line);
  }
  function run(nodes){
    for(const node of nodes){
      tick(node.line);
      if(node.kind==="assign") variables[node.name]=evaluate(node.expr,variables,node.line);
      else if(node.kind==="print"){
        const value=display(evaluate(node.expr,variables,node.line));
        outputChars+=value.length;
        if(output.length>=MAX_OUTPUT_LINES||outputChars>MAX_OUTPUT_CHARS)throw new AtelierError("Trop de lignes affichées.",node.line);
        output.push(value);
      }else if(node.kind==="if"){
        run(Boolean(evaluate(node.test,variables,node.line))?node.yes:node.no);
      }else if(node.kind==="for"){
        const from=evaluate(node.from,variables,node.line),to=evaluate(node.to,variables,node.line);
        if(!Number.isInteger(from)||!Number.isInteger(to))throw new AtelierError("Une boucle pour exige deux bornes entières.",node.line);
        if(Math.abs(to-from)>500)throw new AtelierError("Boucle trop grande (maximum 501 tours).",node.line);
        const step=from<=to?1:-1;
        for(let i=from;step>0?i<=to:i>=to;i+=step){
          tick(node.line);variables[node.name]=i;run(node.body);
        }
      }else if(node.kind==="while"){
        let n=0;
        while(Boolean(evaluate(node.test,variables,node.line))){
          tick(node.line);
          if(++n>500)throw new AtelierError("Boucle sans fin probable (maximum 500 tours).",node.line);
          run(node.body);
        }
      }
    }
  }
  run(ast);
  return {output,variables:{...variables},steps};
}
export function normalizeOutput(output){
  return output.map(x=>String(x).trim()).join("\n").trim();
}
