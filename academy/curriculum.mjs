// DEV/LAB — original French curriculum. Every solution is verified with real C compilation.
export const modules=[
{id:"start",name:"01 — Fondamentaux",description:"Structure du programme, affichage, variables"},
{id:"logic",name:"02 — Logique & boucles",description:"Conditions, répétitions, limites"},
{id:"functions",name:"03 — Fonctions & tests",description:"Écrire du code réutilisable"},
{id:"project",name:"04 — Projet final",description:"Combiner plusieurs conditions"}
];
const program=code=>"#include <stdio.h>\n\nint main(void) {\n"+code+"\n    return 0;\n}\n";
export const lessons=[
{
id:"c01",module:"start",title:"Ton premier programme C",minutes:9,
objective:"Faire afficher exactement Bonjour DEVLAB !",
theory:"Un fichier .c contient du code source. Le compilateur vérifie sa syntaxe, le transforme en programme WebAssembly, puis nous exécutons ce programme. Ici, tout se déroule dans ton navigateur.",
principles:["#include <stdio.h> : donne accès à la déclaration de printf.","int main(void) : point d'entrée du programme.","printf écrit une chaîne dans la console ; chaque instruction se termine par un point-virgule."],
starter:program('    printf("Bonjour !\\n");'),
solution:program('    printf("Bonjour DEVLAB !\\n");'),
tests:[{label:"Affichage demandé",expected:"Bonjour DEVLAB !"}],
hint:"Change uniquement le texte entre les guillemets de printf.",
pitfall:"Si tu oublies un point-virgule ou un guillemet, le compilateur renvoie une erreur avant l'exécution.",
review:"Tu sais distinguer code source, compilation, exécution et sortie standard."
},{
id:"c02",module:"start",title:"Les variables entières",minutes:11,
objective:"Afficher Le resultat est 12 avec la variable resultat.",
theory:"En C, une variable a un type. int contient un entier. Pour l'afficher avec printf, on utilise %d puis on fournit la variable correspondante.",
principles:["int resultat = 12; déclare et initialise une variable.","%d est remplacé par l'entier passé à printf.","\\n signifie retour à la ligne."],
starter:program('    int resultat = 12;\n    printf("Le resultat est %d\\n", 0);'),
solution:program('    int resultat = 12;\n    printf("Le resultat est %d\\n", resultat);'),
tests:[{label:"Affichage formaté",expected:"Le resultat est 12"}],
hint:"Remplace le 0 après la virgule de printf par resultat.",
pitfall:"Écrire %d sans l'argument entier correspondant provoque un comportement incorrect.",
review:"Tu peux utiliser une variable dans une fonction d'affichage."
},{
id:"c03",module:"start",title:"Calculer au lieu de deviner",minutes:12,
objective:"Avec prix = 6 et quantite = 5, afficher 30.",
theory:"Les expressions utilisent les opérateurs arithmétiques. Le symbole * multiplie. Utiliser des variables plutôt qu'écrire directement 30 rend ton programme modifiable.",
principles:["Les opérateurs +, -, *, / manipulent les nombres.","Le nom d'une variable doit représenter son rôle.","Un résultat calculé peut être stocké dans une troisième variable."],
starter:program('    int prix = 6;\n    int quantite = 5;\n    int total = prix + quantite;\n    printf("%d\\n", total);'),
solution:program('    int prix = 6;\n    int quantite = 5;\n    int total = prix * quantite;\n    printf("%d\\n", total);'),
tests:[{label:"Calcul du total",expected:"30"}],
hint:"Le total est prix multiplié par quantite. Utilise *.",
pitfall:"Une variable conserve une valeur ; elle ne se met pas magiquement à jour quand une autre change.",
review:"Tu sais construire une expression arithmétique."
},{
id:"c04",module:"logic",title:"Prendre une décision avec if",minutes:13,
objective:"Pour age = 20, afficher Majeur.",
theory:"Une condition répond à une question dont la réponse est vraie ou fausse. if n'exécute son bloc que lorsque sa condition est vraie.",
principles:["age >= 18 veut dire âge supérieur ou égal à 18.","== sert à comparer des valeurs ; = sert à en affecter une.","Les accolades regroupent les instructions conditionnelles."],
starter:program('    int age = 20;\n    if (age < 18) {\n        printf("Majeur\\n");\n    }'),
solution:program('    int age = 20;\n    if (age >= 18) {\n        printf("Majeur\\n");\n    }'),
tests:[{label:"Condition majeure",expected:"Majeur"}],
hint:"L'opérateur recherché est >=.",
pitfall:"Les opérateurs < et > sont souvent inversés dans les premières conditions.",
review:"Tu sais relier un test logique à un comportement."
},{
id:"c05",module:"logic",title:"La boucle for",minutes:15,
objective:"Afficher 1, 2, 3, 4, un nombre par ligne.",
theory:"Une boucle for est composée d'une valeur initiale, d'une condition pour continuer et d'une mise à jour. Tu n'as pas besoin de recopier la même instruction quatre fois.",
principles:["L'initialisation définit le compteur.","La condition teste s'il faut continuer.","i++ augmente le compteur d'un."],
starter:program('    int i;\n    for (i = 1; i <= 3; i++) {\n        printf("%d\\n", i);\n    }'),
solution:program('    int i;\n    for (i = 1; i <= 4; i++) {\n        printf("%d\\n", i);\n    }'),
tests:[{label:"Compteur",expected:"1\n2\n3\n4"}],
hint:"La boucle doit s'arrêter quand i atteint 4 (inclus).",
pitfall:"i < 4 n'afficherait pas 4. C'est un classique des erreurs de borne.",
review:"Tu sais répéter une instruction sans la recopier."
},{
id:"c06",module:"logic",title:"La boucle while",minutes:15,
objective:"Afficher un compte à rebours : 3, 2, 1, GO.",
theory:"Une boucle while continue tant que sa condition reste vraie. Modifier la variable testée est souvent essentiel pour éviter une boucle sans fin.",
principles:["while (n > 0) teste avant chaque tour.","n-- enlève un à n.","Le code après la boucle s'exécute lorsqu'elle s'arrête."],
starter:program('    int n = 3;\n    while (n > 0) {\n        printf("%d\\n", n);\n        n++;\n    }\n    printf("GO\\n");'),
solution:program('    int n = 3;\n    while (n > 0) {\n        printf("%d\\n", n);\n        n--;\n    }\n    printf("GO\\n");'),
tests:[{label:"Compte à rebours",expected:"3\n2\n1\nGO"}],
hint:"Tu dois diminuer n au lieu de l'augmenter : n--.",
pitfall:"Une boucle qui ne termine jamais est arrêtée automatiquement par la limite de temps de l'atelier.",
review:"Tu sais expliquer comment une boucle prend fin."
},{
id:"c07",module:"functions",title:"Créer une fonction : doubler",minutes:17,
objective:"Écris doubler(n) qui renvoie deux fois n. Les tests essayeront plusieurs nombres.",
theory:"Une fonction reçoit des arguments et renvoie un résultat. Cette fois, l'atelier ajoute automatiquement une fonction main pour tester ton code, ce qui permet de vérifier différents nombres.",
principles:["int doubler(int n) reçoit un entier.","return renvoie une valeur.","Une solution correcte doit aussi fonctionner pour 0 et les nombres négatifs."],
starter:"int doubler(int n) {\n    return n;\n}\n",
solution:"int doubler(int n) {\n    return n * 2;\n}\n",
tests:[{label:"doubler(3)",expression:"doubler(3)",expected:"6"},{label:"doubler(0)",expression:"doubler(0)",expected:"0"},{label:"doubler(-5)",expression:"doubler(-5)",expected:"-10"}],
hint:"La fonction doit renvoyer n * 2.",
pitfall:"N'écris pas de main pour cet exercice : les tests l'ajoutent.",
review:"Tu sais créer une fonction réutilisable."
},{
id:"c08",module:"functions",title:"Pair ou impair ?",minutes:18,
objective:"Écris est_pair(n) qui renvoie 1 si n est pair, sinon 0.",
theory:"L'opérateur modulo % produit le reste d'une division. Un entier est pair lorsque le reste de sa division par 2 est égal à zéro.",
principles:["n % 2 calcule le reste de n divisé par 2.","n % 2 == 0 est vrai pour les nombres pairs.","0 est pair, de même que -4."],
starter:"int est_pair(int n) {\n    if (n % 2 == 1) {\n        return 1;\n    }\n    return 0;\n}\n",
solution:"int est_pair(int n) {\n    if (n % 2 == 0) {\n        return 1;\n    }\n    return 0;\n}\n",
tests:[{label:"est_pair(2)",expression:"est_pair(2)",expected:"1"},{label:"est_pair(9)",expression:"est_pair(9)",expected:"0"},{label:"est_pair(0)",expression:"est_pair(0)",expected:"1"},{label:"est_pair(-4)",expression:"est_pair(-4)",expected:"1"}],
hint:"La condition correcte compare le reste de la division par 2 à 0.",
pitfall:"Évite de ne tester que les valeurs positives.",
review:"Tu sais vérifier une propriété pour plusieurs arguments."
},{
id:"c09",module:"functions",title:"Additionner une série",minutes:20,
objective:"Renvoyer la somme 1 + 2 + ... + n avec somme_jusqua(n).",
theory:"Un accumulateur conserve un total. À chaque tour de boucle, tu ajoutes une valeur. Puis tu renvoies le résultat final.",
principles:["Commence avec total = 0.","La boucle va de 1 à n.","À chaque tour, total doit augmenter de i."],
starter:"int somme_jusqua(int n) {\n    int i;\n    int total = 0;\n    for (i = 1; i <= n; i++) {\n        total = total + 1;\n    }\n    return total;\n}\n",
solution:"int somme_jusqua(int n) {\n    int i;\n    int total = 0;\n    for (i = 1; i <= n; i++) {\n        total = total + i;\n    }\n    return total;\n}\n",
tests:[{label:"somme_jusqua(1)",expression:"somme_jusqua(1)",expected:"1"},{label:"somme_jusqua(5)",expression:"somme_jusqua(5)",expected:"15"},{label:"somme_jusqua(10)",expression:"somme_jusqua(10)",expected:"55"}],
hint:"Remplace total + 1 par total + i.",
pitfall:"N'affiche pas de valeur : cette fonction doit renvoyer le résultat.",
review:"Tu as combiné fonction, boucle et accumulateur."
},{
id:"c10",module:"project",title:"Mini-projet : gérer un achat",minutes:24,
objective:"Renvoyer 1 si budget >= prix ET stock > 0 ; 0 sinon.",
theory:"Un vrai programme combine plusieurs règles. Ici, deux conditions doivent être réunies : suffisamment d'argent ET au moins un article disponible. Les tests couvrent plusieurs situations.",
principles:["&& signifie ET : les deux expressions doivent être vraies.","budget >= prix teste si l'argent suffit.","stock > 0 teste la disponibilité réelle."],
starter:"int achat_possible(int budget, int prix, int stock) {\n    if (budget >= prix) {\n        return 1;\n    }\n    return 0;\n}\n",
solution:"int achat_possible(int budget, int prix, int stock) {\n    if (budget >= prix && stock > 0) {\n        return 1;\n    }\n    return 0;\n}\n",
tests:[{label:"Achat autorisé",expression:"achat_possible(50,35,2)",expected:"1"},{label:"Budget insuffisant",expression:"achat_possible(10,35,2)",expected:"0"},{label:"Rupture de stock",expression:"achat_possible(50,35,0)",expected:"0"},{label:"Montant exact",expression:"achat_possible(35,35,1)",expected:"1"}],
hint:"Ajoute && stock > 0 dans le if.",
pitfall:"Un budget suffisant ne garantit pas que le produit est en stock.",
review:"Tu as conçu une logique métier testée sur quatre scénarios."
}
];
export function casesFor(lesson,source){
 if(!lesson||typeof source!=="string")throw new Error("Leçon ou code manquant.");
 return lesson.tests.map(item=>{
  const append=item.expression?"\n#include <stdio.h>\nint main(void) {\n    printf(\"%d\\n\", "+item.expression+");\n    return 0;\n}\n":"";
  return {name:item.label,source:source+append,stdin:item.stdin||"",expected:item.expected};
 });
}
