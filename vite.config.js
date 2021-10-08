const path = require('path');
const legacy = require('@vitejs/plugin-legacy');

module.exports = {
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib.ts'),
      name: 'drupalState',
      fileName: format => `drupal-state.${format}.js`,
    },
  },
};
