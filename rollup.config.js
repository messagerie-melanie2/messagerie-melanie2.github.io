import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/ds-module-bnum.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/ds-module-bnum.min.js',
      format: 'esm',
      plugins: [terser()],
    },
    {
      file: 'dist/ds-bnum.js',
      format: 'iife', // utilisable direct <script>
      name: 'Bnum',
    },
    {
      file: 'dist/ds-bnum.min.js',
      format: 'iife', // utilisable direct <script>
      name: 'Bnum',
      plugins: [terser()],
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    postcss({
      inject: false, // ❌ ne pas injecter via <style> global
      minimize: true, // ✅ minifie ton CSS
      modules: false, // ❌ on ne veut pas de CSS modules
      extract: false, // ❌ pas de fichier séparé
      plugins: [autoprefixer(), cssnano()],
      use: [['less', { javascriptEnabled: true }]],
    }),
    copy({
      targets: [
        { src: 'core/styles/fonts/*', dest: 'dist/fonts' },
        { src: 'core/styles/material-symbols.css', dest: 'dist' },
      ],
    }),
  ],
};
