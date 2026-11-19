# Fournisseur du compilateur C (WebAssembly)

La V3 utilise des composants issus de [divsmith/c2wasm](https://github.com/divsmith/c2wasm), publication open source sous licence MIT.

Source de la version intégrée : commit `4a688fe5bac3405cbbd17ebf3dbb1863a1420961`.

Fichiers JavaScript repris à l'identique : `compiler-api.js` et `wasi-harness.js`. Les fichiers binaires `compiler.wasm` et `assembler.wasm` sont récupérés au déploiement depuis la démonstration publique de l'auteur. Les sommes SHA-256 doivent être contrôlées et figées avant une publication de production durable.

Le compilateur met en œuvre un véritable sous-ensemble de C89/C90, sans prétendre couvrir intégralement le standard. Son exécution n'utilise pas le réseau et s'effectue dans un Web Worker dédié avec délai d'arrêt.

Copyright et conditions : voir le dépôt amont et sa licence MIT. Cette intégration n'est pas affiliée à l'auteur du compilateur.
