const { app, BrowserWindow,shell} = require('electron');
const path = require('path');
const fs = require('fs');
const startServer = require('./server');
let currentPath = "C:\\OCR\\";
const os = require('os');
const moment = require('moment')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: './src/icons/dna.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
      webSecurity:false
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  mainWindow.maximize()
  mainWindow.once('ready-to-show', () => {
    // mainWindow.webContents.openDevTools();
  }); 
  startServer();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function simpleLog(log) {
  if(log)
    fs.appendFileSync(path.join(currentPath,'log.log'),moment().format('YYYY-MM-DD HH:mm:ss')+"  "+ log.toString() + os.EOL);
}

process.on('uncaughtException', function (err) {
  console.error('An uncaught error occurred!');
  simpleLog(e.stack.toString());
  console.error(err.stack);
  app.quit();
});