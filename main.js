const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  });

  win.loadFile('index.html');

  const menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {
          label: 'Settings',
          click() {
            const prompt = require('electron-prompt');
            prompt({
              title:
                'Input sessions API URL. ex. http://127.0.0.1:6721/session',
              label: 'URL:',
              value: 'http://127.0.0.1:6721/session',
              inputAttrs: {
                type: 'url',
              },
              type: 'input',
            })
              .then((r) => {
                if (r === null) {
                  console.log('user cancelled');
                } else {
                  console.log('session api URL:' + r);
                  win.webContents.send('settingURL', r);
                }
              })
              .catch(console.error);
          },
        },
        {
          label: 'Show Dev tool',
          click() {
            win.webContents.openDevTools();
          },
        },
        {
          label: 'Exit',
          click() {
            app.quit();
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
