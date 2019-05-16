const electron = require('electron');
const {download} = require('electron-dl/index');
const path = require('path');
const fs = require('fs');
const {exec} = require('child_process');


// Modules to control application life and create native browser window
const {app, BrowserWindow} = electron;

// download node
const downloadLink = 'https://github.com/constant-money/constant-chain/releases/download/20190515_1/constant_macos';
let downloaded = false;
let downloadFinished = false;
const userHome = process.env.HOME || process.env.USERPROFILE;
const storePath = path.resolve(userHome, '.constant');
console.log(storePath)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

try {
  fs.accessSync(storePath, fs.F_OK);
} catch (e) {
  fs.mkdirSync(storePath);
}

if (fs.existsSync(path.resolve(storePath, 'constant_macos'))) {
  downloaded = true;
}

function runChain() {
  exec(`${path.resolve(storePath, 'constant_macos')} --datadir "${path.resolve(storePath, 'data/node-0')}" --testnet`, (error, stdout, stderr) => {
    if (error) {
      runChain();
    }
  });
}

function createWindow() {
  console.log("Init window");
  mainWindow = new BrowserWindow({
    fullscreen: false,
    icon: path.join(__dirname, 'icons/64x64.png'),
    title: 'Constant desktop wallet',
  });

  console.log("Config window");
  mainWindow.maximize();
  mainWindow.setSize(414, mainWindow.getBounds().height);
  mainWindow.setResizable(false);
  const {width} = electron.screen.getPrimaryDisplay().bounds;
  mainWindow.setPosition(width - 414, 0);
  mainWindow.setMenu(null);

  if (!downloaded) {
    console.log("Downloading constant node into:" + storePath);
    mainWindow.loadFile(path.resolve(__dirname, 'downloading.html'));
    download(mainWindow, downloadLink, {
      directory: storePath,
    })
      .then(dl => {
        downloadFinished = true;
        fs.chmodSync(dl.getSavePath(), '0755');
        runChain();
        mainWindow.loadFile(path.resolve(__dirname, '../dist/index.html'));
        console.log(dl.getSavePath());
      })
      .catch(console.error);
  } else {
    downloadFinished = true;
    runChain();
    mainWindow.loadFile(path.resolve(__dirname, '../dist/index.html'));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.show();
}


app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  app.quit()
  // }
});

app.commandLine.appendSwitch('disable-pinch');
app.setName('Constant desktop wallet');
app.dock.setIcon(path.resolve(__dirname, '../icons/512x512.png'));
app.on('ready', createWindow);
app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})