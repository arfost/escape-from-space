const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = () => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/(.*)ENV(\.*)/, function(resource) {
        resource.request = resource.request.replace(/ENV/, 'production');
    }),
    new MiniCssExtractPlugin()]
});
