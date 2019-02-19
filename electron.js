const electron = require('electron');
const path = require('path');
const fs = require('fs');
const {download} = require('electron-dl');
const {exec} = require('child_process');


const {app, BrowserWindow, Menu, ipcMain} = electron;

const downloadLink = 'https://github.com/ninjadotorg/constant/releases/download/constant-0.0.2-beta/constant';

const menu = new Menu();

let win;

const userHome = process.env.HOME || process.env.USERPROFILE;
const storePath = path.resolve(userHome, '.constant');

let downloaded = false;
let downloadFinished = false;

try {
  fs.accessSync(storePath, fs.F_OK);
} catch (e) {
  fs.mkdirSync(storePath);
}

if (fs.existsSync(path.resolve(storePath, 'constant'))) {
  downloaded = true;
}

function runChain() {
  exec(`${path.resolve(storePath, 'constant')} --enablewallet --wallet "wallet" --walletpassphrase "12345678" --testnet --norpcauth --light`, (error, stdout, stderr) => {
    if (error) {
      runChain();
    }
  });
}

function createWindow() {
  win = new BrowserWindow({
    fullscreen: false,
    icon: path.join(__dirname, 'icons/64x64.png'),
    title: 'Constant desktop wallet'
  });

  win.maximize();
  win.setSize(414, win.getBounds().height);
  win.setResizable(false);
  const {width} = electron.screen.getPrimaryDisplay().bounds;
  win.setPosition(width - 414, 0);
  win.setMenu(null);

  if (!downloaded) {
    win.loadFile(path.resolve(__dirname, 'downloading.html'));
    download(win, downloadLink, {
      directory: storePath,
    })
      .then(dl => {
        downloadFinished = true;
        fs.chmodSync(dl.getSavePath(), '0755');
        runChain();
        win.loadFile(path.resolve(__dirname, 'build/index.html'));
        console.log(dl.getSavePath());
        win.show();
      })
      .catch(console.error);
  } else {
    downloadFinished = true;
    runChain();
    win.loadFile(path.resolve(__dirname, 'build/index.html'));
    win.show();
  }
}


app.on('window-all-closed', function () {
  if (!downloadFinished) {
    fs.unlinkSync(path.resolve(storePath, 'constant'));
  }
  app.quit();
});

app.commandLine.appendSwitch('disable-pinch');
app.setName('Constant desktop wallet');
app.dock.setIcon(path.relative(__dirname, 'icons/512x512.png'));
app.on('ready', createWindow);
