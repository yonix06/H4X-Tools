const path = require('path');

module.exports = function override(config, env) {
  // Add react-native-web alias
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'react-native$': 'react-native-web',
  };

  // Enable tree-shaking for react-native-web
  config.resolve.extensions = [
    '.web.js',
    '.web.jsx',
    '.web.ts',
    '.web.tsx',
    ...config.resolve.extensions,
  ];

  return config;
};