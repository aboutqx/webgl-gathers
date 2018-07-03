// webpack.config.js
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ip = require('ip');
const serverIp = ip.address();
const HtmlWebpackPlugin = require("html-webpack-plugin")
const pathOutput = path.resolve(__dirname, 'webglFilter/dist')
const pathNodeModules = path.resolve(__dirname, 'node_modules')
const env = process.env.NODE_ENV
const isProd = env === 'production'

console.log('Environment isProd :', isProd)

let plugins = [
  new webpack.HotModuleReplacementPlugin(), new HtmlWebpackPlugin({
    cache: true,
    hash: true,
    inject: true,
    chunks: ['app'],
    minify: {
      removeComments: false,
      collapseWhitespace: false,
      removeAttributeQuotes: true
    },
    filename: isProd ? 'index.html' : 'webglFilter/index.html',
    template: 'webglFilter/index.html'
  }) ]

if(isProd) {
  plugins = plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
        sourceMap: false,
        compress: {
            drop_debugger: true,
            drop_console: true,
            screw_ie8: true
        },
        comments: false,
        mangle: false
    }),
    new ExtractTextPlugin('[name].css' ),
    // new CopyWebpackPlugin([{
    //     from: 'webglFilter/src/img',
    //     to: 'src/img'
    //   },
    //   {
    //     from: 'webglFilter/src/textures',
    //     to: 'src/textures'
    //   }
    // ])
  ])
}

const entry = { app: './webglFilter/src/js/app.js' }

const output =   {
    filename: 'bundle.js',
    path: pathOutput
}
const devtool = isProd ? 'source-map' : 'inline-source-map';

const config = {
    entry,
    devtool,
    devServer: {
        host: serverIp,
        contentBase: './',
        hot: true,
        disableHostCheck: true
    },
    plugins,
    output,
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',

                exclude: pathNodeModules
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: pathNodeModules
            },
            {
                test: /\.scss$/,
                use: isProd ?
                    ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: ["css-loader", "sass-loader"]
                    }) :
                    ["style-loader", "css-loader", "sass-loader"]
                ,
                exclude: pathNodeModules
            },
            {
              test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
              loader: 'url-loader',
              options: {
                limit: 10000,
                name: '[name].[ext]'
              }
            },
            {
                test: /\.(glsl|vert|frag)$/,
                use: ["raw-loader", "glslify-loader"],
                exclude: pathNodeModules
            }
        ]
    },
    resolve: {
        alias: {
            'libs': path.resolve(__dirname, './libs'),
        }
    }
}

module.exports = config;
