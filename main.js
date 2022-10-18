/* eslint-disable @typescript-eslint/no-var-requires */
console.log('Autorun.js');

const electron = require('electron');

const { app, BrowserWindow, session } = electron;

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {

  // startDevToolsInstall();

  // Create the browser window.
  // win = new BrowserWindow({width: 1400, height: 800});
  // win = new BrowserWindow({ width: 1400, height: 1100 });

  console.log('__dirname=', __dirname);

  win = new BrowserWindow({
    width: 1400,
    height: 1100,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // session.defaultSession.loadExtension('/Users/tedshaffer/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0')
  session.defaultSession.loadExtension('/Users/tedshaffer/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/3.0.11_7')
    .then(({ id }) => {
      console.log('redux extension id');
      console.log(id);
      // Open the DevTools.
      win.webContents.openDevTools();
    });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

function startDevToolsInstall() {
  const devToolsInstaller = require('electron-devtools-installer');
  const installer = devToolsInstaller.default;
  installer(devToolsInstaller.REACT_DEVELOPER_TOOLS)
    .then((name) => console.info(`extension installed: ${name}`))
    .catch((err) => console.error(`error installing extension REACT_DEVELOPER_TOOLS: ${err}`));
  // installer(devToolsInstaller.REACT_PERF)
  //   .then((name) => console.info(`extension installed: ${name}`))
  //   .catch((err) => console.error(`error installing extension REACT_PERF: ${err}`));
  installer(devToolsInstaller.REDUX_DEVTOOLS)
    .then((name) => console.info(`extension installed: ${name}`))
    .catch((err) => console.error(`error installing extension REDUX_DEVTOOLS: ${err}`));
}


