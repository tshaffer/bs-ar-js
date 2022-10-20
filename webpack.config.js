/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const paths = require('./config/paths');

var webpack = require('webpack');

var target = 'brightsign';
if (process.env.PLATFORM === 'electron') {
  target = 'electron';
}

let plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development'),
  }),
];
var externals = {};

if (target !== 'brightsign') {
  plugins.push(
    new webpack.NormalModuleReplacementPlugin(/^@brightsign.*$/, (resource) => {
      resource.request = resource.request.replace(/^@brightsign\/assetpool$/, path.resolve(paths.appBrightSignMock, 'assetpool'));
      resource.request = resource.request.replace(/^@brightsign\/assetpoolfetcher$/, path.resolve(paths.appBrightSignMock, 'assetpoolfetcher'));
      resource.request = resource.request.replace(/^@brightsign\/assetrealizer$/, path.resolve(paths.appBrightSignMock, 'assetrealizer'));
      resource.request = resource.request.replace(/^@brightsign\/compositor$/, path.resolve(paths.appBrightSignMock, 'compositor'));
      resource.request = resource.request.replace(/^@brightsign\/decoderconfiguration$/, path.resolve(paths.appBrightSignMock, 'decoderconfiguration'));
      resource.request = resource.request.replace(/^@brightsign\/dwsconfiguration$/, path.resolve(paths.appBrightSignMock, 'dwsconfiguration'));
      resource.request = resource.request.replace(/^@brightsign\/filesysteminfo$/, path.resolve(paths.appBrightSignMock, 'filesysteminfo'));
      resource.request = resource.request.replace(/^@brightsign\/hostconfiguration$/, path.resolve(paths.appBrightSignMock, 'hostconfiguration'));
      resource.request = resource.request.replace(/^@brightsign\/keyboard$/, path.resolve(paths.appBrightSignMock, 'keyboard'));
      resource.request = resource.request.replace(/^@brightsign\/keystore$/, path.resolve(paths.appBrightSignMock, 'keystore'));
      resource.request = resource.request.replace(/^@brightsign\/networkconfiguration$/, path.resolve(paths.appBrightSignMock, 'networkconfiguration'));
      resource.request = resource.request.replace(/^@brightsign\/networkdiagnostics$/, path.resolve(paths.appBrightSignMock, 'networkdiagnostics'));
      resource.request = resource.request.replace(/^@brightsign\/pointer$/, path.resolve(paths.appBrightSignMock, 'pointer'));
      resource.request = resource.request.replace(/^@brightsign\/pointercalibration$/, path.resolve(paths.appBrightSignMock, 'pointercalibration'));
      resource.request = resource.request.replace(/^@brightsign\/registry$/, path.resolve(paths.appBrightSignMock, 'registry'));
      resource.request = resource.request.replace(/^@brightsign\/screenshot$/, path.resolve(paths.appBrightSignMock, 'screenshot'));
      resource.request = resource.request.replace(/^@brightsign\/storageinfo$/, path.resolve(paths.appBrightSignMock, 'storageinfo'));
      resource.request = resource.request.replace(/^@brightsign\/system$/, path.resolve(paths.appBrightSignMock, 'system'));
      resource.request = resource.request.replace(/^@brightsign\/systemtime$/, path.resolve(paths.appBrightSignMock, 'systemtime'));
      resource.request = resource.request.replace(/^@brightsign\/videoinput$/, path.resolve(paths.appBrightSignMock, 'videoinput'));
      resource.request = resource.request.replace(/^@brightsign\/videomodeconfiguration$/, path.resolve(paths.appBrightSignMock, 'videomodeconfiguration'));
      resource.request = resource.request.replace(/^@brightsign\/videooutput$/, path.resolve(paths.appBrightSignMock, 'videooutput'));
    })
  );
} else {
  externals = {
    BSControlPort: 'BSControlPort',
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

let distDeploymentDir = paths.appDistBrightSign;
if (process.env.PLATFORM === 'electron') {
  distDeploymentDir = paths.appDistElectron;
}
console.log('webpack.config.js, distDeploymentDir: ', distDeploymentDir);

module.exports = {
  entry: './src/index.tsx',
  output: {
    libraryTarget: 'umd',
    publicPath: './build/',
    filename: 'bundle.js',
    path: distDeploymentDir,
    // path: __dirname + '/build'
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
