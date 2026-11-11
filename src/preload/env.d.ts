interface Window {
  api: {
    ping: () => string;
    getAppVersion: () => string;
    loadSettings: () => Promise<any>;
    saveSettings: (data: any) => void;
    saveScreenshot: (dataUrl: string) => Promise<boolean>;
    onMenuAction: (callback: (action: string) => void) => void;
  };
}
