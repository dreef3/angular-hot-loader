console.log(__dirname);

var path = require('path');
var webpack = require('webpack');

var pathToHMRLoader = path.resolve(__dirname, '../');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, './src/index')
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: [pathToHMRLoader, 'babel'],
      include: [path.join(__dirname, 'src'), path.join(__dirname, '../loader-runtime')]
    }, {
      test: /\.html$/,
      loader: 'html'
    }]
  }
};
