const path = require('path');
const { globSync } = require('glob');
const fs = require('fs-extra');

// Le dossier racine de votre projet
const projectRoot = process.cwd();

// 1. Définir le dossier de destination
const destDir = path.join(projectRoot, 'dist/assets');

// 2. Trouver tous les dossiers 'stories.assets'
//    - '**/stories.assets' : trouve ce nom à n'importe quelle profondeur
//    - cwd: le point de départ de la recherche
//    - ignore: essentiel pour ne pas chercher dans les dépendances
//    - absolute: pour obtenir les chemins complets
const sourceDirs = globSync('**/stories.assets', {
  cwd: projectRoot,
  ignore: ['node_modules/**', 'dist/**'],
  absolute: true,
  onlyDirectories: true,
});

if (sourceDirs.length === 0) {
  console.log('Aucun dossier "stories.assets" trouvé.');
  process.exit(0);
}

// 3. S'assurer que le dossier de destination existe
try {
  fs.ensureDirSync(destDir);
  console.log(`Destination créée (ou déjà existante) : ${destDir}`);
} catch (err) {
  console.error(
    `Impossible de créer le dossier de destination : ${destDir}`,
    err,
  );
  process.exit(1);
}

// 4. Copier le contenu de chaque dossier source vers la destination
let filesCopied = 0;
for (const sourceDir of sourceDirs) {
  try {
    // fs.copySync(src, dest) fusionne le contenu de src dans dest.
    // C'est exactement ce que vous voulez.
    fs.copySync(sourceDir, destDir, {
      overwrite: true, // Écrase les fichiers s'ils ont le même nom
      errorOnExist: false,
    });
    console.log(
      `-> Contenu de ${path.relative(projectRoot, sourceDir)} copié.`,
    );
    filesCopied++;
  } catch (err) {
    console.error(`Erreur lors de la copie de ${sourceDir}:`, err);
  }
}

console.log(
  `\nOpération terminée. Contenu de ${filesCopied} dossier(s) copié dans dist/assets.`,
);
