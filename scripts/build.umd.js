/**
 * @name UMD 模块 打包
 * @description 参考 dragon-ui
 * @description 这里选择  webpack 进行打包  rollup也可以
 * @description 输出目录 [dist]
 * @description 文件名 [cuke-ui]
 * CMD Node.js 环境
 * AMD 浏览器环境
 * UMD 两种环境都可以执行
 */

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { version, name, description } = require("../package.json");

const config = {
	entry: {
		[name]: ["./components/index.js"]
	},

	//umd 模式打包
	output: {
		library: name,
		libraryTarget: "umd",
		umdNamedDefine: true, // 是否将模块名称作为 AMD 输出的命名空间
		path: path.join(process.cwd(), "dist"),
		filename: "[name].min.js"
	},
	//react 和 react-dom 不打包
	externals: {
		react: {
			root: "React",
			commonjs2: "react",
			commonjs: "react",
			amd: "react"
		},
		"react-dom": {
			root: "ReactDOM",
			commonjs2: "react-dom",
			commonjs: "react-dom",
			amd: "react-dom"
		}
	},
	resolve: {
		enforceExtension: false,
		extensions: [".js", ".jsx", ".json", ".less", ".css"]
	},
	module: {
		rules: [
			{
				test: /\.js[x]?$/,
				use: [
					{
						loader: "babel-loader"
					}
				],
				exclude: "/node_modules/",
				include: [path.resolve("components")]
			},
			{
				test: /\.(le|c)ss$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: [
						"css-loader",
						{ loader: "postcss-loader", options: { sourceMap: false } },
						{
							loader: "less-loader",
							options: {
								sourceMap: false
							}
						}
					]
				})
			},
			{
				test: /\.(jpg|jpeg|png|gif|cur|ico)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "images/[name][hash:8].[ext]" //遇到图片  生成一个images文件夹  名字.后缀的图片
						}
					}
				]
			}
		]
	},
	plugins: [
		new ProgressBarPlugin(),
		new ExtractTextPlugin({
			filename: "[name].min.css"
		}),
		//在打包的文件之前 加上版权说明
		new webpack.BannerPlugin(`
    MIT License
  
    Copyright (c) 2018 ${name} version(${version})

    ${description}
    ${fs.readFileSync(path.join(process.cwd(), "LICENSE"))}
	`),
		new webpack.DefinePlugin({
			"process.env.NODE_ENV": JSON.stringify("production")
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		}),
		new UglifyJsPlugin({
			cache: true,
			parallel: true,
			uglifyOptions: {
				compress: {
					warnings: false,
					drop_debugger: true,
					drop_console: false
				}
			}
		}),
		new OptimizeCSSAssetsPlugin({
			//压缩css  与 ExtractTextPlugin 配合使用
			cssProcessor: require("cssnano"),
			cssProcessorOptions: { discardComments: { removeAll: true } }, //移除所有注释
			canPrint: true //是否向控制台打印消息
		})
	]
};

module.exports = config;