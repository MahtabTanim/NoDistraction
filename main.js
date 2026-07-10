import { app, BrowserWindow, Tray, Menu, ipcMain, screen, shell, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let tray = null;

// Hide Dock icon on macOS
if (app.dock) {
  app.dock.hide();
}

const isDev = process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 432,
    height: 816,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  if (isDev) {
    // In development, load from Vite dev server
    const loadURL = () => {
      mainWindow.loadURL('http://localhost:5173').catch(() => {
        // Retry if Vite isn't ready yet
        setTimeout(loadURL, 500);
      });
    };
    loadURL();
    // Open DevTools in dev if needed (optional)
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, load the built HTML
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Hide the window when it loses focus
  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'trayIcon.png');
  tray = new Tray(iconPath);
  tray.setToolTip('NoDistraction Pomodoro');
  tray.setTitle('');

  tray.on('click', (event, bounds) => {
    toggleWindow(bounds);
  });

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Toggle Window', click: () => toggleWindow(tray.getBounds()) },
    { type: 'separator' },
    { label: 'Pause / Resume', accelerator: 'CmdOrCtrl+Alt+P', click: () => mainWindow?.webContents.send('global-action', 'pause') },
    { label: 'Skip / Cancel', accelerator: 'CmdOrCtrl+Alt+S', click: () => mainWindow?.webContents.send('global-action', 'skip') },
    { type: 'separator' },
    { label: 'Quit', role: 'quit' }
  ]);
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu);
  });
}

function toggleWindow(trayBounds) {
  if (!mainWindow) {
    createWindow();
  }

  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow(trayBounds || tray.getBounds());
  }
}

function showWindow(trayBounds) {
  const windowBounds = mainWindow.getBounds();
  const display = screen.getDisplayMatching(trayBounds);
  const screenBounds = display.workArea;

  // Center window horizontally under the tray icon
  let x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
  // Place window just below the tray bar
  let y = Math.round(trayBounds.y + trayBounds.height + 4);

  // Clamp x to stay inside screen work area
  const screenRight = screenBounds.x + screenBounds.width;
  if (x < screenBounds.x) {
    x = screenBounds.x;
  } else if (x + windowBounds.width > screenRight) {
    x = screenRight - windowBounds.width - 10;
  }

  mainWindow.setPosition(x, y, false);
  mainWindow.show();
  mainWindow.focus();
}

app.whenReady().then(() => {
  createTray();
  createWindow();

  // Check for updates after a 3s startup delay
  setTimeout(checkForUpdates, 3000);

  // Register Global Shortcuts
  globalShortcut.register('CommandOrControl+Alt+P', () => {
    if (mainWindow) mainWindow.webContents.send('global-action', 'pause');
  });

  globalShortcut.register('CommandOrControl+Alt+S', () => {
    if (mainWindow) mainWindow.webContents.send('global-action', 'skip');
  });

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC communication
ipcMain.on('update-tray-title', (event, title) => {
  if (tray) {
    tray.setTitle(title || '');
  }
});

ipcMain.on('quit-app', () => {
  app.quit();
});

ipcMain.on('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on('open-update-link', (event, url) => {
  shell.openExternal(url || 'https://github.com/MahtabTanim/NoDistraction/releases');
});

function checkForUpdates() {
  const options = {
    hostname: 'api.github.com',
    path: '/repos/MahtabTanim/NoDistraction/releases/latest',
    method: 'GET',
    headers: {
      'User-Agent': 'NoDistraction-App'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        if (res.statusCode === 200) {
          const release = JSON.parse(data);
          const latestVersion = release.tag_name;
          const currentVersion = `v${app.getVersion()}`;
          
          if (latestVersion && latestVersion !== currentVersion) {
            const sendUpdateInfo = () => {
              if (mainWindow && !mainWindow.webContents.isLoading()) {
                mainWindow.webContents.send('update-available', {
                  version: latestVersion,
                  url: release.html_url
                });
              } else {
                setTimeout(sendUpdateInfo, 1000);
              }
            };
            sendUpdateInfo();
          }
        }
      } catch (err) {
        console.error('Error parsing update response:', err);
      }
    });
  });

  req.on('error', (err) => {
    console.error('Update check failed:', err);
  });

  req.end();
}
