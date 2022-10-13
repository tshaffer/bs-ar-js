// eslint-disable-next-line @typescript-eslint/no-var-requires
var webpack = require('webpack');

module.exports = {
  entry: './src/index.tsx',
  output: {
    libraryTarget: 'umd',
    publicPath: './build/',
    filename: 'bundle.js',
    path: __dirname + '/build'
  },
  mode: 'development',

  target: 'electron-renderer',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  devtool: 'inline-source-map',

  // TEDTODO - plugins, node, externals
  
  // MAC version: plugins, node?, externals
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/^@brightsign.*$/, (resource) => {
      resource.request = resource.request.replace(/^@brightsign\/assetpool$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/assetpool');
      resource.request = resource.request.replace(/^@brightsign\/assetpoolfetcher$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/assetpoolfetcher');
      resource.request = resource.request.replace(/^@brightsign\/assetrealizer$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/assetrealizer');
      resource.request = resource.request.replace(/^@brightsign\/compositor$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/compositor');
      resource.request = resource.request.replace(/^@brightsign\/decoderconfiguration$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/decoderconfiguration');
      resource.request = resource.request.replace(/^@brightsign\/dwsconfiguration$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/dwsconfiguration');
      resource.request = resource.request.replace(/^@brightsign\/filesysteminfo$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/filesysteminfo');
      resource.request = resource.request.replace(/^@brightsign\/hostconfiguration$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/hostconfiguration');
      resource.request = resource.request.replace(/^@brightsign\/keyboard$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/keyboard');
      resource.request = resource.request.replace(/^@brightsign\/keystore$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/keystore');
      resource.request = resource.request.replace(/^@brightsign\/networkconfiguration$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/networkconfiguration');
      resource.request = resource.request.replace(/^@brightsign\/networkdiagnostics$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/networkdiagnostics');
      resource.request = resource.request.replace(/^@brightsign\/pointer$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/pointer');
      resource.request = resource.request.replace(/^@brightsign\/pointercalibration$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/pointercalibration');
      resource.request = resource.request.replace(/^@brightsign\/registry$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/registry');
      resource.request = resource.request.replace(/^@brightsign\/screenshot$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/screenshot');
      resource.request = resource.request.replace(/^@brightsign\/storageinfo$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/storageinfo');
      resource.request = resource.request.replace(/^@brightsign\/system$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/system');
      resource.request = resource.request.replace(/^@brightsign\/systemtime$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/systemtime');
      resource.request = resource.request.replace(/^@brightsign\/videoinput$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/videoinput');
      resource.request = resource.request.replace(/^@brightsign\/videomodeconfiguration$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/videomodeconfiguration');
      resource.request = resource.request.replace(/^@brightsign\/videooutput$/, '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock/videooutput');
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ].filter(Boolean),

  node: {}, // possibly / probably unnecessary

  externals: {},

  // MAC version: plugins, node?, externals
  // externals: {
  //   BSDeviceInfo: 'BSDeviceInfo',
  //   '@brightsign/registry': 'commonjs @brightsign/registry',
  //   '@brightsign/systemtime': 'commonjs @brightsign/systemtime',
  //   '@brightsign/networkconfiguration': 'commonjs @brightsign/networkconfiguration',
  //   '@brightsign/videooutput': 'commonjs @brightsign/videooutput',
  //   '@brightsign/screenshot': 'commonjs @brightsign/screenshot',

  //   '@brightsign/videomodeconfiguration': 'commonjs @brightsign/videomodeconfiguration',
  //   '@brightsign/videoinput': 'commonjs @brightsign/videoinput',
  //   '@brightsign/system': 'commonjs @brightsign/system',

  //   '@brightsign/hostconfiguration': 'commonjs @brightsign/hostconfiguration',
  //   '@brightsign/networkdiagnostics': 'commonjs @brightsign/networkdiagnostics',
  //   'core-js/fn/object/assign': 'commonjs core-js/fn/object/assign',
  // },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ],
  },
};
