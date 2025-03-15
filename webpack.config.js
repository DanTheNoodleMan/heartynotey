const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	mode: process.env.NODE_ENV === "production" ? "production" : "development",
	entry: {
		main: "./src/renderer/index.tsx",
		note: "./src/renderer/note.tsx",
		// Add more entries here
	},
	output: {
		path: path.resolve(__dirname, "dist/renderer"),
		filename: "[name].js",
		clean: true, // This will clean the output directory before each build
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
			filename: "index.html",
			chunks: ["main"],
		}),
		new HtmlWebpackPlugin({
			template: "./src/renderer/note.html",
			filename: "note.html",
			chunks: ["note"],
		}),
	],
	devServer: {
		static: {
			directory: path.join(__dirname, "dist/renderer"),
		},
		port: 8080,
		hot: true,
	},
};
