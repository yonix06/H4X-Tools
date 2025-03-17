const path = require('path');

module.exports = function override(config) {
  // Add support for Tailwind CSS
  config.module.rules.push({
    test: /\.css$/,
    include: path.resolve(__dirname, 'src/styles'),
    use: [
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            config: path.resolve(__dirname, 'postcss.config.js'),
          },
        },
      },
    ],
  });

  return config;
};
