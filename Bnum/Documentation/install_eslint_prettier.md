---
layout: default
title: Installer EsLint et Prettier
---

[Retour](https://messagerie-melanie2.github.io/Bnum/Documentation/configuration_modules)

Installez les extensions [Prettier EsLint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint) et [EsLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) dans VsCode.     
    
Installez [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable), vous pouvez utiliser [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) et [nvm](https://github.com/nvm-sh/nvm), vous pouvez mettre le dossier `node_modules` dans `Roundcube-plugin-mel`, il contient déjà les infos dans le `.gitignore`.    
     
Utilisez cette commande pour installez les dépendences : 
```
yarn add -D prettier@^3.1.0 eslint@^8.52.0 prettier-eslint@^16.1.2
```
    
Dans les settings de l'espace (ctrl + shift + p => `Preferences: Open Workspace Settings (JSON)`), ajoutez : 
```
"editor.defaultFormatter": "rvest.vs-code-prettier-eslint",
  "editor.formatOnType": true, // required
  "editor.formatOnPaste": true, // optional
  "editor.formatOnSave": true, // optional
  "editor.formatOnSaveMode": "file", // required to format on save
  "files.autoSave": "onFocusChange", // optional but recommended
  "vs-code-prettier-eslint.prettierLast": true // set as "true" to run 'prettier' last not first
```
     
A la racine de `Roundcube-plugin-mel`, créez un fichier `.prettierc.json` et `.eslintrc.json`.  
Dans le premier, mettez cette config : [Prettier](https://messagerie-melanie2.github.io/Bnum/Documentation/prettier),    
puis dans le second, mettez cette config : [EsLint](https://messagerie-melanie2.github.io/Bnum/Documentation/eslint)     
      
Redémarrez vscode et ça devrait fonctionner.

