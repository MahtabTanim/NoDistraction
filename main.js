import { app, BrowserWindow, Tray, ipcMain, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

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
    width: 360,
    height: 816,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
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
