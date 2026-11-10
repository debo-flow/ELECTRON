import { contextBridge } from 'electron';

const api = {
  ping: () => 'pong',
  getAppVersion: () => process.versions.electron
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (handled in global type def)
  window.api = api;
}
