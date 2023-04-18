const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dotenv = require('dotenv').config({ path: __dirname + '/.env' })

module.exports = {
    entry: "./src/index.tsx",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js", // the name of the bundle
    },
    devServer: {
        port: 3030, // you can change the port
    },
    mode: process.env.NODE_ENV || "development",
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: ["ts-loader"],
            },
            {
                test: /\.(css|scss)$/,
                use: ["style-loader", "css-loader"],
            },
            // {
            //     test: /\.wasm$/,
            //     exclude: /node_modules/,
            //     use: ['wasm-loader'],
            // }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "public/index.html", // to import index.html file inside index.js
            'process.env': JSON.stringify(process.env),
        }),
    ],
}