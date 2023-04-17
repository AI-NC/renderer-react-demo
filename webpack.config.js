const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.join(__dirname, "src", "index.tsx"),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js", // the name of the bundle
    },
    devServer: {
        port: 3030, // you can change the port
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.(js|jsx|tsx|ts)$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react', "@babel/preset-typescript"]
                    }
                },
                resolve: {
                    extensions: ['.ts', '.tsx', '.js', '.json']
                }
            },
            {
                exclude: /node_modules/,
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.html", // to import index.html file inside index.js
        }),
    ],
    externals: {
        'react': 'React'
    },
}