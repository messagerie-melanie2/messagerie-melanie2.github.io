---
layout: default
title: Configuration ESLINT
---

[Retour](https://messagerie-melanie2.github.io/Bnum/Documentation/configuration_modules)

# Pour commencer
Lancer la commande `update`.   
Si c'est la première fois que vous souhaitez générer de la doc, lancez `jsdocinit`.

# Les plugins et patches
Ajouter dans `/opt/bnum/rcube/github/node_modules/jsdoc/plugins`, le plugin [local.js](https://gist.github.com/micmath/61faa72a8793d15605ee#file-plugins_local-js) et le plugin [fromModule.js](https://gist.github.com/Rotomeca/296f86056a2327ac2066bf467e5e72b9).   

Remplacer le contenu de tui par ce [patch](https://gist.github.com/Rotomeca/decea9448efe53e4d17517d35a1d29f3).

Bien récuprer la configuration à mettre dans `Roundcube-plugins-Mel`.    
Elle doit se nommer [jsdoc-config.json](https://messagerie-melanie2.github.io/Bnum/Documentation/jsdoc_config)

# Générer la doc
Lancez `testdoc` pour tester la doc en local dans `webmail/bnum/jsDoc`.   
Lancez `buildoc` pour mettre le build dans le dossier github. 
