import typescript from '@rollup/plugin-typescript';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default [
  {
    input: 'lib.ts',
    output: {
      file: 'dist/drupal-state.es.js',
      format: 'es',
    },
    plugins: [
      nodeResolve({ preferBuiltins: false }),
      commonjs(),
      nodePolyfills(),
      typescript(),
      getBabelOutputPlugin({
        presets: ['@babel/preset-env'],
      }),
      terser(),
    ],
  },
  {
    input: 'lib.ts',
    output: {
      file: 'dist/drupal-state.umd.js',
      format: 'umd',
      name: 'DrupalState',
    },
    plugins: [
      nodeResolve({ preferBuiltins: false }),
      commonjs(),
      nodePolyfills(),
      typescript(),
      terser(),
    ],
  },
];
