import { contextBridge, ipcRenderer } from 'electron';

const api = {
  ping: () => 'pong',
  getAppVersion: () => process.versions.electron,
  loadSettings: () => ipcRenderer.invoke('settings:load'),
  saveSettings: (data: any) => ipcRenderer.send('settings:save', data),
  saveScreenshot: (dataUrl: string) => ipcRenderer.invoke('save-screenshot', dataUrl),
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu-action', (_, action) => callback(action));
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.api = api;
}
