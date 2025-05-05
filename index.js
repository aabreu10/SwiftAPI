const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1e1e1e', 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
    },
    title: "SwiftAPI", 
  });

  win.loadFile('index.html');
  return win;
}

// When the app is ready, create window and check for updates
app.whenReady().then(() => {
  const mainWindow = createWindow();
  
  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();
  
  // Update event handlers
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version of SwiftAPI is available. Downloading now...',
      buttons: ['OK']
    });
  });
  
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: 'A new version has been downloaded. Restart the application to apply the updates.',
      detail: releaseName
    }).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
