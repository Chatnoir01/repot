# DEV/LAB Campus — fondation pédagogique

> Version expérimentale. Ce Campus est une nouvelle plateforme à côté des ateliers et de l'Academy V4, non une copie visuelle d'autres services de formation.

## Parcours disponibles

| Parcours | Moteur réel | Validation |
| --- | --- | --- |
| C | c2wasm, compilateur C89/C90 partiel, WebAssembly dans un Worker | Sortie comparée à plusieurs cas issus du cursus V4 |
| JavaScript | Moteur JS du navigateur dans un Worker créé au sein d'une iframe sandboxée sans même origine | Fonctions appelées avec plusieurs entrées |
| HTML/CSS | Navigateur, prévisualisation dans une iframe sans scripts | Validation **manuelle**, pas de certification automatique |
| Python | **Non disponible** | Ne pas annoncer d'interpréteur Python avant intégration |

12 projets guidés (4 par parcours) et des projets personnels. Les projets peuvent contenir plusieurs fichiers. **Seul le fichier d'entrée est exécuté en C et JS** : le compilateur actuel ne lie pas plusieurs fichiers C, et le moteur JS ne résout pas les imports de modules du projet. Pour HTML/CSS, les fichiers \`index.html\` et \`style.css\` sont combinés dans l'aperçu.

## Architecture

- \`catalog.mjs\` : déclarations de projets, cours, épreuves, compétences et contenus pédagogiques originaux.
- \`state.mjs\` : gestion et validation du stockage local (fichiers, projets, progression).
- \`runner.mjs\` : adaptateurs d'exécution distincts et isolés, limite de temps, CSP.
- \`app.mjs\` : contrôleur de navigation, explorateur de fichiers, édition, tests, sauvegarde, import/export.
- \`index.html\` et \`styles.css\` : interface statique, responsive, sans framework ni compte.

### Sécurité et vie privée

Le Campus n'envoie volontairement aucun code à un serveur et n'utilise pas de suivi publicitaire. Les données sont enregistrées dans \`localStorage\`, pas synchronisées entre appareils. L'export JSON contient **le code du projet** : il ne faut pas y mettre de clés ou de secrets.

L'exécution JavaScript est cloisonnée dans une iframe \`sandbox="allow-scripts"\` sans \`allow-same-origin\`, avec CSP restrictive et Worker dédié. Un chronomètre interrompt les boucles bloquantes. Ce mécanisme diminue les risques mais ne constitue **pas** une infrastructure d'exécution multitenant résistante à des attaquants déterminés ; l'usage est pédagogique et local. Une éventuelle exécution serveur demanderait des conteneurs/microVM isolés, une restriction du réseau et un contrôle des ressources.

L'aperçu HTML/CSS n'accorde pas le droit d'exécuter des scripts. Il bloque les requêtes réseau par CSP. Le compilateur C partage le Worker et les binaires WebAssembly vérifiés et épinglés dans \`../academy-v4/\`.

## Validation

\`\`\`bash
node --test tests/*.test.mjs
node scripts/verify.mjs
\`\`\`

Le workflow \`Campus checks\` exécute aussi un scénario Playwright/Chromium en HTTP local, avec les mêmes binaires C que ceux du site : chargement de la page, test JS, blocage d'une boucle infinie, aperçu HTML/CSS, compilation C et reprise après rechargement. Ne pas publier si cette suite échoue.

## Évolution

- Construire des projets plus longs, des checkpoints pédagogiques plus exigeants et des revues de code.
- Remplacer progressivement l'éditeur textarea par un véritable éditeur local embarqué, après tests d'accessibilité.
- Ajouter Python via un moteur WASM local ou une infrastructure d'exécution correctement isolée et mesurée.
- Permettre un compilateur C complet, des projets C/JS multifichiers et du débogage.
- Envisager un compte utilisateur et une synchronisation **uniquement après** mise en place d'une politique de confidentialité, des contrôles d'accès et de la sécurité serveur.
