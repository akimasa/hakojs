const HTMLWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'web', 'index'),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader?'+ JSON.stringify({ configFileName: "tsconfig.front.json" }), exclude: /node_modules|src\/web/ },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader']) },
      { test: /\.html$/, loader: 'vue-template-loader', include: /web/ }
    ]
  },
  resolve: {
    extensions: ['', '.ts', '.js']
  },
  /*
  plugins: [
    new HTMLWebpackPlugin({ template: './template.html' }),
    new ExtractTextPlugin('styles.css')
  ]
  */
}