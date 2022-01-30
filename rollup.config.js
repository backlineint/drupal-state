import typescript from '@rollup/plugin-typescript';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

export default [
  {
    input: 'lib.ts',
    output: {
      file: 'dist/drupal-state.es.js',
      format: 'es',
    },
    plugins: [
      typescript(),
      getBabelOutputPlugin({
        presets: ['@babel/preset-env'],
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              helpers: false,
              regenerator: true,
            },
          ],
        ],
      }),
    ],
  },
  {
    input: 'lib.ts',
    output: {
      file: 'dist/drupal-state.umd.js',
      format: 'umd',
      name: 'DrupalState',
    },
    plugins: [typescript()],
  },
];
