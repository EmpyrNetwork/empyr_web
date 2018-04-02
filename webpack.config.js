const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var optimization = {
	minimizer: [
	  new UglifyJSPlugin({
	    uglifyOptions: {
		  mangle: false
		}})
	],
}

module.exports = [
	{
	  entry: './tracking.js',
	  output: {
	    filename: 'tracking.min.js',
	    path: path.resolve(__dirname, 'dist')
	  },
	  optimization: optimization
	},
	{
	  entry: './hostedFields.js',
	  output: {
	    filename: 'hostedFields.min.js',
	    path: path.resolve(__dirname, 'dist')
	  },
	  optimization: optimization
	}
];
