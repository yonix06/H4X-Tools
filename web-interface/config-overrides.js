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

  // Add postcss loader for Tailwind
  const oneOf = config.module.rules.find(rule => rule.oneOf);
  if (oneOf) {
    const cssRule = oneOf.oneOf.find(rule => 
      rule.test && rule.test.toString().includes('css')
    );
    if (cssRule) {
      cssRule.use = ['style-loader', 'css-loader', 'postcss-loader'];
    }
  }

  return config;
};