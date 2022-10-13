// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
var webpack = require('webpack');

// TEDTODO - these should be environment variables, command line arguments
var appBrightSignMock = '/Users/tedshaffer/Documents/Projects/bs-ar-js/src/mock';
var target = 'brightsign';
// var target = 'dev';

let plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development'),
  }),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  })
];
var externals = {};

if (target !== 'brightsign') {
  plugins.push(
    new webpack.NormalModuleReplacementPlugin(/^@brightsign.*$/, (resource) => {
      resource.request = resource.request.replace(/^@brightsign\/assetpool$/, path.resolve(appBrightSignMock, 'assetpool'));
      resource.request = resource.request.replace(/^@brightsign\/assetpoolfetcher$/, path.resolve(appBrightSignMock, 'assetpoolfetcher'));
      resource.request = resource.request.replace(/^@brightsign\/assetrealizer$/, path.resolve(appBrightSignMock, 'assetrealizer'));
      resource.request = resource.request.replace(/^@brightsign\/compositor$/, path.resolve(appBrightSignMock, 'compositor'));
      resource.request = resource.request.replace(/^@brightsign\/decoderconfiguration$/, path.resolve(appBrightSignMock, 'decoderconfiguration'));
      resource.request = resource.request.replace(/^@brightsign\/dwsconfiguration$/, path.resolve(appBrightSignMock, 'dwsconfiguration'));
      resource.request = resource.request.replace(/^@brightsign\/filesysteminfo$/, path.resolve(appBrightSignMock, 'filesysteminfo'));
      resource.request = resource.request.replace(/^@brightsign\/hostconfiguration$/, path.resolve(appBrightSignMock, 'hostconfiguration'));
      resource.request = resource.request.replace(/^@brightsign\/keyboard$/, path.resolve(appBrightSignMock, 'keyboard'));
      resource.request = resource.request.replace(/^@brightsign\/keystore$/, path.resolve(appBrightSignMock, 'keystore'));
      resource.request = resource.request.replace(/^@brightsign\/networkconfiguration$/, path.resolve(appBrightSignMock, 'networkconfiguration'));
      resource.request = resource.request.replace(/^@brightsign\/networkdiagnostics$/, path.resolve(appBrightSignMock, 'networkdiagnostics'));
      resource.request = resource.request.replace(/^@brightsign\/pointer$/, path.resolve(appBrightSignMock, 'pointer'));
      resource.request = resource.request.replace(/^@brightsign\/pointercalibration$/, path.resolve(appBrightSignMock, 'pointercalibration'));
      resource.request = resource.request.replace(/^@brightsign\/registry$/, path.resolve(appBrightSignMock, 'registry'));
      resource.request = resource.request.replace(/^@brightsign\/screenshot$/, path.resolve(appBrightSignMock, 'screenshot'));
      resource.request = resource.request.replace(/^@brightsign\/storageinfo$/, path.resolve(appBrightSignMock, 'storageinfo'));
      resource.request = resource.request.replace(/^@brightsign\/system$/, path.resolve(appBrightSignMock, 'system'));
      resource.request = resource.request.replace(/^@brightsign\/systemtime$/, path.resolve(appBrightSignMock, 'systemtime'));
      resource.request = resource.request.replace(/^@brightsign\/videoinput$/, path.resolve(appBrightSignMock, 'videoinput'));
      resource.request = resource.request.replace(/^@brightsign\/videomodeconfiguration$/, path.resolve(appBrightSignMock, 'videomodeconfiguration'));
      resource.request = resource.request.replace(/^@brightsign\/videooutput$/, path.resolve(appBrightSignMock, 'videooutput'));
    })
  );
} else {
  externals = {
    BSDeviceInfo: 'BSDeviceInfo',
    '@brightsign/registry': 'commonjs @brightsign/registry',
    '@brightsign/systemtime': 'commonjs @brightsign/systemtime',
    '@brightsign/networkconfiguration': 'commonjs @brightsign/networkconfiguration',
    '@brightsign/videooutput': 'commonjs @brightsign/videooutput',
    '@brightsign/screenshot': 'commonjs @brightsign/screenshot',

    '@brightsign/videomodeconfiguration': 'commonjs @brightsign/videomodeconfiguration',
    '@brightsign/videoinput': 'commonjs @brightsign/videoinput',
    '@brightsign/system': 'commonjs @brightsign/system',

    '@brightsign/hostconfiguration': 'commonjs @brightsign/hostconfiguration',
    '@brightsign/networkdiagnostics': 'commonjs @brightsign/networkdiagnostics',
    'core-js/fn/object/assign': 'commonjs core-js/fn/object/assign',
  };
}

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

  plugins: plugins,

  node: {}, // possibly / probably unnecessary

  externals: externals,

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ],
  },
};
