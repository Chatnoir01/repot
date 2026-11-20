/**
 * Deterministic, evidence-based coach: never invents a fix and never
 * claims to have seen a compiler diagnostic that is not present.
 */
function lineOf(input){
 const text=String(input||"");
 const x=text.match(/\b(?:line|ligne)\s+(\d+)\b/i)
  ||text.match(/(?:^|\s|:)(\d+):(\d+)(?::|\s)/);
 const n=x?Number(x[1]):null;
 return Number.isSafeInteger(n)&&n>0&&n<10000?n:null;
}
export function explainCompilationFailure(stderr){
 const evidence=String(stderr||"Le compilateur n'a pas fourni de diagnostic.").slice(0,5000);
 const line=lineOf(evidence);
 let title="La compilation a échoué",explanation="Le compilateur n'a pas pu transformer ce code en programme. Consulte son message exact et reviens à la dernière modification.";
 let checks=["Vérifie la ligne indiquée si le compilateur en fournit une.","Compare les parenthèses, accolades et points-virgules.","Réessaie après une seule correction."];
 if(/unknown identifier|undeclared|not declared|undefined name|unknown variable/i.test(evidence)){
  title="Nom non reconnu";
  explanation="Le compilateur semble signaler un identifiant inconnu. Vérifie que la variable ou la fonction est déclarée et que son nom est orthographié de la même manière partout.";
  checks=["Compare les majuscules et les minuscules.","Vérifie la déclaration avant l'utilisation.","Relance la compilation après la correction."];
 }else if(/expected|syntax|unexpected|token|semicolon|parse/i.test(evidence)){
  title="La syntaxe demande une correction";
  explanation="Le compilateur signale un élément inattendu ou manquant. Une parenthèse, une accolade, un guillemet ou un point-virgule peut empêcher la compilation.";
  checks=["Relis la ligne signalée, et éventuellement la ligne précédente.","Vérifie les délimiteurs ( ) { } et les guillemets.","Teste une modification à la fois."];
 }
 return {category:"compile",title,explanation,checks,line,evidence};
}
export function explainTestFailure(lesson,test){
 const expected=String(test?.expected??"").slice(0,220);
 const actual=String(test?.actual??"").slice(0,220);
 const label=String(test?.name??"Ce test").slice(0,100);
 return {
  category:"logic",title:"Le code s'exécute, mais le résultat diffère",
  explanation:label+" : le test attend "+JSON.stringify(expected)+" ; ton programme a renvoyé "+JSON.stringify(actual)+". Compare les deux résultats avant de changer le code.",
  advice:String(lesson?.tip||"Relis l'objectif, puis regarde l'instruction qui produit la sortie.").slice(0,500),
  checks:["Prédit le résultat attendu avant de modifier le code.","Corrige une seule ligne puis relance les tests.","Vérifie aussi les cas limites lorsqu'ils sont disponibles."],
  evidence:"Sortie réelle : "+JSON.stringify(actual),
  line:null
 };
}
