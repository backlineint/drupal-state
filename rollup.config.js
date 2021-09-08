import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'lib.ts',
    output:{
      file: 'dist/drupal-state.es.js',
      format: 'es'
    },
    plugins: [
			typescript(),
		]
  },
  {
    input: 'lib.ts',
    output: {
      file: 'dist/drupal-state.umd.js',
      format: 'umd',
      name: 'DrupalState'
    },
    plugins: [
			typescript(),
		]
  }
];