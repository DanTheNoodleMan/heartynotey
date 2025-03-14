const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	mode: "development",
	entry: {
		main: "./src/renderer/index.tsx",
	},
	output: {
		path: path.resolve(__dirname, "dist/renderer"),
		filename: "[name].js",
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader", "postcss-loader"],
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/renderer/index.html",
		}),
	],
	devServer: {
		static: {
			directory: path.join(__dirname, "public"),
		},
		port: 8080,
		hot: true,
	},
};
