import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './scripts/generate-docs.ts',
  output: {
    file: './scripts/generate-docs.js', // Le fichier de sortie
    format: 'cjs', // CommonJS pour Node.js
    sourcemap: true,
    exports: 'auto',
  },
  plugins: [
    resolve({
      extensions: ['.ts', '.js'], // Important pour résoudre les imports .ts
    }),
    commonjs(),
    typescript({
      tsconfig: './scripts/tsconfig.docs.json', // Utilise notre config qui ignore les erreurs minimatch
    }),
  ],
  // FONCTIONNEMENT DE L'EXTERNALISATION :
  // 1. On garde "external" tout ce qui est dans node_modules (ts-morph, fs-extra, glob...)
  // 2. On bundle (inclut) tout ce qui est un fichier local (commence par . ou /)
  external: (id) => {
    // Si l'id ne commence pas par "." (relatif) et n'est pas un chemin absolu, c'est une lib -> externe
    return !id.startsWith('.') && !path.isAbsolute(id);
  },
};

import path from 'path'; // Nécessaire pour la fonction external ci-dessus
