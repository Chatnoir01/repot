/**
 * DEV/LAB — originale, standalone guided learning content.
 * No automatic progress is granted by knowledge questions. Only real C/JS tests
 * (or an explicitly manual HTML/CSS practice acknowledgement) mark completion.
 */
export const lessons={
 "c-hello":{
  story:"Un ordinateur ne devine pas tes intentions : il suit des instructions précises. Dans cette première mission, tu vas comprendre ce qui se passe entre le texte que tu écris et le message qui apparaît dans le terminal.",
  analogy:"Imagine une recette : le code est la recette écrite, le compilateur vérifie que ses instructions sont compréhensibles, puis le programme prépare le résultat.",
  walkthrough:[
   {code:"#include <stdio.h>",explain:"Cette ligne donne accès aux fonctions d'entrée/sortie standard du C, notamment printf. Elle prépare les outils dont le programme a besoin."},
   {code:"int main(void)",explain:"main est le point d'entrée : le programme commence son exécution ici. Les accolades qui suivent délimitent les instructions de cette fonction."},
   {code:'printf("Bonjour !\\n");',explain:"printf écrit du texte dans la console. \\n signifie retour à la ligne et le point-virgule termine l'instruction."}
  ],
  stages:[
   {title:"Observer",instruction:"Lis le programme initial. Repère main, printf et les guillemets qui encadrent le texte affiché."},
   {title:"Expérimenter",instruction:"Clique sur Exécuter, puis change uniquement le message entre les guillemets. Exécute une deuxième fois et compare."},
   {title:"Réussir",instruction:"Affiche précisément Bonjour DEVLAB ! puis clique sur Tester pour confronter la sortie au résultat demandé."}
  ],
  question:{prompt:"Que fait réellement printf dans ce programme ?",options:["Il vérifie les erreurs de syntaxe.","Il affiche du texte dans le terminal.","Il crée automatiquement un fichier."],correct:1,explanation:"printf affiche des données dans la sortie standard. C'est le compilateur qui vérifie la syntaxe ; printf n'écrit pas de fichier ici."},
  challenge:"Une fois ton test réussi, essaie d'afficher deux lignes avec deux appels à printf, puis reviens au résultat attendu pour valider."
 },
 "c-functions":{
  story:"Un programme devient plus utile quand il sait résoudre le même problème pour des valeurs différentes. La fonction doubler est ton premier outil réutilisable : elle ne doit pas connaître le nombre à l'avance.",
  analogy:"Une fonction ressemble à une machine avec une entrée et une sortie : tu lui donnes un nombre, elle réalise toujours la même transformation puis te rend le résultat.",
  walkthrough:[
   {code:"int doubler(int n)",explain:"Le premier int annonce le type du résultat ; int n indique que la fonction reçoit un nombre entier appelé n."},
   {code:"return n;",explain:"return termine la fonction et fournit une valeur au programme qui l'a appelée. Ici, renvoyer simplement n ne double rien."},
   {code:"doubler(4)",explain:"Appeler la fonction avec 4 transmet cette valeur à n. Une bonne fonction doit aussi marcher avec 0 ou un nombre négatif."}
  ],
  stages:[
   {title:"Observer",instruction:"Repère le paramètre n et l'instruction return dans la fonction. Explique à voix haute le rôle de chacun."},
   {title:"Expérimenter",instruction:"Exécute l'exemple, puis essaie une multiplication dans le return. Observe le nouveau résultat."},
   {title:"Réussir",instruction:"Retourne le double de n et lance les tests sur trois entrées différentes, y compris un nombre négatif."}
  ],
  question:{prompt:"Pourquoi tester doubler(-3) en plus de doubler(4) ?",options:["Pour vérifier que la fonction fonctionne avec d'autres entrées.","Parce qu'un compilateur exige un nombre négatif.","Pour afficher deux lignes de texte."],correct:0,explanation:"Tester plusieurs valeurs vérifie la règle générale de la fonction. Un seul exemple peut fonctionner par hasard ou grâce à une valeur écrite en dur."},
  challenge:"Après validation, imagine une fonction tripler(n). Quelle expression renverrais-tu, sans recopier la solution de doubler ?"
 },
 "c-budget":{
  story:"Cette mission ressemble à une vraie règle de boutique : un achat n'est possible que si la personne a assez d'argent ET si le produit est disponible. Tu vas traduire une phrase humaine en condition informatique.",
  analogy:"C'est comme passer deux portes : avoir suffisamment de budget ouvre la première, disposer du stock ouvre la seconde. Il faut franchir les deux.",
  walkthrough:[
   {code:"int achat_possible(int budget, int prix, int stock)",explain:"La fonction reçoit trois informations distinctes. Elle peut les comparer et renvoyer 1 pour vrai ou 0 pour faux."},
   {code:"if (budget >= prix)",explain:"Cette condition vérifie seulement le budget. Le code initial oublie encore le stock : ton travail est de compléter la règle."},
   {code:"return 1;",explain:"Renvoyer 1 signifie ici « achat autorisé ». Si la condition complète n'est pas satisfaite, la fonction doit renvoyer 0."}
  ],
  stages:[
   {title:"Observer",instruction:"Lis le cas du produit en rupture : budget = 50, prix = 35, stock = 0. Quel résultat devrait-on obtenir ?"},
   {title:"Expérimenter",instruction:"Repère l'opérateur >= puis ajoute la condition sur stock à l'aide de l'opérateur logique ET (&&)."},
   {title:"Réussir",instruction:"Vérifie les quatre scénarios du bouton Tester : budget insuffisant, rupture, budget exact et achat autorisé."}
  ],
  question:{prompt:"Quand budget = 50, prix = 35 et stock = 0, le résultat doit être…",options:["1, car le budget suffit.","0, car il n'y a aucun produit disponible.","1, car le prix est inférieur à 50."],correct:1,explanation:"Une condition avec ET (&&) est vraie uniquement si chaque partie est vraie. Ici le stock nul rend l'achat impossible malgré le budget suffisant."},
  challenge:"Après avoir réussi, essaie de formuler une troisième règle : que se passerait-il si la quantité demandée était supérieure au stock ?"
 },
 "c-arrays":{
  story:"Quand on doit additionner cent nombres, écrire cent opérations séparées serait fastidieux. Un tableau permet de regrouper ces valeurs, puis une boucle les parcourt quelle que soit la longueur de la collection.",
  analogy:"Un tableau est comme une rangée de casiers numérotés à partir de zéro. La boucle ouvre chaque casier et ajoute son contenu à un panier.",
  walkthrough:[
   {code:"int *tableau, int taille",explain:"La fonction reçoit une adresse vers le premier nombre et la taille à parcourir. La taille évite de deviner où s'arrête le tableau."},
   {code:"for (i = 0; i < taille; i++)",explain:"i commence à 0, augmente d'une unité et s'arrête avant taille. Le dernier indice valide est donc taille - 1."},
   {code:"total += 1;",explain:"Le code initial additionne toujours 1, même si la valeur du tableau vaut 9. Il faut utiliser l'élément correspondant à l'indice i."}
  ],
  stages:[
   {title:"Observer",instruction:"Repère le tableau, la variable i et l'accumulateur total. Le premier indice est-il 0 ou 1 ?"},
   {title:"Expérimenter",instruction:"Modifie l'addition dans la boucle pour qu'elle utilise la valeur située à tableau[i]."},
   {title:"Réussir",instruction:"Teste ta fonction sur trois tableaux différents, dont un avec des valeurs négatives."}
  ],
  question:{prompt:"Quel indice désigne le premier élément d'un tableau C ?",options:["1","0","taille"],correct:1,explanation:"En C, les indices commencent à 0. Pour un tableau de taille 3, on utilise les indices 0, 1 et 2 ; 3 serait hors limites."},
  challenge:"Une fois l'addition terminée, réfléchis : comment changerais-tu la boucle pour compter seulement les valeurs positives ?"
 },
 "js-first":{
  story:"JavaScript peut transformer des données à la volée. Dans ce premier atelier, tu vas apprendre la distinction essentielle entre afficher quelque chose et renvoyer un résultat qui pourra être réutilisé ailleurs.",
  analogy:"Une fonction est comme un service de calcul : on lui confie un nombre, elle le traite et remet la réponse. Afficher un reçu ne remplace pas la réponse elle-même.",
  walkthrough:[
   {code:"function doubler(n)",explain:"function définit une fonction. n est son paramètre : il prendra la valeur donnée lors de chaque appel."},
   {code:"return n;",explain:"return renvoie la valeur au code appelant. Pour doubler, l'expression de retour doit calculer quelque chose à partir de n."},
   {code:"console.log(doubler(4));",explain:"console.log affiche le résultat dans le terminal. Les tests, eux, appellent aussi ta fonction avec d'autres nombres."}
  ],
  stages:[
   {title:"Observer",instruction:"Lance le code initial et constate que doubler(4) ne donne pas encore le résultat attendu."},
   {title:"Expérimenter",instruction:"Change uniquement la valeur renvoyée par return, puis exécute pour observer ton nouveau résultat."},
   {title:"Réussir",instruction:"Teste la fonction avec plusieurs nombres : un positif, un négatif et zéro."}
  ],
  question:{prompt:"Que doit faire return dans la fonction doubler ?",options:["Écrire un texte dans la console.","Renvoyer une valeur utilisable par le programme.","Créer un nouvel onglet."],correct:1,explanation:"return fournit le résultat de la fonction. console.log sert à afficher ce résultat mais ne remplace pas sa valeur de retour."},
  challenge:"Écris ensuite une fonction calculerTriple(n) dans le même fichier et affiche son résultat sans modifier le nom doubler."
 },
 "js-access":{
  story:"Beaucoup de logiciels décident quoi faire selon des informations précises : âge, permissions ou solde. Ici, tu vas écrire une règle simple sans te perdre dans une suite de conditions contradictoires.",
  analogy:"Pense à un contrôle à l'entrée : le programme examine une condition, puis donne une réponse adaptée à la situation, et non une réponse identique à tout le monde.",
  walkthrough:[
   {code:"if (age >= 18)",explain:"La comparaison >= signifie supérieur ou égal. Elle inclut donc exactement 18 ans, contrairement à >."},
   {code:'return "autorisé";',explain:"Si la condition est vraie, la fonction renvoie immédiatement ce mot. Les instructions suivantes ne sont plus exécutées."},
   {code:'return "autorisé";',explain:"Dans le code de départ, la seconde réponse est identique. Pour gérer les mineurs, elle doit être différente."}
  ],
  stages:[
   {title:"Observer",instruction:"Lis la condition et explique ce qui se passe pour 15 ans, 18 ans et 30 ans."},
   {title:"Expérimenter",instruction:"Change le retour final pour distinguer l'âge inférieur à 18. Lance le code et observe la console."},
   {title:"Réussir",instruction:"Valide les trois seuils avec le bouton Tester ; en particulier, 18 ans doit être autorisé."}
  ],
  question:{prompt:"Quel opérateur inclut exactement la valeur 18 ?",options:[">",">=","<"],correct:1,explanation:"L'opérateur >= signifie « supérieur ou égal ». Il accepte 18, 19, 20, etc. L'opérateur > exclurait 18."},
  challenge:"Imagine la même fonction pour un contrôle de budget : la comparaison >= serait-elle encore utile ?"
 },
 "js-cart":{
  story:"Une boutique affiche le prix total d'un panier qui peut contenir zéro, un ou plusieurs articles. Tu vas créer une fonction qui parcourt les prix sans supposer à l'avance le nombre de produits.",
  analogy:"Imagine une caisse : tu démarres avec un total à zéro, puis tu ajoutes le prix de chaque produit jusqu'à ce qu'il n'en reste plus.",
  walkthrough:[
   {code:"let total = 0;",explain:"L'accumulateur part de zéro. Il va changer après chaque passage dans la boucle."},
   {code:"for (const prixUnitaire of prix)",explain:"for...of parcourt toutes les valeurs du tableau, une par une, sans avoir besoin de connaître sa longueur."},
   {code:"total += 1;",explain:"Ce code ajoute toujours 1, même pour un article à 10 €. La correction doit utiliser le montant de l'article courant."}
  ],
  stages:[
   {title:"Observer",instruction:"Exécute le projet initial : pourquoi le résultat vaut-il le nombre d'articles plutôt que leur somme ?"},
   {title:"Expérimenter",instruction:"Dans la boucle, ajoute le prixUnitaire au total. Relance pour comparer avec ton estimation."},
   {title:"Réussir",instruction:"Teste un panier vide, un article et plusieurs articles, dont un montant négatif."}
  ],
  question:{prompt:"Quel doit être le résultat pour un tableau de prix vide [] ?",options:["0","1","Une erreur"],correct:0,explanation:"Un panier vide ne contient aucune valeur à additionner. Comme total commence à 0 et que la boucle ne s'exécute pas, le résultat reste 0."},
  challenge:"Après validation, ajoute un deuxième exemple à console.log avec des prix différents et estime la sortie avant d'exécuter."
 },
 "js-scores":{
  story:"Un système de mentions doit traiter les scores aux frontières sans ambiguïté. Tu vas apprendre à écrire plusieurs conditions dans le bon ordre et à vérifier les valeurs limites.",
  analogy:"Imagine trois portes classées de la plus exigeante à la moins exigeante : on vérifie d'abord la note excellente, puis la réussite, puis le dernier cas.",
  walkthrough:[
   {code:'if (score >= 16) return "excellent";',explain:"La première condition traite les scores de 16 et plus. Avec return, la fonction s'arrête dès que ce cas est rencontré."},
   {code:'if (score >= 10)',explain:"Cette condition reçoit les scores d'au moins 10 qui n'ont pas déjà été traités par la première branche."},
   {code:'return "à revoir";',explain:"La dernière réponse couvre les scores restants, c'est-à-dire ceux inférieurs à 10."}
  ],
  stages:[
   {title:"Observer",instruction:"Prédis les mentions de 9, 10, 15 et 16 avant d'exécuter le programme."},
   {title:"Expérimenter",instruction:"Vérifie que la branche des scores à partir de 10 renvoie la bonne mention."},
   {title:"Réussir",instruction:"Teste les seuils exacts et les cas qui les encadrent : 10, 15 et 16."}
  ],
  question:{prompt:"Pourquoi placer score >= 16 avant score >= 10 ?",options:["Pour que les meilleurs scores soient traités avant les autres.","Pour économiser une variable.","Parce que JavaScript exige cet ordre."],correct:0,explanation:"Si la première branche renvoyait « réussi » dès 10, les scores de 16 ou plus n'atteindraient jamais « excellent ». L'ordre est logique, pas une obligation syntaxique."},
  challenge:"Ajoute une catégorie au-dessus de 18 pour explorer comment ordonner quatre conditions sans casser les précédentes."
 },
 "web-hero":{
  story:"Une page d'accueil réussie explique en quelques secondes ce que tu proposes et à qui tu t'adresses. Ici, tu vas apprendre à distinguer la structure HTML de la présentation CSS.",
  analogy:"HTML est le plan d'une maison : il définit les pièces. CSS représente la décoration, la lumière et la disposition des éléments.",
  walkthrough:[
   {code:"<h1>Une idée prend forme.</h1>",explain:"h1 est le titre principal de la page. Il indique aussi la hiérarchie du contenu, et pas seulement sa taille visuelle."},
   {code:".hero { min-height: 70vh; }",explain:"La classe hero est un espace de présentation. 70vh représente environ 70 % de la hauteur de la fenêtre."},
   {code:"background: #edf0e6;",explain:"background définit la couleur de fond. Une petite modification CSS peut transformer l'ambiance visuelle de toute la page."}
  ],
  stages:[
   {title:"Observer",instruction:"Ouvre index.html et trouve le titre principal. Passe ensuite à style.css et repère les couleurs."},
   {title:"Expérimenter",instruction:"Change le titre et une couleur de fond. Clique sur Aperçu pour voir immédiatement l'effet visuel."},
   {title:"Créer",instruction:"Transforme la page pour présenter une idée personnelle, puis vérifie la lisibilité avant de marquer l'atelier pratiqué."}
  ],
  question:{prompt:"Quelle technologie définit principalement l'apparence d'un élément ?",options:["HTML","CSS","Le nom du fichier"],correct:1,explanation:"HTML décrit la structure et le sens des éléments. CSS définit les propriétés visuelles telles que les couleurs, les espacements ou l'alignement."},
  challenge:"Essaie deux palettes différentes : laquelle crée le meilleur contraste entre le titre, le fond et le bouton ?"
 },
 "web-cards":{
  story:"Les portfolios et les vitrines de produits utilisent souvent des cartes. Une grille responsive doit répartir ces cartes harmonieusement sur écran large puis les réorganiser sur téléphone.",
  analogy:"C'est comme ranger des livres sur une étagère : avec beaucoup de place, tu peux former plusieurs colonnes ; avec une étagère étroite, tu les disposes autrement.",
  walkthrough:[
   {code:"<article>",explain:"article représente ici une carte de projet autonome. Les titres h2 à l'intérieur décrivent chaque réalisation."},
   {code:"grid-template-columns: repeat(2, 1fr);",explain:"Cette règle crée deux colonnes qui se partagent également l'espace disponible."},
   {code:"@media(max-width: 550px)",explain:"La media query applique d'autres règles CSS lorsque la fenêtre est étroite. Elle sert à préserver le confort sur mobile."}
  ],
  stages:[
   {title:"Observer",instruction:"Compare les cartes de l'aperçu avec le code HTML. Identifie quel élément forme une carte."},
   {title:"Expérimenter",instruction:"Dans le CSS de .grid, passe de deux colonnes à trois sur grand écran et actualise l'aperçu."},
   {title:"Créer",instruction:"Conserve une seule colonne sur petit écran, puis personnalise le contenu des trois cartes."}
  ],
  question:{prompt:"Quel est le rôle de @media(max-width: 550px) ?",options:["Exécuter une fonction JavaScript.","Modifier les styles lorsque l'écran devient étroit.","Ajouter automatiquement trois cartes."],correct:1,explanation:"Une media query conditionne des règles CSS selon les dimensions ou caractéristiques du support. Elle ne crée aucun élément HTML toute seule."},
  challenge:"Essaie de changer le gap de la grille et compare l'équilibre visuel avec les espaces intérieurs des cartes."
 },
 "web-profile":{
  story:"Une page personnelle doit guider le visiteur entre une présentation, des réalisations et un moyen de contact. Tu vas travailler sur une structure cohérente avant de chercher les effets décoratifs.",
  analogy:"Une navigation par ancres fonctionne comme le sommaire d'un livre : chaque lien conduit vers un chapitre clairement identifié.",
  walkthrough:[
   {code:'<a href="#projets">Projets</a>',explain:"Le symbole # indique un lien vers une section de la même page, repérée par un attribut id."},
   {code:'<section id="projets">',explain:"L'identifiant projets permet au lien correspondant de trouver cette section. Les deux valeurs doivent être identiques."},
   {code:"<h1>Je construis des idées utiles.</h1>",explain:"Le titre principal doit faire comprendre l'intention de la page. Un message clair vaut mieux qu'un slogan vague."}
  ],
  stages:[
   {title:"Observer",instruction:"Clique sur les liens Projets et Contact dans l'aperçu. Identifie les sections auxquelles ils correspondent."},
   {title:"Expérimenter",instruction:"Réécris le grand titre et la présentation avec une phrase simple, précise et personnelle."},
   {title:"Créer",instruction:"Ajoute au moins un projet réel et vérifie que chaque lien du menu mène à la bonne section."}
  ],
  question:{prompt:"À quoi doit correspondre href=\"#contact\" ?",options:['À une section id="contact".',"À un fichier contact.css.","À un nom de variable JavaScript."],correct:0,explanation:"Un lien avec href=\"#contact\" cherche un élément qui possède id=\"contact\" dans la même page. Si l'identifiant diffère, le lien ne mène pas à la bonne section."},
  challenge:"Ajoute une troisième entrée au menu et une section associée, puis vérifie le déplacement en cliquant sur le lien."
 },
 "web-dashboard":{
  story:"Un tableau de bord doit rendre des données compréhensibles. L'objectif n'est pas d'empiler des chiffres, mais de créer une hiérarchie visuelle qui fonctionne sur téléphone comme sur ordinateur.",
  analogy:"Pense au tableau de bord d'une voiture : chaque indicateur a un libellé, une importance et une place. Trop d'informations gênent la lecture.",
  walkthrough:[
   {code:'<div class="metrics">',explain:"Ce conteneur regroupe les cartes de métriques pour leur appliquer une même grille de présentation."},
   {code:"grid-template-columns: repeat(3, 1fr);",explain:"Cette règle CSS crée trois colonnes égales sur grand écran. Ajouter une carte peut demander de repenser leur répartition."},
   {code:"@media(max-width:600px)",explain:"Sur petit écran, le CSS prévoit une seule colonne afin que les métriques restent lisibles."}
  ],
  stages:[
   {title:"Observer",instruction:"Repère les trois indicateurs et explique la différence entre leur nombre et leur libellé."},
   {title:"Expérimenter",instruction:"Ajoute une quatrième carte HTML avec un nombre fictif clairement présenté comme exemple."},
   {title:"Créer",instruction:"Adapte la grille CSS et vérifie les espacements et l'ordre de lecture en vue mobile."}
  ],
  question:{prompt:"Quelle est la meilleure priorité pour un tableau de bord ?",options:["Animer tous les chiffres.","Rendre chaque mesure lisible et identifiable.","Utiliser le maximum de couleurs."],correct:1,explanation:"La priorité est de comprendre ce que représente chaque chiffre. Une hiérarchie claire et des libellés précis sont plus utiles qu'une accumulation d'effets graphiques."},
  challenge:"Construis une carte supplémentaire, puis compare deux dispositions possibles en réduisant la largeur de la fenêtre."
 }
};
export function getGuidedLesson(id){return Object.hasOwn(lessons,id)?lessons[id]:null;}
export function checkUnderstanding(id,answer){
 const lesson=getGuidedLesson(id);
 if(!lesson||!Number.isInteger(answer)||answer<0||answer>=lesson.question.options.length){
  return {correct:false,explanation:"Choisis une réponse parmi les propositions, puis consulte l'explication."};
 }
 return {correct:answer===lesson.question.correct,explanation:lesson.question.explanation};
}
export function learningStats(done,projects){
 const ids=new Set((projects||[]).map(x=>x.id));
 const completed=new Set((Array.isArray(done)?done:[]).filter(x=>ids.has(x))).size;
 const total=ids.size;
 return {completed,total,percent:total?Math.round(completed*100/total):0};
}
