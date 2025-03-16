const path = require('path');

module.exports = function override(config, env) {
  // Add React Native Web alias
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };

  // Ensure proper CSS processing order
  const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
  if (oneOfRule) {
    const cssRules = oneOfRule.oneOf.filter((rule) => 
      rule.test && rule.test.toString().includes('css')
    );
    
    cssRules.forEach((rule) => {
      if (rule.use) {
        const postCSSIndex = rule.use.findIndex(
          (loader) => loader.loader && loader.loader.includes('postcss-loader')
        );
        if (postCSSIndex !== -1) {
          // Ensure Tailwind processes before other PostCSS plugins
          rule.use[postCSSIndex].options = {
            ...rule.use[postCSSIndex].options,
            postcssOptions: {
              ...rule.use[postCSSIndex].options?.postcssOptions,
              plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
                require('postcss-flexbugs-fixes'),
                require('postcss-preset-env')({
                  autoprefixer: {
                    flexbox: 'no-2009'
                  },
                  stage: 3
                }),
                ...(rule.use[postCSSIndex].options?.postcssOptions?.plugins || [])
              ]
            }
          };
        }
      }
    });
  }

  // Add babel configuration for RNW
  const babelLoader = config.module.rules.find(
    (rule) => rule.use && rule.use.loader && rule.use.loader.includes('babel-loader')
  );

  if (babelLoader) {
    babelLoader.use.options = {
      ...babelLoader.use.options,
      plugins: [
        ...babelLoader.use.options.plugins || [],
        'react-native-web',
      ],
      presets: [
        ...babelLoader.use.options.presets || [],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ]
    };
  }

  return config;
}