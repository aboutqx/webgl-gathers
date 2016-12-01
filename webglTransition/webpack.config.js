var path = require('path');

module.exports = {
    entry: './imageSlide.js',
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: 'build.js',
        publicPath:'/dist/'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel",

        },
        { test: /\.jpg$/, loader: "file-loader?name=[name].[ext]" },
        {test:/\.json$/,loader:'json-loader'}
        ]
    }
}
