const path = require('path');

module.exports = {
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/drupalState.ts'),
      name: 'drupalState',
      fileName: format => `drupal-state.${format}.js`,
    },
  },
};
