const electron = require('electron');
const {download} = require('electron-dl/index');
const path = require('path');
const fs = require('fs');
const {exec} = require('child_process');


// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = electron;

// download node
let downloaded = false;
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

function checkDownload() {
  if (fs.existsSync(path.resolve(storePath, 'constant_macos'))) {
    downloaded = true;
  }
}

function runChain(info) {
  console.log(info.privateKey)
  exec(`${path.resolve(storePath, 'constant_macos')} --datadir "${path.resolve(storePath, 'data/node-0')}" --testnet --privatekey "${info.privateKey}"`, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      runChain(info);
    }
  });
}

function createWindow() {
  console.log("Init window");
  mainWindow = new BrowserWindow({
    fullscreen: false,
    icon: path.join(__dirname, 'icons/64x64.png'),
    title: 'Constant desktop wallet',
    webPreferences: {
      nodeIntegration: true
    }
  });

  console.log("Config window");
  mainWindow.maximize();
  // mainWindow.setSize(414, mainWindow.getBounds().height);
  mainWindow.setResizable(false);
  const {width} = electron.screen.getPrimaryDisplay().bounds;
  mainWindow.setPosition(width - 414, 0);
  mainWindow.setMenu(null);

  mainWindow.loadFile(path.resolve(__dirname, 'main.html'));
  mainWindow.show();

  // process event
  ipcMain.on("download", (event, info) => {
    checkDownload()
    if (!downloaded) {
      console.log("Downloading constant node into: " + storePath + " from:" + info.url);
      download(mainWindow, info.url, {
        directory: storePath,
        showBadge: true,
        onProgress: (percent) => {
          mainWindow.webContents.send("download-progress", percent);
        }
      }).then(dl => {
        console.log(dl)
        fs.chmodSync(dl.getSavePath(), '0755');
        mainWindow.webContents.send("download-complete", dl.getSavePath());
        console.log(dl.getSavePath());
      }).catch(console.error);
    } else {
      mainWindow.webContents.send("downloaded", null);
    }
  })
  ipcMain.on('startNode', (event, info) => {
    console.log(info);
    runChain(info);
  });
  // end

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
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