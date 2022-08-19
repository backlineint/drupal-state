import typescript from '@rollup/plugin-typescript';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

const globals = {
  'zustand/vanilla': 'zustand',
  'isomorphic-fetch': 'fetch',
  '@apollo/client/core': 'apolloCore',
  'apollo-link-json-api': 'apolloLinkJsonApi',
  jsona: 'Jsona',
  'drupal-jsonapi-params': 'drupalJsonapiParams',
  deepmerge: 'deepmerge',
  humps: 'humps',
};
const external = [
  'humps',
  'isomorphic-fetch',
  '@apollo/client/core',
  'zustand/vanilla',
  'apollo-link-json-api',
  'jsona',
  'drupal-jsonapi-params',
  'deepmerge',
];

export default [
  {
    input: 'lib.ts',
    external,
    output: {
      file: 'dist/drupal-state.es.js',
      format: 'es',
      globals,
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
    external,
    output: {
      file: 'dist/drupal-state.umd.js',
      format: 'umd',
      name: 'DrupalState',
      globals,
    },
    plugins: [typescript()],
  },
];
