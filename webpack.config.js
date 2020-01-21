const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

var optimization = {
	minimizer: [
	  new TerserPlugin({
	    terserOptions: {
          mangle: false
        }})
	],
}

module.exports = [
	{
	  entry: './tracker.js',
	  output: {
	    filename: 'tracker.min.js',
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
