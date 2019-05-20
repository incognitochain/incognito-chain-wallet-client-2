const path = require('path');
const BrowserWindow = require('electron').remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;

const openWalletWindowButton = document.getElementById('openWallet');
openWalletWindowButton.addEventListener('click', (event) => {
  console.log("Init wallet window");
  walletWindow = new BrowserWindow({
    fullscreen: false,
    icon: path.join(__dirname, 'icons/64x64.png'),
    title: 'Constant desktop wallet',
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  console.log("Config wallet window");
  walletWindow.maximize();
  walletWindow.setSize(414, walletWindow.getBounds().height);
  walletWindow.setResizable(false);
  walletWindow.setMenu(null);
  walletWindow.loadFile(path.resolve(__dirname, '../dist/index.html'));
  walletWindow.on('closed', function () {
    walletWindow = null
  });
  walletWindow.show()
});

const downloadNode = document.getElementById('downloadNode');
downloadNode.addEventListener('click', (event) => {
  ipcRenderer.send("download", {
    url: "https://github.com/constant-money/constant-chain/releases/download/20190515_1/constant_macos",
    properties: {directory: null}
  });
});

const startNode = document.getElementById("startNode");
startNode.addEventListener("click", (event) => {
  ipcRenderer.send("startNode", {
    privateKey: document.getElementById("privateKey").value,
    nodemode: 'auto',
    discoverpeersaddress: '172.104.39.6:9330',
    datadir: 'data/node-0',
    testnet: true,
  });
});

const stopNode = document.getElementById("stopNode");
stopNode.addEventListener("click", (ev) => {
  ipcRenderer.send("stopNode", {});
});

ipcRenderer.on("downloaded", (event, file) => {
  alert("Downloaded");
});

ipcRenderer.on("download-complete", (event, file) => {
  alert("Download complete" + file);
  console.log(file); // Full file path
});

ipcRenderer.on("download-progress", (event, progress) => {
  console.log(progress); // Progress in fraction, between 0 and 1
  const progressInPercentages = progress * 100; // With decimal point and a bunch of numbers
  const cleanProgressInPercentages = Math.floor(progress * 100); // Without decimal point
  console.log(cleanProgressInPercentages);
  document.getElementById("downloadPercent").innerText = cleanProgressInPercentages;
});

ipcRenderer.on("startNodeError", (event, info) => {
  console.log(info);
  alert(info.error);
})

ipcRenderer.on('stdout', (event, info) => {
  let logInfo = document.getElementById('logInfo')
  logInfo.value += info;
  logInfo.scrollTop = logInfo.scrollHeight;
});

ipcRenderer.on('stderr', (event, info) => {
  let logErr = document.getElementById('logErr');
  logErr.value += info;
  logErr.scrollTop = logErr.scrollHeight;
});