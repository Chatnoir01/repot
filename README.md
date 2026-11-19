# Portfolio développeur — version initiale

Site personnel indépendant, en français, sur une branche de préparation. Le pseudonyme et le domaine sont à définir.

## Contenus
- Accueil et présentation
- Projets, dont StopArnaques
- Laboratoire R&D (description générale uniquement)
- Technologies, À propos, Journal, Contact
- Confidentialité

## Architecture
HTML sémantique, CSS et JavaScript minimal, sans dépendances de compilation. Les liens sont **relatifs** pour fonctionner sur GitHub Pages sous `/repot/` ou sur un autre hébergement.

## Vérifier
```sh
node --test tests/*.test.mjs
node scripts/verify.mjs
```

## Consulter localement
Ouvrir `index.html` dans un navigateur ; certains navigateurs nécessitent un serveur HTTP pour tester tous les liens. Exemple : `python -m http.server 8000`.

## Publier (après validation)
1. Relire toutes les informations affichées ; choisir le pseudonyme et le domaine.
2. Fusionner la branche dans `main`.
3. Dans GitHub : Settings > Pages > Build and deployment > Source : GitHub Actions.
4. Déclencher le workflow Pages et vérifier l'URL réellement attribuée.
5. Compléter les mentions légales et les informations d'hébergement réelles avant d'ouvrir un formulaire de contact.

Aucun dépôt privé, secret ou identifiant personnel n'est nécessaire pour publier ce portfolio.

## Limites assumées
- Le nom public et le moyen de contact direct ne sont pas définis.
- La recherche décrite est expérimentale ; aucune supériorité du détecteur n'est affirmée.
- Pas de formulaire fonctionnel ni de tracking.
- La configuration Pages dépend du compte GitHub, et n'est pas activée par la simple présence du workflow.
