console.log('Renderer isolated context initialized.');
console.log('Electron version from secure IPC bridge:', window.api.getAppVersion());

// Ready for WebGL / Three.js canvas logic in future steps
const canvas = document.getElementById('orbital-canvas') as HTMLCanvasElement;
if (canvas) {
  // Setup sizing
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
