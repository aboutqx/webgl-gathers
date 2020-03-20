// webpack.config.js
const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ip = require('ip');
const serverIp = ip.address();
const HtmlWebpackPlugin = require("html-webpack-plugin")

const pathNodeModules = path.resolve(__dirname, 'node_modules')
const env = process.env.NODE_ENV
const isProd = env === 'production'

console.log('Environment isProd :', isProd)

function getOutput() {

    if (isProd) {
        return path.resolve(__dirname, "dist/")
    } else {
        return path.resolve(__dirname, "src/")
    }

}

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
        publicPath: '/', // css js path
        filename: 'index.html',
        template: 'src/index.html'
    })
]

if (isProd) {
    plugins = plugins.concat([
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new CopyWebpackPlugin([{
            from: 'src/assets',
            to: 'assets'
        }])
    ])
}

const entry = {
    app: './src/js/app.js'
}

const output = {
    filename: 'bundle.js',
    path: getOutput(),
    publicPath: !isProd ? `http://${serverIp}:8081/` : '' // global ajax get file path
}
console.log(getOutput())
const devtool = isProd ? 'none' : 'inline-source-map';

const config = {
    entry,
    devtool,
    mode: isProd ? 'production' : 'development',
    devServer: {
        host: `${serverIp}`,
        contentBase: './src',
        hot: true,
        disableHostCheck: true,
        port: 8081
    },
    plugins,
    output,
    module: {
        rules: [{
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
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, "css-loader"]
        },
        {
            test: /\.scss$/,
            use: [
                "style-loader", // creates style nodes from JS strings
                "css-loader", // translates CSS into CommonJS
                "sass-loader" // compiles Sass to CSS, using Node Sass by default
            ]
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
            'shaders': path.resolve(__dirname, './src/shaders'),
            'physics': path.resolve(__dirname, './libs/physics'),
            'helpers': path.resolve(__dirname, './libs/helpers'),
            'loaders': path.resolve(__dirname, './libs/loaders'),

        }
    },
    optimization: {
        minimizer: [new TerserPlugin({ parallel: true })]
    },
}

module.exports = config;
