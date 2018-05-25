// webpack.config.js
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ip = require('ip');
const serverIp = ip.address();

const pathOutput = path.resolve(__dirname, 'dist');
const pathNodeModules = path.resolve(__dirname, 'node_modules')
const env = process.env.NODE_ENV;
const isProd = env === 'production';

console.log('Environment isProd :', isProd);

const plugins = [
    new webpack.HotModuleReplacementPlugin()
];

if (isProd) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        sourceMap: false,
        compress: {
            drop_debugger: true,
            drop_console: true,
            screw_ie8: true
        },
        comments: false,
        mangle: false
    }));
    plugins.push(new ExtractTextPlugin('assets/css/main.css'));
}

const entry = isProd ? { app: './index.js' }
    : { app: './index.js'};
const output = isProd ? {
    filename: 'assets/js/app.js',
    path: pathOutput
} : {
        filename: 'bundle.js',
        path: pathOutput
    };

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
