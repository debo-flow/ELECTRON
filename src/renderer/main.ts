import { setupScene } from './scene';
import { createOrbitalMesh } from './pointCloud';
import type * as THREE from 'three';

const canvas = document.getElementById('orbital-canvas') as HTMLCanvasElement;
const fpsCounter = document.getElementById('fps-counter') as HTMLDivElement;
const uiSelect = document.getElementById('orbital-select') as HTMLSelectElement;
const loadingText = document.getElementById('loading') as HTMLSpanElement;

const { scene, camera, renderer, controls } = setupScene(canvas);

let currentPointCloud: THREE.Points | null = null;
const worker = new Worker(new URL('./physics/sampler.worker.ts', import.meta.url), { type: 'module' });

worker.onmessage = (e) => {
  const { positions, n } = e.data;
  
  if (currentPointCloud) scene.remove(currentPointCloud);
  
  currentPointCloud = createOrbitalMesh(positions, n);
  scene.add(currentPointCloud);
  
  // Auto-fit camera
  camera.position.set(0, 0, 4 * n * n);
  controls.target.set(0, 0, 0);
  controls.update();

  loadingText.style.display = 'none';
};

function loadOrbital() {
  loadingText.style.display = 'inline';
  const [n, l, m] = uiSelect.value.split(',').map(Number);
  worker.postMessage({ n, l, m, numPoints: 100000 });
}

// Initial load & listeners
loadOrbital();
uiSelect.addEventListener('change', loadOrbital);

// FPS & Animation variables
let lastTime = performance.now();
let frames = 0;

function animate() {
  requestAnimationFrame(animate);

  if (currentPointCloud) {
    currentPointCloud.rotation.y += 0.001;
  }

  controls.update();
  renderer.render(scene, camera);

  frames++;
  const time = performance.now();
  if (time >= lastTime + 1000) {
    fpsCounter.innerText = `FPS: ${Math.round((frames * 1000) / (time - lastTime))}`;
    frames = 0;
    lastTime = time;
  }
}

animate();
