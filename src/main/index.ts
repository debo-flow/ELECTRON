import { app, BrowserWindow, ipcMain, Menu, dialog, shell } from 'electron';
import { join } from 'path';
import fs from 'fs';

const settingsPath = join(app.getPath('userData'), 'orbital-settings.json');

function createWindow(): void {
  // Read saved bounds if they exist
  let bounds = { width: 1024, height: 768 };
  try {
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (data.bounds) bounds = data.bounds;
    }
  } catch (e) {}

  const mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  mainWindow.on('close', () => {
    try {
      const currentBounds = mainWindow.getBounds();
      const data = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : {};
      data.bounds = currentBounds;
      fs.writeFileSync(settingsPath, JSON.stringify(data));
    } catch (e) {}
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  // Setup Application Menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'Save Screenshot as PNG', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('menu-action', 'screenshot') },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Panel', accelerator: 'H', click: () => mainWindow.webContents.send('menu-action', 'toggle-panel') },
        { label: 'Presentation Mode', accelerator: 'P', click: () => mainWindow.webContents.send('menu-action', 'presentation') },
        { label: 'Toggle Fullscreen', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Reset View', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.webContents.send('menu-action', 'reset-view') }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Open GitHub Repo', click: () => shell.openExternal('https://github.com') }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  // electron-vite specific routing
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// IPC Handlers for Settings & Screenshots
ipcMain.handle('settings:load', () => {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
  } catch (e) {}
  return null;
});

ipcMain.on('settings:save', (_, data) => {
  try {
    // Merge with bounds so we don't overwrite window size
    const existing = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : {};
    fs.writeFileSync(settingsPath, JSON.stringify({ ...existing, ...data }));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
});

ipcMain.handle('save-screenshot', async (_, dataUrl: string) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Save Screenshot',
    defaultPath: 'orbital.png',
    filters: [{ name: 'Images', extensions: ['png'] }]
  });
  
  if (filePath) {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(filePath, base64Data, 'base64');
    return true;
  }
  return false;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
