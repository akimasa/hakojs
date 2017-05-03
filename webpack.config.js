const HTMLWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'web', 'index'),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'release', "webpack"),
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader?'+ JSON.stringify({ configFileName: "./web/tsconfig.json" }), exclude: /node_modules|src\/web/ },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader']) },
      { test: /\.html$/, loader: 'vue-template-loader', include: /web/, exclude: /template/ }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  
  plugins: [
    new HTMLWebpackPlugin({ template: path.resolve(__dirname, 'web', 'template.html') })//,
    //new ExtractTextPlugin('styles.css')
  ],
  devtool: "inline-source-map"
  
}