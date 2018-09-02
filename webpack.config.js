const HTMLWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CompressionPlugin = require("compression-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require("webpack");

var PROD = JSON.parse(process.env.PROD || '0');

const path = require('path');
let plugins = [new HTMLWebpackPlugin({ template: path.resolve(__dirname, 'web', 'template.html')}),
new VueLoaderPlugin()];
//new ExtractTextPlugin('styles.css')
if(PROD){
plugins.push(
  new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
  }),
  // new webpack.optimize.UglifyJsPlugin({
  //   compress: { warnings: false }
  // }),
  // new CompressionPlugin({
  //   asset: "[path].gz[query]",
  //   algorithm: "zopfli",
  //   test: /\.(js|html)$/,
  //   threshold: 10240,
  //   minRatio: 0.8
  // })
  );
}

const scriptLoadersOptions = {ts: {transpileOnly: true, appendTsSuffixTo: [/\.vue$/]}}
const cssLoader = {
  loader: 'css-loader',
  options: {
    sourceMap: true
  }
}

module.exports = {
  entry: path.resolve(__dirname, 'web', 'index.ts'),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'release', "webpack"),
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: /web/,
        options:  {
            scriptLoadersOptions,
            loaders: Object.assign({},
              { ts: {
                loader: "ts-loader",
                options: { configFile: "web/tsconfig.json" }
              }},
              cssLoader
            ),
            cssSourceMap: true,
            cacheBusting: false,
            transformToRequire: {
              video: ['src', 'poster'],
              source: 'src',
              img: 'src',
              image: 'xlink:href'
          }
        }
      },
      { test: /\.tsx?$/, use: 'ts-loader?'+ JSON.stringify({ configFile: "web/tsconfig.json" }), exclude: /node_modules|src\/web/ },
      // { test: /\.scss$/, use: ExtractTextPlugin.extract(['css-loader', 'sass-loader']) },
      // { test: /\.html$/, use: 'vue-template-loader', include: /web/, exclude: /template/ }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue']
  },
  
  plugins: plugins,
}
if (!PROD) {
  module.exports.devtool = "inline-source-map";
  module.exports.mode = "development";
  // module.exports.resolve.alias = {};
  // module.exports.resolve.alias['vue$'] =  'vue/dist/vue.esm.js';
}