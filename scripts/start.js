/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

// const env = require('../config/env');
const paths = require('../config/paths');
var spawn = require('cross-spawn');
const chalk = require('react-dev-utils/chalk');

const distDeploymentDir = paths.appDistElectron;
console.log('distDeploymentDir: ', distDeploymentDir);

/*
  openElectron invoked
  scriptPath:  /Users/tedshaffer/Documents/Projects/autorun-js/dev/bootstrap.main.js
  url http://localhost:3000
  extraArgs:  []
*/

function openElectron(scriptPath, url) {
  const extraArgs = process.argv.slice(2);
  const child = spawn('electron', [scriptPath, ...extraArgs, '--applicationPath=' + url], {
    stdio: 'inherit',
  });
  child.on('close', code => {
    if (code !== 0) {
      console.log();
      console.log(
        chalk.red(
          'The script variable failed.'
        )
      );
      console.log(chalk.cyan(scriptPath) + ' exited with code ' + code + '.');
      console.log();
      return;
    }
  });
  return true;
}

openElectron(paths.appDevElectronMain, 'http://localhost:3000');
