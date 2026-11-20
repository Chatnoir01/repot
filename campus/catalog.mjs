import {lessons as cLessons,casesFor} from "../academy-v4/curriculum.mjs";

/**
 * DEV/LAB Campus learning catalog.
 * A project is a real runnable workspace, not a fake interactive illustration.
 * C uses the pinned, tested c2wasm C89/C90 compiler from Academy V4.
 * JS executes in a sandboxed opaque-origin iframe and a worker.
 * Web previews HTML/CSS without running JavaScript.
 */
const cById=Object.fromEntries(cLessons.map(l=>[l.id,l]));
export const tracks=[
 {id:"c",name:"Langage C",subtitle:"Mémoire, logique et algorithmes",glyph:"C",method:"Compilateur WebAssembly C89/C90",status:"ready"},
 {id:"js",name:"JavaScript",subtitle:"Fonctions, données et interfaces",glyph:"JS",method:"Exécution isolée dans le navigateur",status:"ready"},
 {id:"web",name:"HTML & CSS",subtitle:"Structurer, composer et créer",glyph:"</>",method:"Aperçu HTML/CSS protégé",status:"ready"},
 {id:"python",name:"Python",subtitle:"Parcours en préparation",glyph:"PY",method:"Aucun moteur Python annoncé",status:"planned"}
];
function cProject(id,title,cId,description,skills,brief){
 const l=cById[cId];
 if(!l)throw new Error("C lesson not found: "+cId);
 const filename=l.tests.some(t=>t.expression)?"fonction.c":"main.c";
 return {id,track:"c",title,description,level:"Fondations",minutes:l.minutes,
   files:{[filename]:l.starter},entry:filename,
   guide:{mission:brief,concept:l.theory,steps:[...l.principles],hint:l.hint,review:l.review,pitfall:l.pitfall},
   checks:casesFor(l,l.solution).map(({name,stdin,expected})=>({label:name,stdin,expected})),
   cLessonId:cId,skills};
}
const cProjects=[
 cProject("c-hello","Le premier programme","c01","Ton point de départ : de la source à l'exécution.",["printf","main","compilation"],"Modifie le programme pour afficher exactement le message demandé."),
 cProject("c-functions","Ta première fonction","c07","Une seule fonction, plusieurs entrées : pas de réponse codée en dur.",["fonctions","return","tests"],"Fais fonctionner doubler(n) pour les nombres positifs, négatifs et zéro."),
 cProject("c-budget","Le panier intelligent","c10","Une règle métier simple, testée sur des scénarios contradictoires.",["conditions","opérateurs logiques"],"Autorise un achat seulement quand le budget suffit et le stock existe."),
 cProject("c-arrays","Calculer avec des tableaux","c12","Un problème de traitement de données avec des tailles différentes.",["tableaux","boucles","pointeurs"],"Additionne les valeurs d'un tableau sans supposer qu'il a toujours la même taille.")
];
const jsProjects=[
 {id:"js-first",track:"js",title:"Ta première fonction JavaScript",description:"Définir une fonction, retourner une valeur et observer les tests.",level:"Débutant",minutes:8,
  files:{"main.js":'function doubler(n) {\n  // Remplace n par le calcul attendu\n  return n;\n}\n\nconsole.log("Exemple :", doubler(4));\n'},entry:"main.js",skills:["function","return","console"],
  guide:{mission:"Crée doubler(n) qui renvoie deux fois n pour n'importe quel nombre.",concept:"Une fonction reçoit une valeur, effectue un calcul puis renvoie un résultat avec return. console.log affiche des messages dans le terminal du studio.",steps:["Une fonction est définie avec function nom(paramètre).","return donne une valeur à celui qui appelle la fonction.","Teste plusieurs valeurs : l'exemple affiché ne suffit pas."],hint:"La formule recherchée est n * 2.",review:"Tu as écrit du JavaScript exécuté par un moteur réel du navigateur.",pitfall:"Afficher n * 2 n'est pas équivalent à le renvoyer : les tests attendent un return."},
  checks:[{label:"doubler(4)",expression:"doubler(4)",expected:8},{label:"doubler(0)",expression:"doubler(0)",expected:0},{label:"doubler(-3)",expression:"doubler(-3)",expected:-6}]},
 {id:"js-access",track:"js",title:"Créer un contrôle d'accès",description:"Transformer une règle en conditions if / else.",level:"Débutant",minutes:12,
  files:{"main.js":'function acces(age) {\n  if (age >= 18) {\n    return "autorisé";\n  }\n  return "autorisé";\n}\n\nconsole.log(acces(15));\n'},entry:"main.js",skills:["if","else","comparaisons"],
  guide:{mission:'Retourne "autorisé" pour un âge supérieur ou égal à 18, sinon "refusé".',concept:"Une condition distingue deux situations. La comparaison >= inclut la limite de 18 ans, tandis que return termine immédiatement la fonction.",steps:["Écris la règle sous forme d'une phrase.","Teste les cas au-dessus et en dessous de 18.","N'oublie pas le cas exact de 18 ans."],hint:'La dernière instruction doit retourner "refusé".',review:"Tu as converti une règle en une fonction réutilisable.",pitfall:"Une condition correcte ne suffit pas si les deux branches renvoient la même réponse."},
  checks:[{label:"Mineur",expression:"acces(15)",expected:"refusé"},{label:"Majorité exacte",expression:"acces(18)",expected:"autorisé"},{label:"Adulte",expression:"acces(30)",expected:"autorisé"}]},
 {id:"js-cart",track:"js",title:"Un vrai total de panier",description:"Parcourir un tableau et additionner des montants.",level:"Intermédiaire",minutes:18,
  files:{"main.js":'function totalPanier(prix) {\n  let total = 0;\n  for (const prixUnitaire of prix) {\n    total += 1;\n  }\n  return total;\n}\n\nconsole.log(totalPanier([5, 10, 3]));\n'},entry:"main.js",skills:["tableaux","for...of","accumulateur"],
  guide:{mission:"Écris totalPanier(prix) pour calculer la somme de tous les montants du tableau.",concept:"Un tableau conserve une série de données. La boucle for...of parcourt chaque valeur ; un accumulateur conserve le total. La solution ne doit pas dépendre de la longueur de la liste.",steps:["Initialise total à zéro.","Parcours les éléments du tableau un par un.","Ajoute chaque élément, et non la constante 1."],hint:"Dans la boucle, écris total += prixUnitaire.",review:"Tu sais calculer une somme quel que soit le contenu du tableau.",pitfall:"Tester uniquement trois éléments masque les erreurs sur les tableaux vides."},
  checks:[{label:"Trois produits",expression:"totalPanier([5,10,3])",expected:18},{label:"Panier vide",expression:"totalPanier([])",expected:0},{label:"Un produit",expression:"totalPanier([12])",expected:12},{label:"Valeurs mixtes",expression:"totalPanier([3,-2,7])",expected:8}]},
 {id:"js-scores",track:"js",title:"Analyser des scores",description:"Associer plusieurs règles à des résultats explicites.",level:"Intermédiaire",minutes:20,
  files:{"main.js":'function mention(score) {\n  if (score >= 16) return "excellent";\n  if (score >= 10) return "à revoir";\n  return "à revoir";\n}\n\nconsole.log(mention(14));\n'},entry:"main.js",skills:["if","bornes","tests limites"],
  guide:{mission:'Retourne "excellent" pour score ≥ 16, "réussi" pour score entre 10 et 15, "à revoir" en dessous.',concept:"L'ordre des conditions est fondamental. Une fois le premier return rencontré, les autres lignes ne sont plus exécutées. Les valeurs limites permettent de détecter les erreurs.",steps:["Commence par la valeur maximale, 16.","Gère les scores à partir de 10 dans la branche suivante.","Les autres valeurs correspondent au résultat à revoir."],hint:'Dans la branche score >= 10, retourne "réussi".',review:"Tu sais tester rigoureusement les seuils d'une règle.",pitfall:"Un test sur 14 ne prouve pas que 10, 15 ou 16 fonctionnent correctement."},
  checks:[{label:"Score faible",expression:"mention(7)",expected:"à revoir"},{label:"Seuil réussi",expression:"mention(10)",expected:"réussi"},{label:"Haut de plage",expression:"mention(15)",expected:"réussi"},{label:"Seuil excellent",expression:"mention(16)",expected:"excellent"},{label:"Score parfait",expression:"mention(20)",expected:"excellent"}]}
];
const webProjects=[
 {id:"web-hero",track:"web",title:"Ton premier écran d'accueil",description:"Une page qui raconte quelque chose, pas seulement trois balises.",level:"Débutant",minutes:12,
 files:{"index.html":'<main class="hero">\n  <span class="eyebrow">MON PREMIER PROJET</span>\n  <h1>Une idée prend forme.</h1>\n  <p>Je construis une page web avec du HTML et du CSS.</p>\n  <a href="#suite" class="button">Découvrir</a>\n</main>\n<section id="suite"><h2>À propos</h2><p>Continue ton histoire ici.</p></section>',
 "style.css":'body { margin: 0; font-family: system-ui; background: #edf0e6; color: #172416; }\n.hero { min-height: 70vh; padding: 8vw; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }\n.eyebrow { font-size: 12px; letter-spacing: 0.18em; color: #54733e; }\nh1 { font-size: clamp(40px, 7vw, 82px); max-width: 720px; line-height: 1.05; }\np { max-width: 540px; }\n.button { background: #bdf36d; padding: 12px 20px; text-decoration: none; color: #142310; border-radius: 6px; }\n#suite { padding: 8vw; }'},
 entry:"index.html",skills:["sémantique","typographie","mise en page"],
 guide:{mission:"Transforme le premier écran : modifie le titre, l'ambiance et le bouton. Vérifie le rendu dans l'aperçu.",concept:"HTML donne du sens aux éléments : h1 représente le titre principal. CSS définit leur apparence et leur disposition.",steps:["Remplace le titre par ton idée.","Modifie les couleurs dans style.css.","Vérifie la lisibilité à largeur mobile dans l'aperçu."],hint:"Dans index.html, modifie le texte du h1, puis dans style.css la propriété background.",review:"Tu as créé et visualisé une page responsive.",pitfall:"Une belle maquette sur ordinateur peut devenir illisible sur un petit écran."}},
 {id:"web-cards",track:"web",title:"Une grille de projets",description:"Concevoir une composition cohérente et réactive.",level:"Débutant",minutes:16,
 files:{"index.html":'<main><span class="eyebrow">MES RÉALISATIONS</span><h1>Projets sélectionnés</h1><div class="grid">\n  <article><small>01 / WEB</small><h2>Projet A</h2><p>Un premier exemple.</p></article>\n  <article><small>02 / OUTIL</small><h2>Projet B</h2><p>Un outil pratique.</p></article>\n  <article><small>03 / CRÉATION</small><h2>Projet C</h2><p>Une idée originale.</p></article>\n</div></main>',
 "style.css":'body { font-family: system-ui; background: #0e1b20; color: white; margin: 0; padding: 36px; }\nmain { max-width: 1000px; margin: auto; }\nh1 { font-size: clamp(32px, 5vw, 62px); }\n.eyebrow, small { color: #c9ff79; }\n.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }\narticle { border: 1px solid #52676a; border-radius: 10px; padding: 26px; background: #17272c; }\n@media(max-width: 550px) { .grid { grid-template-columns: 1fr; } }'},
 entry:"index.html",skills:["CSS Grid","responsive","cartes"],
 guide:{mission:"Passe la grille à trois colonnes sur grand écran, tout en gardant une colonne sur mobile.",concept:"CSS Grid organise les éléments sur des colonnes. Une media query adapte la disposition aux dimensions d'affichage.",steps:["Repère grid-template-columns.","Utilise repeat(3, 1fr) pour trois colonnes.","Garde une colonne pour les petits écrans."],hint:"Modifie uniquement la déclaration grid-template-columns de .grid hors media query.",review:"Tu sais concevoir une grille qui s'adapte à l'écran.",pitfall:"Trois colonnes sur smartphone peuvent rendre le contenu trop petit."}},
 {id:"web-profile",track:"web",title:"Une page personnelle",description:"Créer une présentation claire avec des sections.",level:"Intermédiaire",minutes:22,
 files:{"index.html":'<header><a class="logo" href="#">MON STUDIO</a><nav><a href="#projets">Projets</a><a href="#contact">Contact</a></nav></header>\n<main><section class="intro"><span>CRÉATEUR INDÉPENDANT</span><h1>Je construis des idées utiles.</h1><p>Un site simple, lisible et personnel.</p></section><section id="projets"><h2>Mes projets</h2><p>Présente ici deux de tes réalisations.</p></section><section id="contact"><h2>Contact</h2><p>Ajoute une manière de te contacter, sans informations sensibles.</p></section></main>',
 "style.css":'body { margin: 0; font-family: system-ui; color: #172022; background: #fbf8ed; }\nheader { padding: 24px 7vw; display: flex; justify-content: space-between; border-bottom: 1px solid #cbd2ce; }\nnav { display: flex; gap: 16px; }\na { color: inherit; }\n.intro { padding: 12vh 7vw; background: #c9e8d2; }\nh1 { font-size: clamp(34px, 6vw, 76px); line-height: 1.1; max-width: 900px; }\nsection:not(.intro) { padding: 70px 7vw; }'},
 entry:"index.html",skills:["navigation","sections","accessibilité"],
 guide:{mission:"Personnalise la page puis complète les sections Projets et Contact sans divulguer de données privées.",concept:"Une page professionnelle combine une structure sémantique et une hiérarchie visuelle. La navigation par ancres mène vers les sections correspondantes.",steps:["Réécris la phrase principale.","Remplis la section Projets de contenus réels.","Vérifie que les liens de navigation pointent vers les bons identifiants."],hint:"Les liens href='#projets' doivent correspondre à id='projets' dans la page.",review:"Tu peux présenter un projet dans une structure cohérente.",pitfall:"N'affiche pas de secrets, tokens ou coordonnées personnelles sans y avoir réfléchi."}},
 {id:"web-dashboard",track:"web",title:"Mini-dashboard responsive",description:"Construire un petit tableau de bord lisible.",level:"Projet",minutes:28,
 files:{"index.html":'<header><strong>STATISTIQUES / LAB</strong><span>DEMO LOCALE</span></header><main><h1>Tableau de bord</h1><div class="metrics"><article><small>PROJETS</small><strong>04</strong></article><article><small>EXERCICES</small><strong>16</strong></article><article><small>OBJECTIFS</small><strong>08</strong></article></div><section><h2>Progression</h2><div class="bar"><span></span></div><p>Ces chiffres sont fictifs, pour apprendre la mise en page.</p></section></main>',
 "style.css":'body { margin: 0; font-family: system-ui; background: #101820; color: #eef5f3; }\nheader { display: flex; justify-content: space-between; padding: 20px 7vw; border-bottom: 1px solid #364953; }\nmain { max-width: 1000px; margin: auto; padding: 45px 24px; }\nh1 { font-size: clamp(32px, 6vw, 64px); }\n.metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }\narticle,section { padding: 24px; background: #1a2b32; border: 1px solid #385560; border-radius: 12px; }\narticle strong { display: block; font-size: 40px; }\nsmall { color: #b2f178; }\nsection { margin-top: 16px; }\n.bar { height: 14px; border-radius: 10px; background: #31414b; }\n.bar span { display: block; width: 48%; height: 100%; background: #b2f178; border-radius: 10px; }\n@media(max-width:600px) { .metrics { grid-template-columns: 1fr; } }'},
 entry:"index.html",skills:["grilles","design système","mobile"],
 guide:{mission:"Construis une quatrième carte et adapte le tableau de bord au petit écran.",concept:"Les interfaces de données demandent une hiérarchie lisible. Les valeurs doivent être présentées avec un libellé clair, et les éléments se réorganiser sur mobile.",steps:["Ajoute une carte dans .metrics.","Vérifie sa position sur un large écran.","Modifie les styles pour que les cartes restent lisibles sur téléphone."],hint:"Duplique un article et ajuste grid-template-columns si nécessaire.",review:"Tu peux étendre un composant réutilisable.",pitfall:"Ces valeurs sont des exemples, pas des données utilisateur réelles."}}
];
export const projects=[...cProjects,...jsProjects,...webProjects];
export const projectMap=Object.fromEntries(projects.map(p=>[p.id,p]));
export const courseStats=tracks.filter(t=>t.status==="ready").map(t=>({
 ...t,projects:projects.filter(p=>p.track===t.id).length
}));
export function getProject(id){return Object.hasOwn(projectMap,id)?projectMap[id]:null;}
export function getCCases(project,source){
 const l=project?.cLessonId?cById[project.cLessonId]:null;
 if(!l||typeof source!=="string")return [];
 return casesFor(l,source);
}
export function jsChecks(project){return project?.track==="js"?project.checks||[]:[];}
