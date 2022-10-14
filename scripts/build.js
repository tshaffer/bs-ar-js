/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

console.log('build.js entry');

// Ensure environment variables are read.
require('../config/env');

const chalk = require('chalk');
const webpack = require('webpack');

const env = require('../config/env');
const isBrightSign = env.isBrightSign;
const config = require('../webpack.config');
const paths = require('../config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');

let distDeploymentDir = paths.appDistElectron;
if (isBrightSign) {
  distDeploymentDir = paths.appDistStandalone;
}
console.log('distDeploymentDir: ', distDeploymentDir);

return build(0);

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
  console.log('Creating an optimized production ' + (process.env.PLATFORM)  + ' build');

  let compiler = webpack(config);
  return new Promise((resolve, reject) => {
    console.log('invoke compiler');
    compiler.run((err, stats) => {
      if (err) {
        console.log('compiler.run() returned err');
        return reject(err);
      }

      console.log('successful return from compiler.run()');
      console.log('stats');
      console.log(stats);

      const messages = formatWebpackMessages(stats.toJson({}, true));
      if (messages.errors.length) {
        return reject(new Error(messages.errors.join('\n\n')));
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        );
        return reject(new Error(messages.warnings.join('\n\n')));
      }
      return resolve({
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      });
    });
  });
}

