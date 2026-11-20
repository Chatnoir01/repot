// DEV/LAB Campus · Fondations C : 18 leçons originales, module de pratique pédagogique.
// Les traces sont des illustrations préparées (pas un débogueur qui lit la mémoire réelle).
export const modules=[
  {
    "id": "discover",
    "title": "01 · Découvrir",
    "subtitle": "Écrire ses premières instructions",
    "icon": "✦"
  },
  {
    "id": "data",
    "title": "02 · Manipuler des données",
    "subtitle": "Variables et opérations",
    "icon": "▦"
  },
  {
    "id": "logic",
    "title": "03 · Raisonner",
    "subtitle": "Conditions et boucles",
    "icon": "◇"
  },
  {
    "id": "build",
    "title": "04 · Construire",
    "subtitle": "Fonctions et projet final",
    "icon": "⌘"
  }
];
export const lessons=[
  {
    "id": "f01",
    "module": "discover",
    "title": "Ton premier message",
    "goal": "Comprendre comment un vrai programme C écrit une ligne dans la console.",
    "concept": "Un programme est une suite d'instructions. En C, la fonction main indique où commence l'exécution. printf permet d'envoyer un message vers le terminal. Tu écris le texte, le compilateur vérifie le programme et le navigateur exécute le résultat.",
    "analogy": "Imagine une machine à écrire commandée par des instructions : printf lui dit précisément quelle phrase doit apparaître sur la feuille, ici le terminal.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Repère les guillemets après printf : ils entourent les caractères qui seront affichés, sans apparaître eux-mêmes."
      },
      {
        "title": "Essaie",
        "instruction": "Change le texte, clique sur Exécuter et compare ce qui apparaît avec ce que tu avais prévu."
      },
      {
        "title": "Résous",
        "instruction": "Fais afficher exactement Bonjour DEVLAB ! puis utilise Tester pour valider ton premier programme."
      }
    ],
    "trace": [
      {
        "caption": "Le programme démarre dans main.",
        "vars": {
          "phase": "main",
          "sortie": "(vide)"
        },
        "focus": "main"
      },
      {
        "caption": "printf envoie la chaîne au terminal.",
        "vars": {
          "instruction": "printf",
          "sortie": "Bonjour DEVLAB !"
        },
        "focus": "printf"
      }
    ],
    "prediction": {
      "question": "Dans quel endroit apparaît le texte envoyé par printf ?",
      "options": [
        "Dans le terminal du programme",
        "Dans un fichier créé automatiquement",
        "Dans la liste des variables"
      ],
      "correct": 0,
      "explanation": "printf écrit dans la sortie standard. Dans notre atelier, cette sortie est affichée dans le terminal sous l'éditeur."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    printf(\"Bonjour !\\n\");\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    printf(\"Bonjour DEVLAB !\\n\");\n    return 0;\n}\n",
    "tests": [
      {
        "label": "La phrase demandée",
        "expected": "Bonjour DEVLAB !"
      }
    ],
    "mistake": "Un guillemet oublié ou un point-virgule manquant empêche le programme de compiler.",
    "tip": "Le texte entre guillemets peut changer ; garde printf, les parenthèses et le point-virgule.",
    "mission": "Fais afficher exactement Bonjour DEVLAB ! puis utilise Tester pour valider ton premier programme.",
    "recap": "Tu viens d'exécuter une vraie instruction C et de lire sa sortie."
  },
  {
    "id": "f02",
    "module": "discover",
    "title": "Deux lignes, une histoire",
    "goal": "Utiliser le caractère spécial de retour à la ligne pour structurer une sortie.",
    "concept": "Dans une chaîne C, les caractères \\n sont interprétés comme un retour à la ligne. Deux appels à printf peuvent aussi écrire l'un après l'autre. La console n'ajoute pas de retour à la ligne toute seule ; c'est ton programme qui choisit.",
    "analogy": "Comme lorsque tu écris un texte et appuies sur Entrée : le curseur descend, mais la phrase précédente reste intacte.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Regarde la séquence \\n dans le code ; elle occupe deux caractères dans le fichier source."
      },
      {
        "title": "Essaie",
        "instruction": "Exécute le code initial, puis ajoute \\n entre les mots pour observer la différence."
      },
      {
        "title": "Résous",
        "instruction": "Affiche exactement deux lignes : Alpha sur la première et Beta sur la seconde."
      }
    ],
    "trace": [
      {
        "caption": "Avant printf, la sortie ne contient rien.",
        "vars": {
          "sortie": "(vide)",
          "instruction": "main"
        },
        "focus": "main"
      },
      {
        "caption": "Le premier message est écrit.",
        "vars": {
          "sortie": "Alpha",
          "curseur": "fin de ligne"
        },
        "focus": "printf"
      },
      {
        "caption": "Le caractère \\n fait passer à la ligne suivante.",
        "vars": {
          "sortie": "Alpha ↵ Beta",
          "lignes": "2"
        },
        "focus": "\\n"
      }
    ],
    "prediction": {
      "question": "Que signifie \\n à l'intérieur d'une chaîne C ?",
      "options": [
        "La lettre n s'affiche deux fois",
        "Un retour à la ligne",
        "La fin du programme"
      ],
      "correct": 1,
      "explanation": "Dans une chaîne de caractères C, \\n est une séquence d'échappement qui représente un saut de ligne."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    printf(\"Alpha Beta\\n\");\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    printf(\"Alpha\\nBeta\\n\");\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Deux lignes",
        "expected": "Alpha\nBeta"
      }
    ],
    "mistake": "Écrire les caractères \\n hors des guillemets n'est pas la même chose que les placer dans le message.",
    "tip": "Entre Alpha et Beta, écris \\n à l'intérieur des guillemets.",
    "mission": "Affiche exactement deux lignes : Alpha sur la première et Beta sur la seconde.",
    "recap": "Tu sais maintenant contrôler les lignes qui apparaissent dans le terminal."
  },
  {
    "id": "f03",
    "module": "discover",
    "title": "Une boîte appelée variable",
    "goal": "Créer une variable entière et afficher son contenu plutôt qu'un nombre écrit en dur.",
    "concept": "Une variable nommée age garde une valeur pendant l'exécution. Le type int sert à stocker des nombres entiers. Dans printf, %d est remplacé par l'entier fourni après la virgule. Changer la variable peut donc changer la sortie.",
    "analogy": "Imagine une boîte étiquetée « âge ». L'étiquette ne change pas, mais tu peux y déposer une autre valeur ; le programme lit son contenu.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Repère int age = 18 : int désigne le type, age est le nom, 18 la valeur initiale."
      },
      {
        "title": "Essaie",
        "instruction": "Remplace le 0 dans printf par la variable age et observe le message affiché."
      },
      {
        "title": "Résous",
        "instruction": "Le programme doit écrire Age : 18 en utilisant réellement la variable age."
      }
    ],
    "trace": [
      {
        "caption": "La déclaration crée la variable.",
        "vars": {
          "age": "(non créée)",
          "action": "déclaration"
        },
        "focus": "int"
      },
      {
        "caption": "L'initialisation dépose la valeur.",
        "vars": {
          "age": 18,
          "type": "int"
        },
        "focus": "age = 18"
      },
      {
        "caption": "printf récupère cette valeur.",
        "vars": {
          "age": 18,
          "sortie": "Age : 18"
        },
        "focus": "%d"
      }
    ],
    "prediction": {
      "question": "Quel rôle joue int dans « int age = 18; » ?",
      "options": [
        "Il affiche le nombre",
        "Il donne un type entier à la variable",
        "Il répète l'instruction"
      ],
      "correct": 1,
      "explanation": "Le mot-clé int indique que la variable age contient un entier. C'est printf qui se charge ensuite de l'afficher."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int age = 18;\n    printf(\"Age : %d\\n\", 0);\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int age = 18;\n    printf(\"Age : %d\\n\", age);\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Affichage de la variable",
        "expected": "Age : 18"
      }
    ],
    "mistake": "Écrire « age » entre guillemets afficherait le mot age, pas le nombre qui est stocké.",
    "tip": "Après le texte de printf, passe age comme argument à la place de 0.",
    "mission": "Le programme doit écrire Age : 18 en utilisant réellement la variable age.",
    "recap": "Tu peux déclarer une variable et transmettre sa valeur à une fonction."
  },
  {
    "id": "f04",
    "module": "discover",
    "title": "Les commentaires n'exécutent rien",
    "goal": "Faire la différence entre une instruction C et une ligne ignorée par le compilateur.",
    "concept": "Un commentaire commence par // et continue jusqu'à la fin de la ligne. Il est utile pour expliquer l'intention d'un programme, mais il ne produit pas d'action. Le compilateur ignore son contenu lors de l'exécution.",
    "analogy": "Une note au crayon sur une recette peut aider le cuisinier à comprendre les étapes, mais elle ne remplace pas les étapes elles-mêmes.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Lis le message après // : ce texte ressemble à du code, mais la ligne est désactivée."
      },
      {
        "title": "Essaie",
        "instruction": "Retire les // devant la ligne utile et commente la ligne qui affichait le mauvais message."
      },
      {
        "title": "Résous",
        "instruction": "Fais afficher Actif et aucun autre message dans le terminal."
      }
    ],
    "trace": [
      {
        "caption": "Un commentaire est présent.",
        "vars": {
          "ligne": "// printf(...)",
          "exécutée": "non"
        },
        "focus": "//"
      },
      {
        "caption": "La ligne active est exécutée.",
        "vars": {
          "instruction": "printf",
          "sortie": "Actif"
        },
        "focus": "printf"
      }
    ],
    "prediction": {
      "question": "Que fait le compilateur avec le texte après // ?",
      "options": [
        "Il l'affiche en premier",
        "Il l'ignore jusqu'à la fin de la ligne",
        "Il le transforme en variable"
      ],
      "correct": 1,
      "explanation": "En C, // introduit un commentaire de fin de ligne. Cette partie est destinée au lecteur, pas à l'exécution du programme."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    // printf(\"Actif\\n\");\n    printf(\"Inactif\\n\");\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    printf(\"Actif\\n\");\n    // printf(\"Inactif\\n\");\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Seule la bonne ligne",
        "expected": "Actif"
      }
    ],
    "mistake": "Des commentaires utiles décrivent le pourquoi ; ils ne doivent pas masquer des instructions nécessaires.",
    "tip": "Déplace le préfixe // de la première instruction vers la deuxième.",
    "mission": "Fais afficher Actif et aucun autre message dans le terminal.",
    "recap": "Tu différencies désormais les instructions exécutées des notes de lecture."
  },
  {
    "id": "f05",
    "module": "data",
    "title": "Deux nombres, un total",
    "goal": "Additionner deux variables et afficher le résultat d'un calcul.",
    "concept": "L'opérateur + additionne deux valeurs numériques. Une expression peut combiner plusieurs variables et son résultat peut être stocké dans une nouvelle variable. Le programme calcule alors plutôt que de répéter un résultat fixé.",
    "analogy": "Comme additionner deux prix sur une caisse : tu connais les articles individuellement, et le total est le résultat de l'opération.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Trouve les variables a, b et total ; le code initial retire les nombres au lieu de les additionner."
      },
      {
        "title": "Essaie",
        "instruction": "Remplace l'opérateur puis exécute pour comparer ton calcul mental et celui de la machine."
      },
      {
        "title": "Résous",
        "instruction": "Calcule et affiche 11 à partir de a = 4 et b = 7, sans écrire directement 11 dans printf."
      }
    ],
    "trace": [
      {
        "caption": "Les deux variables sont initialisées.",
        "vars": {
          "a": 4,
          "b": 7,
          "total": "?"
        },
        "focus": "int"
      },
      {
        "caption": "L'expression a + b est évaluée.",
        "vars": {
          "a": 4,
          "b": 7,
          "calcul": "4 + 7 = 11"
        },
        "focus": "+"
      },
      {
        "caption": "Le total est affiché.",
        "vars": {
          "total": 11,
          "sortie": "11"
        },
        "focus": "printf"
      }
    ],
    "prediction": {
      "question": "Si a vaut 4 et b vaut 7, combien vaut a + b ?",
      "options": [
        "3",
        "11",
        "47"
      ],
      "correct": 1,
      "explanation": "L'opérateur + additionne les nombres 4 et 7, ce qui donne 11. Il ne colle pas leurs chiffres comme du texte."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int a = 4;\n    int b = 7;\n    int total = a - b;\n    printf(\"%d\\n\", total);\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int a = 4;\n    int b = 7;\n    int total = a + b;\n    printf(\"%d\\n\", total);\n    return 0;\n}\n",
    "tests": [
      {
        "label": "L'addition",
        "expected": "11"
      }
    ],
    "mistake": "Dans un calcul C, - et + n'ont pas le même rôle. Regarde l'opérateur, pas uniquement les valeurs.",
    "tip": "La variable total doit recevoir a + b.",
    "mission": "Calcule et affiche 11 à partir de a = 4 et b = 7, sans écrire directement 11 dans printf.",
    "recap": "Tu sais produire un résultat calculé à partir de plusieurs données."
  },
  {
    "id": "f06",
    "module": "data",
    "title": "Le prix du panier",
    "goal": "Utiliser la multiplication pour calculer un montant variable.",
    "concept": "En C, * représente la multiplication. Quand un même produit apparaît en plusieurs exemplaires, son prix total est le prix unitaire multiplié par la quantité. Cela évite de recopier plusieurs fois la même addition.",
    "analogy": "Trois carnets à 7 euros chacun coûtent 7 + 7 + 7 euros ; une multiplication résume exactement cette répétition.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Vérifie les variables prix et quantite : l'une est un coût unitaire, l'autre un nombre d'articles."
      },
      {
        "title": "Essaie",
        "instruction": "Remplace l'addition par une multiplication, puis relance l'exécution."
      },
      {
        "title": "Résous",
        "instruction": "Affiche 21 en calculant le montant de trois articles à 7, sans fixer 21 directement."
      }
    ],
    "trace": [
      {
        "caption": "Les données sont connues.",
        "vars": {
          "prix": 7,
          "quantite": 3
        },
        "focus": "int"
      },
      {
        "caption": "Le prix est multiplié.",
        "vars": {
          "expression": "7 × 3",
          "total": 21
        },
        "focus": "*"
      },
      {
        "caption": "Le terminal reçoit le total.",
        "vars": {
          "sortie": "21",
          "unité": "euros"
        },
        "focus": "printf"
      }
    ],
    "prediction": {
      "question": "Quel symbole représente la multiplication en C ?",
      "options": [
        "x",
        "*",
        "^"
      ],
      "correct": 1,
      "explanation": "Le langage C utilise l'astérisque * pour multiplier. Le symbole x serait interprété comme un nom de variable."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int prix = 7;\n    int quantite = 3;\n    int total = prix + quantite;\n    printf(\"%d\\n\", total);\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int prix = 7;\n    int quantite = 3;\n    int total = prix * quantite;\n    printf(\"%d\\n\", total);\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Le total du panier",
        "expected": "21"
      }
    ],
    "mistake": "Le symbole ^ n'est pas une puissance en C : il réalise une opération binaire différente.",
    "tip": "Écris prix * quantite dans la définition du total.",
    "mission": "Affiche 21 en calculant le montant de trois articles à 7, sans fixer 21 directement.",
    "recap": "Tu viens de transformer une petite situation réelle en opération informatique."
  },
  {
    "id": "f07",
    "module": "data",
    "title": "Une division entière",
    "goal": "Comprendre qu'une division d'entiers ne conserve pas la partie décimale.",
    "concept": "Lorsque deux valeurs sont des entiers, la division / entre ces entiers produit un quotient entier : 9 / 2 vaut 4. La partie fractionnaire est écartée. Ce comportement est important pour les quantités, les indices et les compteurs.",
    "analogy": "Si tu ranges neuf objets dans des boîtes de deux, tu remplis quatre boîtes ; il reste un objet, mais ce n'est pas une cinquième boîte complète.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Repère les valeurs de la division et calcule le quotient entier avant d'exécuter."
      },
      {
        "title": "Essaie",
        "instruction": "Change le calcul initial pour une division entre les deux entiers puis observe la sortie."
      },
      {
        "title": "Résous",
        "instruction": "Affiche 4 comme résultat de 9 divisé par 2 avec les valeurs de type int."
      }
    ],
    "trace": [
      {
        "caption": "Le programme stocke deux entiers.",
        "vars": {
          "a": 9,
          "b": 2,
          "type": "int"
        },
        "focus": "int"
      },
      {
        "caption": "La division produit un quotient entier.",
        "vars": {
          "expression": "9 / 2",
          "quotient": 4,
          "reste": 1
        },
        "focus": "/"
      },
      {
        "caption": "printf affiche le quotient.",
        "vars": {
          "sortie": "4",
          "décimales": "aucune"
        },
        "focus": "printf"
      }
    ],
    "prediction": {
      "question": "Que donne 9 / 2 quand les deux opérandes sont des int C ?",
      "options": [
        "4",
        "4.5",
        "5"
      ],
      "correct": 0,
      "explanation": "La division entière produit 4 : la partie fractionnaire est supprimée. Avec des nombres flottants, le résultat serait différent."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int a = 9;\n    int b = 2;\n    int quotient = a + b;\n    printf(\"%d\\n\", quotient);\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int a = 9;\n    int b = 2;\n    int quotient = a / b;\n    printf(\"%d\\n\", quotient);\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Le quotient entier",
        "expected": "4"
      }
    ],
    "mistake": "Le résultat de 9 / 2 n'est pas 4.5 quand a et b sont tous deux des entiers.",
    "tip": "Utilise l'opérateur / à la place du +.",
    "mission": "Affiche 4 comme résultat de 9 divisé par 2 avec les valeurs de type int.",
    "recap": "Tu sais anticiper le résultat d'une division entière."
  },
  {
    "id": "f08",
    "module": "data",
    "title": "Une variable peut changer",
    "goal": "Modifier une valeur existante et observer son évolution dans le temps.",
    "concept": "Le signe = dans une affectation donne une nouvelle valeur à une variable. L'expression score = score + 3 lit l'ancienne valeur, ajoute 3, puis remplace le contenu de score. Elle ne signifie pas une égalité mathématique immuable.",
    "analogy": "Comme un compteur de points dans un jeu : le score augmente quand tu gagnes des points, mais le nom du compteur reste le même.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Note la valeur initiale score = 5 et repère l'instruction qui la modifie."
      },
      {
        "title": "Essaie",
        "instruction": "Exécute la version qui ajoute 1, puis essaie d'ajouter exactement 3."
      },
      {
        "title": "Résous",
        "instruction": "Affiche 8 après avoir augmenté le score initial de 5 de trois points."
      }
    ],
    "trace": [
      {
        "caption": "La variable reçoit sa valeur de départ.",
        "vars": {
          "score": 5,
          "étape": "initialisation"
        },
        "focus": "int"
      },
      {
        "caption": "Le calcul utilise l'ancienne valeur.",
        "vars": {
          "score": 5,
          "calcul": "5 + 3 = 8"
        },
        "focus": "+"
      },
      {
        "caption": "La nouvelle valeur remplace l'ancienne.",
        "vars": {
          "score": 8,
          "sortie": "8"
        },
        "focus": "="
      }
    ],
    "prediction": {
      "question": "Après score = 5 puis score = score + 3, quelle valeur reste en mémoire ?",
      "options": [
        "3",
        "5",
        "8"
      ],
      "correct": 2,
      "explanation": "L'affectation prend l'ancienne valeur 5, lui ajoute 3, puis stocke 8 à la place de 5."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int score = 5;\n    score = score + 1;\n    printf(\"%d\\n\", score);\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int score = 5;\n    score = score + 3;\n    printf(\"%d\\n\", score);\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Nouveau score",
        "expected": "8"
      }
    ],
    "mistake": "Le signe = sert ici à affecter une valeur, pas à poser une égalité mathématique.",
    "tip": "Remplace le + 1 par + 3 dans la mise à jour de score.",
    "mission": "Affiche 8 après avoir augmenté le score initial de 5 de trois points.",
    "recap": "Tu sais représenter comment une variable change pendant l'exécution."
  },
  {
    "id": "f09",
    "module": "data",
    "title": "Le reste d'une division",
    "goal": "Utiliser le modulo pour connaître le reste d'une division entière.",
    "concept": "L'opérateur % calcule le reste après une division entre entiers. Par exemple, 10 divisé par 3 donne trois groupes complets et un objet restant : 10 % 3 vaut 1. Le modulo sera utile pour reconnaître les nombres pairs.",
    "analogy": "Imagine dix biscuits distribués à trois personnes en quantités égales : chacune en reçoit trois, et un biscuit reste sur la table.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Repère l'opérateur du code initial et rappelle-toi la différence entre quotient et reste."
      },
      {
        "title": "Essaie",
        "instruction": "Remplace la division par le modulo, puis compare le résultat annoncé et celui du terminal."
      },
      {
        "title": "Résous",
        "instruction": "Calcule et affiche le reste de 10 divisé par 3, soit 1."
      }
    ],
    "trace": [
      {
        "caption": "Deux entiers sont connus.",
        "vars": {
          "nombre": 10,
          "diviseur": 3
        },
        "focus": "int"
      },
      {
        "caption": "Trois groupes de trois sont formés.",
        "vars": {
          "groupes": 3,
          "reste": 1
        },
        "focus": "%"
      },
      {
        "caption": "Le programme écrit le reste.",
        "vars": {
          "sortie": "1",
          "calcul": "10 % 3"
        },
        "focus": "printf"
      }
    ],
    "prediction": {
      "question": "Combien vaut 10 % 3 en C ?",
      "options": [
        "3",
        "1",
        "0"
      ],
      "correct": 1,
      "explanation": "10 % 3 représente le reste de la division euclidienne : trois groupes de trois font neuf, et un reste."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int nombre = 10;\n    int reste = nombre / 3;\n    printf(\"%d\\n\", reste);\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int nombre = 10;\n    int reste = nombre % 3;\n    printf(\"%d\\n\", reste);\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Le reste",
        "expected": "1"
      }
    ],
    "mistake": "Ne confonds pas / qui calcule un quotient avec % qui calcule un reste.",
    "tip": "Remplace l'opérateur / par %.",
    "mission": "Calcule et affiche le reste de 10 divisé par 3, soit 1.",
    "recap": "Tu sais maintenant distinguer division entière et modulo."
  },
  {
    "id": "f10",
    "module": "logic",
    "title": "Décider avec if",
    "goal": "Afficher un message uniquement si une condition d'âge est remplie.",
    "concept": "Une condition if exécute un bloc seulement lorsque son expression est vraie. Pour l'âge légal, age >= 18 inclut précisément 18 ans. Si la condition est fausse et qu'aucun else n'existe, le bloc est simplement ignoré.",
    "analogy": "Une porte s'ouvre si une condition est remplie. Le programme doit vérifier le critère avant de décider d'exécuter l'instruction.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Repère l'opérateur < dans la condition initiale et vérifie ce qu'il dit pour 20 ans."
      },
      {
        "title": "Essaie",
        "instruction": "Remplace la comparaison pour accepter les personnes d'au moins 18 ans."
      },
      {
        "title": "Résous",
        "instruction": "Affiche Acces autorise pour age = 20 en corrigeant la condition du if."
      }
    ],
    "trace": [
      {
        "caption": "La variable est définie.",
        "vars": {
          "age": 20,
          "seuil": 18
        },
        "focus": "int"
      },
      {
        "caption": "La condition est évaluée.",
        "vars": {
          "test": "20 >= 18",
          "résultat": "vrai"
        },
        "focus": "if"
      },
      {
        "caption": "Le bloc autorisé s'exécute.",
        "vars": {
          "sortie": "Acces autorise",
          "branche": "if"
        },
        "focus": "printf"
      }
    ],
    "prediction": {
      "question": "Que signifie age >= 18 ?",
      "options": [
        "Age strictement inférieur à 18",
        "Age supérieur ou égal à 18",
        "Age égal à 18 uniquement"
      ],
      "correct": 1,
      "explanation": "L'opérateur >= accepte exactement 18 et toutes les valeurs plus grandes. Il ne faut pas le confondre avec >."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int age = 20;\n    if (age < 18) {\n        printf(\"Acces autorise\\n\");\n    }\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int age = 20;\n    if (age >= 18) {\n        printf(\"Acces autorise\\n\");\n    }\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Contrôle d'âge",
        "expected": "Acces autorise"
      }
    ],
    "mistake": "Une condition inversée peut bloquer les personnes autorisées ou laisser passer les autres.",
    "tip": "Une personne de 20 ans satisfait age >= 18.",
    "mission": "Affiche Acces autorise pour age = 20 en corrigeant la condition du if.",
    "recap": "Tu sais faire exécuter un bloc seulement lorsque sa condition est vraie."
  },
  {
    "id": "f11",
    "module": "logic",
    "title": "Le deuxième chemin : else",
    "goal": "Choisir un message différent quand une condition est fausse.",
    "concept": "if / else représente deux chemins exclusifs : si la condition est vraie, le premier bloc s'exécute ; sinon, le second. Pour age = 15, le message correct se trouve dans la branche else. Une seule branche est exécutée.",
    "analogy": "Comme un carrefour avec deux directions : on choisit une route selon la règle, jamais les deux en même temps.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Lis les deux messages du programme initial : ils sont identiques, ce qui empêche de distinguer les situations."
      },
      {
        "title": "Essaie",
        "instruction": "Modifie le message de la branche else puis observe le résultat pour age = 15."
      },
      {
        "title": "Résous",
        "instruction": "Affiche Mineur pour une personne de 15 ans, sans afficher Majeur."
      }
    ],
    "trace": [
      {
        "caption": "La donnée d'entrée est connue.",
        "vars": {
          "age": 15,
          "seuil": 18
        },
        "focus": "int"
      },
      {
        "caption": "Le if est évalué.",
        "vars": {
          "test": "15 >= 18",
          "résultat": "faux"
        },
        "focus": "if"
      },
      {
        "caption": "La branche else est choisie.",
        "vars": {
          "sortie": "Mineur",
          "branche": "else"
        },
        "focus": "else"
      }
    ],
    "prediction": {
      "question": "Si la condition du if est fausse, quelle partie s'exécute ?",
      "options": [
        "Le bloc else",
        "Les deux blocs",
        "Aucun programme C ne peut continuer"
      ],
      "correct": 0,
      "explanation": "Quand if est faux et qu'un else existe, c'est son bloc qui s'exécute. Le bloc du if n'est pas exécuté."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int age = 15;\n    if (age >= 18) {\n        printf(\"Majeur\\n\");\n    } else {\n        printf(\"Majeur\\n\");\n    }\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int age = 15;\n    if (age >= 18) {\n        printf(\"Majeur\\n\");\n    } else {\n        printf(\"Mineur\\n\");\n    }\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Branche mineur",
        "expected": "Mineur"
      }
    ],
    "mistake": "Écrire le même message dans les deux blocs rend la condition inutile.",
    "tip": "Seul le message après else doit changer.",
    "mission": "Affiche Mineur pour une personne de 15 ans, sans afficher Majeur.",
    "recap": "Tu sais décrire et utiliser deux branches exclusives."
  },
  {
    "id": "f12",
    "module": "logic",
    "title": "Deux conditions avec ET",
    "goal": "Autoriser un achat seulement lorsque le budget et le stock le permettent.",
    "concept": "L'opérateur && signifie ET logique. Les deux conditions doivent être vraies pour que le bloc soit exécuté. Avoir assez de budget ne suffit pas si le stock est nul. C'est une règle qui apparaît réellement dans les commandes et les réservations.",
    "analogy": "Imagine deux vérifications successives à la caisse : portefeuille suffisant et article disponible. Une seule vérification réussie ne suffit pas.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Repère la condition initiale : elle examine le budget mais oublie le stock."
      },
      {
        "title": "Essaie",
        "instruction": "Complète le if avec && stock > 0 puis exécute le programme."
      },
      {
        "title": "Résous",
        "instruction": "Affiche Refuse quand budget = 30, prix = 20 et stock = 0."
      }
    ],
    "trace": [
      {
        "caption": "Les données sont chargées.",
        "vars": {
          "budget": 30,
          "prix": 20,
          "stock": 0
        },
        "focus": "int"
      },
      {
        "caption": "Le budget est suffisant.",
        "vars": {
          "test": "30 >= 20",
          "résultat": "vrai"
        },
        "focus": "budget"
      },
      {
        "caption": "Le stock est nul : l'ET échoue.",
        "vars": {
          "test": "stock > 0",
          "résultat": "faux",
          "sortie": "Refuse"
        },
        "focus": "&&"
      }
    ],
    "prediction": {
      "question": "Si le budget suffit mais que stock vaut 0, le résultat du ET est…",
      "options": [
        "vrai",
        "faux",
        "toujours indéfini"
      ],
      "correct": 1,
      "explanation": "L'opérateur && ne renvoie vrai que si les deux conditions sont vraies. Une rupture de stock rend l'achat impossible."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int budget = 30, prix = 20, stock = 0;\n    if (budget >= prix) {\n        printf(\"Accepte\\n\");\n    } else {\n        printf(\"Refuse\\n\");\n    }\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int budget = 30, prix = 20, stock = 0;\n    if (budget >= prix && stock > 0) {\n        printf(\"Accepte\\n\");\n    } else {\n        printf(\"Refuse\\n\");\n    }\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Rupture de stock",
        "expected": "Refuse"
      }
    ],
    "mistake": "Une règle métier qui ne vérifie qu'un critère peut donner un résultat pourtant incorrect.",
    "tip": "Ajoute && stock > 0 à la condition existante.",
    "mission": "Affiche Refuse quand budget = 30, prix = 20 et stock = 0.",
    "recap": "Tu sais relier deux conditions obligatoires avec ET."
  },
  {
    "id": "f13",
    "module": "logic",
    "title": "Une alternative avec OU",
    "goal": "Déclencher une action quand au moins une des deux conditions est vraie.",
    "concept": "L'opérateur || signifie OU logique. Il suffit qu'une seule condition soit vraie. Pour reconnaître un week-end, le jour est samedi OU dimanche. Le symbole || est différent de && qui exige les deux conditions.",
    "analogy": "Comme deux portes donnant accès à la même salle : tu peux entrer par la première ou par la deuxième, sans devoir traverser les deux.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Repère le test jour == 6 : il accepte samedi mais pas dimanche."
      },
      {
        "title": "Essaie",
        "instruction": "Ajoute la possibilité du jour 7 avec le OU logique."
      },
      {
        "title": "Résous",
        "instruction": "Affiche Weekend pour jour = 7 en reconnaissant samedi OU dimanche."
      }
    ],
    "trace": [
      {
        "caption": "La valeur du jour est connue.",
        "vars": {
          "jour": 7,
          "samedi": 6,
          "dimanche": 7
        },
        "focus": "int"
      },
      {
        "caption": "Samedi ? Non.",
        "vars": {
          "test": "7 == 6",
          "résultat": "faux"
        },
        "focus": "=="
      },
      {
        "caption": "Dimanche ? Oui : le OU réussit.",
        "vars": {
          "test": "7 == 7",
          "résultat": "vrai",
          "sortie": "Weekend"
        },
        "focus": "||"
      }
    ],
    "prediction": {
      "question": "Dans une condition A || B, combien de parties doivent être vraies au minimum ?",
      "options": [
        "Une",
        "Deux",
        "Aucune"
      ],
      "correct": 0,
      "explanation": "Le OU logique vaut vrai si au moins une des conditions est vraie. Les deux peuvent aussi être vraies."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int jour = 7;\n    if (jour == 6) {\n        printf(\"Weekend\\n\");\n    } else {\n        printf(\"Semaine\\n\");\n    }\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int jour = 7;\n    if (jour == 6 || jour == 7) {\n        printf(\"Weekend\\n\");\n    } else {\n        printf(\"Semaine\\n\");\n    }\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Détecter le week-end",
        "expected": "Weekend"
      }
    ],
    "mistake": "Le symbole | seul n'est pas l'opérateur OU logique ; utilise bien ||.",
    "tip": "Ajoute || jour == 7 après la première comparaison.",
    "mission": "Affiche Weekend pour jour = 7 en reconnaissant samedi OU dimanche.",
    "recap": "Tu sais détecter plusieurs situations acceptables avec OU."
  },
  {
    "id": "f14",
    "module": "logic",
    "title": "Répéter sans recopier : for",
    "goal": "Afficher quatre nombres successifs grâce à une seule boucle.",
    "concept": "Une boucle for répète un bloc. Elle indique généralement le point de départ d'un compteur, une condition pour continuer et une mise à jour. i++ augmente i après chaque tour. La condition <= 4 permet d'afficher le dernier nombre.",
    "analogy": "Un entraîneur demande quatre répétitions : tu comptes 1, 2, 3, 4 au lieu de répéter quatre instructions différentes.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Trouve les trois parties de for : i = 1, i <= 3 et i++."
      },
      {
        "title": "Essaie",
        "instruction": "Change la condition d'arrêt pour afficher un tour supplémentaire."
      },
      {
        "title": "Résous",
        "instruction": "Affiche 1, puis 2, puis 3, puis 4, chaque nombre sur sa ligne."
      }
    ],
    "trace": [
      {
        "caption": "La boucle démarre.",
        "vars": {
          "i": 1,
          "condition": "1 <= 4"
        },
        "focus": "for"
      },
      {
        "caption": "Après deux tours.",
        "vars": {
          "i": 3,
          "sortie": "1 ↵ 2"
        },
        "focus": "i++"
      },
      {
        "caption": "Le dernier tour affiche 4.",
        "vars": {
          "i": 4,
          "sortie": "1 ↵ 2 ↵ 3 ↵ 4"
        },
        "focus": "printf"
      }
    ],
    "prediction": {
      "question": "Avec for(i=1; i<=4; i++), combien de tours sont exécutés ?",
      "options": [
        "3",
        "4",
        "5"
      ],
      "correct": 1,
      "explanation": "Le compteur prend les valeurs 1, 2, 3 et 4. Au tour suivant, i vaut 5 et la condition i <= 4 devient fausse."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int i;\n    for (i = 1; i <= 3; i++) {\n        printf(\"%d\\n\", i);\n    }\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int i;\n    for (i = 1; i <= 4; i++) {\n        printf(\"%d\\n\", i);\n    }\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Quatre tours",
        "expected": "1\n2\n3\n4"
      }
    ],
    "mistake": "Une erreur de borne (i < 4 plutôt que i <= 4) donne souvent un tour de moins.",
    "tip": "Dans la condition de la boucle, remplace 3 par 4.",
    "mission": "Affiche 1, puis 2, puis 3, puis 4, chaque nombre sur sa ligne.",
    "recap": "Tu sais expliquer le compteur et la fin d'une boucle for."
  },
  {
    "id": "f15",
    "module": "logic",
    "title": "Un compte à rebours avec while",
    "goal": "Faire évoluer une variable jusqu'à ce que la condition de répétition devienne fausse.",
    "concept": "while recommence son bloc tant que la condition reste vraie. Si la variable testée ne change pas dans le bon sens, la boucle risque de ne jamais s'arrêter. Ici, n doit diminuer de 3 vers 0.",
    "analogy": "Un minuteur compte à rebours : 3, 2, 1, puis s'arrête. Si le compteur augmentait, le signal n'arriverait jamais.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Repère while (n > 0) et la ligne n++ : que va-t-il se passer lorsque n augmente ?"
      },
      {
        "title": "Essaie",
        "instruction": "Remplace l'incrément par une décrémentation. L'exécution dispose d'une limite pour interrompre les boucles infinies."
      },
      {
        "title": "Résous",
        "instruction": "Affiche 3, 2, 1 puis GO après l'arrêt de la boucle."
      }
    ],
    "trace": [
      {
        "caption": "La boucle commence.",
        "vars": {
          "n": 3,
          "condition": "3 > 0"
        },
        "focus": "while"
      },
      {
        "caption": "Après deux décrémentations.",
        "vars": {
          "n": 1,
          "sortie": "3 ↵ 2"
        },
        "focus": "n--"
      },
      {
        "caption": "n devient 0, la boucle s'arrête.",
        "vars": {
          "n": 0,
          "sortie": "3 ↵ 2 ↵ 1 ↵ GO"
        },
        "focus": "printf"
      }
    ],
    "prediction": {
      "question": "Pourquoi remplacer n++ par n-- dans ce programme ?",
      "options": [
        "Pour agrandir le nombre à chaque tour",
        "Pour permettre à n d'atteindre 0 et d'arrêter la boucle",
        "Pour supprimer la condition while"
      ],
      "correct": 1,
      "explanation": "En retirant 1 à n à chaque tour, on finit par obtenir n = 0. La condition n > 0 devient alors fausse."
    },
    "starter": "#include <stdio.h>\n\nint main(void) {\n    int n = 3;\n    while (n > 0) {\n        printf(\"%d\\n\", n);\n        n++;\n    }\n    printf(\"GO\\n\");\n    return 0;\n}\n",
    "solution": "#include <stdio.h>\n\nint main(void) {\n    int n = 3;\n    while (n > 0) {\n        printf(\"%d\\n\", n);\n        n--;\n    }\n    printf(\"GO\\n\");\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Compte à rebours",
        "expected": "3\n2\n1\nGO"
      }
    ],
    "mistake": "Une variable de boucle qui évolue à l'envers provoque souvent une boucle infinie.",
    "tip": "Tu dois utiliser n-- et non n++.",
    "mission": "Affiche 3, 2, 1 puis GO après l'arrêt de la boucle.",
    "recap": "Tu sais reconnaître et corriger une boucle dont la condition d'arrêt n'est jamais atteinte."
  },
  {
    "id": "f16",
    "module": "build",
    "title": "Une fonction vraiment réutilisable",
    "goal": "Construire une fonction qui double n'importe quel entier, pas seulement le chiffre de l'exemple.",
    "concept": "Une fonction prend des paramètres et renvoie un résultat avec return. Le nom doubler indique son intention ; le corps doit calculer deux fois la valeur de n. Les tests appelleront réellement ta fonction avec plusieurs entrées différentes.",
    "analogy": "Une fonction est une petite machine : on y insère un nombre, on applique une règle toujours identique et on récupère la réponse.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Trouve la fonction doubler et le paramètre n : le code initial renvoie n sans le modifier."
      },
      {
        "title": "Essaie",
        "instruction": "Remplace l'expression renvoyée et exécute : le studio ajoute automatiquement un main temporaire pour appeler la fonction."
      },
      {
        "title": "Résous",
        "instruction": "Fais réussir tous les tests de doubler(n), y compris avec zéro et un nombre négatif."
      }
    ],
    "trace": [
      {
        "caption": "Un appel transmet un argument.",
        "vars": {
          "appel": "doubler(4)",
          "n": 4
        },
        "focus": "paramètre"
      },
      {
        "caption": "La multiplication est calculée.",
        "vars": {
          "calcul": "4 × 2",
          "résultat": 8
        },
        "focus": "return"
      },
      {
        "caption": "Un autre appel réutilise la même fonction.",
        "vars": {
          "appel": "doubler(-3)",
          "résultat": -6
        },
        "focus": "doubler"
      }
    ],
    "prediction": {
      "question": "Pourquoi teste-t-on la fonction avec plusieurs nombres ?",
      "options": [
        "Parce qu'une réponse fixe peut marcher sur un exemple mais pas sur les autres",
        "Parce que printf exige trois nombres",
        "Pour ralentir l'exécution"
      ],
      "correct": 0,
      "explanation": "Des entrées variées obligent la fonction à appliquer la règle générale au lieu de fournir une réponse écrite en dur."
    },
    "starter": "int doubler(int n) {\n    return n;\n}\n",
    "solution": "int doubler(int n) {\n    return n * 2;\n}\n",
    "tests": [
      {
        "label": "Valeur positive",
        "expression": "doubler(4)",
        "expected": "8"
      },
      {
        "label": "Zéro",
        "expression": "doubler(0)",
        "expected": "0"
      },
      {
        "label": "Négatif",
        "expression": "doubler(-3)",
        "expected": "-6"
      },
      {
        "label": "Autre entier",
        "expression": "doubler(11)",
        "expected": "22"
      }
    ],
    "mistake": "Une fonction qui renvoie 8 tout le temps échouera avec les entrées zéro et négatives.",
    "tip": "Le return doit calculer n * 2.",
    "mission": "Fais réussir tous les tests de doubler(n), y compris avec zéro et un nombre négatif.",
    "recap": "Tu as écrit une fonction réutilisable, vérifiée par plusieurs appels réels."
  },
  {
    "id": "f17",
    "module": "build",
    "title": "Pair ou impair ?",
    "goal": "Reconnaître des nombres pairs grâce au reste de la division et à une fonction.",
    "concept": "Un entier est pair lorsque le reste de sa division par 2 vaut zéro. L'opérateur % calcule ce reste. Dans cette mission, la fonction doit renvoyer 1 pour un nombre pair et 0 sinon, y compris pour zéro et les négatifs.",
    "analogy": "Si tu regroupes des objets deux par deux et qu'aucun objet ne reste, leur nombre est pair : c'est précisément ce que teste le modulo.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Lis la condition initiale n % 2 == 1 : est-elle correcte pour un nombre pair négatif ?"
      },
      {
        "title": "Essaie",
        "instruction": "Remplace la condition et vérifie un nombre pair ainsi qu'un nombre impair."
      },
      {
        "title": "Résous",
        "instruction": "Fais réussir les tests de la fonction est_pair avec 2, 9, 0 et -4."
      }
    ],
    "trace": [
      {
        "caption": "On reçoit un nombre.",
        "vars": {
          "n": 2
        },
        "focus": "paramètre"
      },
      {
        "caption": "Le reste de 2 / 2 vaut zéro.",
        "vars": {
          "test": "2 % 2 == 0",
          "résultat": "vrai"
        },
        "focus": "%"
      },
      {
        "caption": "Un nombre impair donne un autre résultat.",
        "vars": {
          "appel": "est_pair(9)",
          "retour": 0
        },
        "focus": "return"
      }
    ],
    "prediction": {
      "question": "Quel est le résultat attendu de est_pair(0) ?",
      "options": [
        "1, car zéro est pair",
        "0, car zéro n'est ni pair ni impair",
        "Une erreur de calcul"
      ],
      "correct": 0,
      "explanation": "Zéro est divisible par 2 sans reste. Il est donc pair, et la fonction doit renvoyer 1."
    },
    "starter": "int est_pair(int n) {\n    if (n % 2 == 1) {\n        return 1;\n    }\n    return 0;\n}\n",
    "solution": "int est_pair(int n) {\n    if (n % 2 == 0) {\n        return 1;\n    }\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Deux",
        "expression": "est_pair(2)",
        "expected": "1"
      },
      {
        "label": "Neuf",
        "expression": "est_pair(9)",
        "expected": "0"
      },
      {
        "label": "Zéro",
        "expression": "est_pair(0)",
        "expected": "1"
      },
      {
        "label": "Négatif pair",
        "expression": "est_pair(-4)",
        "expected": "1"
      }
    ],
    "mistake": "Tester n % 2 == 1 n'identifie pas correctement tous les entiers pairs.",
    "tip": "Compare le reste à zéro : n % 2 == 0.",
    "mission": "Fais réussir les tests de la fonction est_pair avec 2, 9, 0 et -4.",
    "recap": "Tu sais transformer une propriété mathématique en fonction testable."
  },
  {
    "id": "f18",
    "module": "build",
    "title": "Projet final : le panier fiable",
    "goal": "Combiner des comparaisons et une fonction pour décider si une commande peut être acceptée.",
    "concept": "Ton mini-programme représente une règle métier crédible. Pour accepter une commande, deux conditions sont nécessaires : le budget doit couvrir le prix et le stock doit être positif. Une fonction prend ces trois données et renvoie 1 ou 0. Plusieurs scénarios contrôlent ton raisonnement.",
    "analogy": "Tu joues le rôle du moteur d'un commerce : avant d'autoriser un achat, il faut vérifier à la fois le portefeuille et la disponibilité.",
    "steps": [
      {
        "title": "Observe",
        "instruction": "Commence avec trois scénarios : assez d'argent avec du stock, manque d'argent, rupture de stock. Quelles réponses attends-tu ?"
      },
      {
        "title": "Essaie",
        "instruction": "Le code vérifie déjà le budget, mais oublie le stock. Complète la condition avec le ET logique."
      },
      {
        "title": "Résous",
        "instruction": "Valide cinq scénarios, notamment le budget exactement égal au prix et le stock nul. C'est ton premier mini-projet vérifié par le vrai compilateur."
      }
    ],
    "trace": [
      {
        "caption": "La commande arrive.",
        "vars": {
          "budget": 30,
          "prix": 20,
          "stock": 2
        },
        "focus": "paramètres"
      },
      {
        "caption": "Les deux conditions sont évaluées.",
        "vars": {
          "budget": "30 >= 20 : vrai",
          "stock": "2 > 0 : vrai"
        },
        "focus": "&&"
      },
      {
        "caption": "La commande est acceptée.",
        "vars": {
          "retour": 1,
          "état": "accepté"
        },
        "focus": "return"
      }
    ],
    "prediction": {
      "question": "Si budget = prix et stock = 1, que doit retourner la fonction ?",
      "options": [
        "0 car le budget doit être strictement supérieur",
        "1 car les deux conditions sont remplies",
        "Une erreur de compilation"
      ],
      "correct": 1,
      "explanation": "Avec >=, un budget exactement égal au prix suffit. Si le stock est positif, les deux conditions de l'achat sont vraies."
    },
    "starter": "int achat_possible(int budget, int prix, int stock) {\n    if (budget >= prix) {\n        return 1;\n    }\n    return 0;\n}\n",
    "solution": "int achat_possible(int budget, int prix, int stock) {\n    if (budget >= prix && stock > 0) {\n        return 1;\n    }\n    return 0;\n}\n",
    "tests": [
      {
        "label": "Commande normale",
        "expression": "achat_possible(30,20,2)",
        "expected": "1"
      },
      {
        "label": "Budget insuffisant",
        "expression": "achat_possible(10,20,3)",
        "expected": "0"
      },
      {
        "label": "Rupture de stock",
        "expression": "achat_possible(30,20,0)",
        "expected": "0"
      },
      {
        "label": "Prix exact",
        "expression": "achat_possible(20,20,1)",
        "expected": "1"
      },
      {
        "label": "Stock négatif",
        "expression": "achat_possible(50,20,-1)",
        "expected": "0"
      }
    ],
    "mistake": "Un seul critère correct ne garantit pas que la commande doit être acceptée.",
    "tip": "Ajoute && stock > 0 dans la condition existante.",
    "mission": "Valide cinq scénarios, notamment le budget exactement égal au prix et le stock nul. C'est ton premier mini-projet vérifié par le vrai compilateur.",
    "recap": "Tu as terminé un premier parcours avec de vrais calculs, des décisions et des tests sur des entrées variées."
  }
];
export const lessonById=Object.fromEntries(lessons.map(x=>[x.id,x]));
export function answerPrediction(lesson,choice){if(!lesson||!Number.isInteger(choice)||choice<0||choice>=3)return {correct:false,explanation:"Choisis une réponse proposée."};return {correct:choice===lesson.prediction.correct,explanation:lesson.prediction.explanation};}
export function traceFrame(lesson,index){return lesson&&Number.isInteger(index)&&index>=0&&index<lesson.trace.length?lesson.trace[index]:null;}
export function makeCases(lesson,source){if(!lesson||typeof source!=="string")throw new Error("Exercice invalide.");return lesson.tests.map(t=>{let suffix="";if(t.expression){suffix='\n#include <stdio.h>\nint main(void) {\n    printf("%d\\n", '+t.expression+');\n    return 0;\n}\n';}return {name:t.label,source:source+suffix,stdin:"",expected:t.expected};});}
