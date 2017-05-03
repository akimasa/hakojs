const HTMLWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CompressionPlugin = require("compression-webpack-plugin");
const webpack = require("webpack");

var PROD = JSON.parse(process.env.PROD || '0');

const path = require('path');
let plugins = [new HTMLWebpackPlugin({ template: path.resolve(__dirname, 'web', 'template.html') })];
//new ExtractTextPlugin('styles.css')
if(PROD){
plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false }
  }),
  new CompressionPlugin({
    asset: "[path].gz[query]",
    algorithm: "zopfli",
    test: /\.(js|html)$/,
    threshold: 10240,
    minRatio: 0.8
  })
);
}


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
  
  plugins: plugins,
}
if (!PROD) {
  module.exports.devtool = "inline-source-map";
}  