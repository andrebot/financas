const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [new TerserPlugin({ /* additional options can be specified here */ })],
    splitChunks: {
      chunks: 'all',
      minSize: 10000,  // Minimum size, in bytes, for a chunk to be generated.
      maxSize: 250000, // Maximum size, in bytes, for a chunk to be generated.
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        // You can add more cacheGroups for more specific bundling
      },
    },
  },
  // Add production-specific configurations here, like minification plugins
});
