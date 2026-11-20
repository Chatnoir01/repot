# DEV/LAB Fondations C — 18 missions guidées

Le parcours est un module indépendant de DEV/LAB Campus, pensé pour des débutants.

## Apprendre en quatre temps

1. Comprendre : explication, objectif et comparaison avec une situation réelle.
2. Visualiser : états illustratifs préparés pour l'exemple, clairement distincts de l'exécution réelle.
3. Prédire : question avec trois réponses et justification, sans attribuer de validation de code.
4. Programmer : vrai compilateur C WebAssembly, terminal, cas de test, indices et téléchargement du fichier source.

## Technique et limites

- Le compilateur c2wasm utilisé est un sous-ensemble C89/C90, et non GCC/Clang complet.
- Le code C s'exécute réellement dans un Worker avec limite de temps et bouton Stop.
- Les visualisations sont pédagogiques : elles ne lisent pas les valeurs mémoire de l'exécution réelle.
- Les sorties et erreurs du programme proviennent du compilateur, sans simulation.
- La progression et le code restent dans le stockage local du navigateur, sans compte ni télémétrie supplémentaire.
- Les tests comparent les sorties attendues mais ne garantissent pas la correction de tous les cas possibles.

## Validation

- 18 leçons originales, 4 modules et 28 cas C effectivement compilés dans GitHub Actions.
- 35 tests logiciels vérifiés.
- Chromium : prédiction correcte/incorrecte, états visuels, compilation, progression, persistance et mobile 390 px.
- GitHub Pages doit exécuter scripts/verify-fondations-c.mjs et réussir avant publication.

## Fichiers

- curriculum.mjs : contenu original, scénarios, cas et transformations C.
- app.mjs : navigation, code, trace, état, progression, exécution bornée.
- index.html et styles.css : interface du parcours responsive.

Le parcours ne remplace pas les autres cours ni le Campus actuel. Il reste extensible.

## Observation réelle des variables : un mode optionnel

Le visualiseur de cours reste un exemple préparé. Le bouton « Observer mon code » fournit maintenant une seconde expérience, distincte :

1. Compiler et exécuter le code C de l’apprenant sans modification.
2. Instrumenter les déclarations et affectations entières simples à l’intérieur de main avec de petites sondes printf et un marqueur unique.
3. Compiler et exécuter cette seconde version via le même compilateur WebAssembly, avec arrêt et délai maximum.
4. Extraire les mesures et comparer les sorties normales des deux programmes après retrait des sondes.
5. Afficher les valeurs seulement si les deux sorties concordent et que les mesures proviennent des emplacements instrumentés.

Ce n’est ni un débogueur C universel ni un traçage en temps réel de toutes les instructions. Les fonctions complexes, pointeurs et constructions C non reconnues peuvent rester sans trace. Toute différence entre les sorties bloque l’affichage. Les sondes ne sont jamais sauvegardées dans le code de l’apprenant. Une modification du code efface immédiatement les mesures précédentes.

## Diagnostics pédagogiques et éditeur

- Le terminal présente les messages réels du compilateur et la sortie réelle du programme.
- Le coach explique la différence entre les valeurs attendues et obtenues. Pour les erreurs de syntaxe, il ne revendique une ligne que si le diagnostic original contient cette localisation.
- Une nouvelle compilation efface les anciens messages pour éviter de présenter une erreur périmée.
- L’éditeur dispose de l’affichage ligne/colonne, d’une navigation vers une ligne et de l’insertion assistée de délimiteurs, sans promettre les fonctionnalités complètes de VS Code.

Tests : l’exécution du code de départ mesure 5 puis 6 dans la leçon f08 ; après correction elle mesure 5 puis 8. Les essais Chromium contrôlent les erreurs réelles, les limites du traceur, l’invalidation et le rendu mobile.
