const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = () => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/(.*)ENV(\.*)/, function(resource) {
        resource.request = resource.request.replace(/ENV/, 'development');
      }),
    // Copy empty ServiceWorker so install doesn't blow up
    new CopyWebpackPlugin(['src/sw.js'])
  ],
  devtool: 'source-map'
});
