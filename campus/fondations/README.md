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