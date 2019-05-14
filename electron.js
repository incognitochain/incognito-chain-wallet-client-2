const electron = require('electron');
const path = require('path');

// Modules to control application life and create native browser window
const {app, BrowserWindow} = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: false,
    icon: path.join(__dirname, 'icons/64x64.png'),
    title: 'Constant desktop wallet',
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.maximize();
  mainWindow.setSize(414, mainWindow.getBounds().height);
  mainWindow.setResizable(false);
  const {width} = electron.screen.getPrimaryDisplay().bounds;
  mainWindow.setPosition(width - 414, 0);
  mainWindow.setMenu(null);

  // mainWindow.loadFile(path.resolve(__dirname, 'dist/index.html'));
  mainWindow.loadURL("http://localhost:8080")

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

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
app.dock.setIcon(path.relative(__dirname, 'icons/512x512.png'));
app.on('ready', createWindow);
app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})