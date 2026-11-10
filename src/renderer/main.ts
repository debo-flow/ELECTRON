import { setupScene } from './scene';
import { createOrbitalMesh } from './pointCloud';
import { Store } from './state';
import { getOrbitalLabel } from './ui/labels';
import * as THREE from 'three';

// 1. Initial State & DOM bindings
const store = new Store({ n: 2, l: 1, m: 0, numPoints: 100000, autoRotate: true, showAxes: true, showNucleus: true });

const els = {
  n: document.getElementById('input-n') as HTMLInputElement,
  l: document.getElementById('input-l') as HTMLInputElement,
  m: document.getElementById('input-m') as HTMLInputElement,
  points: document.getElementById('input-points') as HTMLInputElement,
  valN: document.getElementById('val-n') as HTMLSpanElement,
  valL: document.getElementById('val-l') as HTMLSpanElement,
  valM: document.getElementById('val-m') as HTMLSpanElement,
  valPoints: document.getElementById('val-points') as HTMLSpanElement,
  preset: document.getElementById('preset-select') as HTMLSelectElement,
  label: document.getElementById('orbital-label') as HTMLDivElement,
  resample: document.getElementById('btn-resample') as HTMLButtonElement,
  resetView: document.getElementById('btn-reset-view') as HTMLButtonElement,
  chkRotate: document.getElementById('chk-rotate') as HTMLInputElement,
  chkAxes: document.getElementById('chk-axes') as HTMLInputElement,
  chkNucleus: document.getElementById('chk-nucleus') as HTMLInputElement,
  sidebar: document.getElementById('sidebar') as HTMLDivElement,
  toggleBtn: document.getElementById('toggle-btn') as HTMLButtonElement,
  loading: document.getElementById('loading-indicator') as HTMLSpanElement,
  infoLine: document.getElementById('info-line') as HTMLSpanElement
};

// 2. Scene Setup
const { scene, camera, renderer, controls } = setupScene(document.getElementById('orbital-canvas') as HTMLCanvasElement);

// Extract AxesHelper to toggle visibility safely
const axesHelper = scene.children.find(c => c instanceof THREE.AxesHelper) as THREE.AxesHelper;

// Add Global Nucleus
const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
scene.add(nucleus);

// 3. Worker & Rendering variables
let currentPointCloud: THREE.Points | null = null;
let fadingOutClouds: THREE.Points[] = [];
let targetCameraPos = new THREE.Vector3();
let targetControlsPos = new THREE.Vector3();

const worker = new Worker(new URL('./physics/sampler.worker.ts', import.meta.url), { type: 'module' });
let currentJobId = 0;
let debounceTimer: ReturnType<typeof setTimeout>;

// 4. Worker Communication
worker.onmessage = (e) => {
  const { jobId, positions, n, timeMs, numPoints } = e.data;
  if (jobId !== currentJobId) return; // Stale job

  els.loading.classList.remove('active');
  els.infoLine.innerText = `Points: ${(numPoints/1000).toFixed(0)}k | Time: ${timeMs.toFixed(0)}ms`;

  if (currentPointCloud) {
    fadingOutClouds.push(currentPointCloud);
  }
  
  currentPointCloud = createOrbitalMesh(positions, n);
  scene.add(currentPointCloud);
  
  // Update camera targets
  targetCameraPos.set(0, 0, 4 * n * n);
  targetControlsPos.set(0, 0, 0);
};

function requestSample() {
  els.loading.classList.add('active');
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentJobId++;
    const state = store.getState();
    worker.postMessage({ jobId: currentJobId, ...state });
  }, 200);
}

// 5. Connect UI -> Store
els.n.oninput = (e) => store.setState({ n: parseInt((e.target as HTMLInputElement).value) });
els.l.oninput = (e) => store.setState({ l: parseInt((e.target as HTMLInputElement).value) });
els.m.oninput = (e) => store.setState({ m: parseInt((e.target as HTMLInputElement).value) });
els.points.oninput = (e) => store.setState({ numPoints: parseInt((e.target as HTMLInputElement).value) });
els.chkRotate.onchange = (e) => store.setState({ autoRotate: (e.target as HTMLInputElement).checked });
els.chkAxes.onchange = (e) => store.setState({ showAxes: (e.target as HTMLInputElement).checked });
els.chkNucleus.onchange = (e) => store.setState({ showNucleus: (e.target as HTMLInputElement).checked });

els.resample.onclick = requestSample;
els.resetView.onclick = () => {
  const { n } = store.getState();
  camera.position.set(0, 0, 4 * n * n);
  controls.target.set(0, 0, 0);
};

els.preset.onchange = (e) => {
  const val = (e.target as HTMLSelectElement).value;
  if (val === 'random') {
    const n = Math.floor(Math.random() * 5) + 1;
    const l = Math.floor(Math.random() * n);
    const m = Math.floor(Math.random() * (2 * l + 1)) - l;
    store.setState({ n, l, m });
  } else {
    const [n, l, m] = val.split(',').map(Number);
    store.setState({ n, l, m });
  }
};

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'h') els.sidebar.classList.toggle('open');
});
els.toggleBtn.onclick = () => els.sidebar.classList.toggle('open');

// 6. Connect Store -> UI
store.subscribe((state, prev) => {
  // Update labels and values
  els.valN.innerText = state.n.toString();
  els.valL.innerText = state.l.toString();
  els.valM.innerText = state.m.toString();
  els.valPoints.innerText = `${(state.numPoints/1000).toFixed(0)}k`;
  els.label.innerText = getOrbitalLabel(state.n, state.l, state.m);

  // Sync sliders and restrict bounds
  els.n.value = state.n.toString();
  els.l.value = state.l.toString();
  els.l.max = (state.n - 1).toString();
  els.l.disabled = (state.n - 1) === 0;
  
  els.m.value = state.m.toString();
  els.m.min = (-state.l).toString();
  els.m.max = state.l.toString();
  els.m.disabled = state.l === 0;
  
  els.points.value = state.numPoints.toString();

  // Handle visuals
  if (axesHelper) axesHelper.visible = state.showAxes;
  nucleus.visible = state.showNucleus;

  // Request new compute if physics parameters changed
  if (state.n !== prev.n || state.l !== prev.l || state.m !== prev.m || state.numPoints !== prev.numPoints) {
    requestSample();
  }
});

// 7. Animation & Transitions
const fpsCounter = document.getElementById('fps-counter') as HTMLDivElement;
let lastTime = performance.now();
let frames = 0;

function animate() {
  requestAnimationFrame(animate);
  const state = store.getState();

  // Smooth Camera transition (Lerp)
  camera.position.lerp(targetCameraPos, 0.05);
  controls.target.lerp(targetControlsPos, 0.05);

  if (currentPointCloud) {
    if (state.autoRotate) currentPointCloud.rotation.y += 0.001;
    // Fade in new material
    if (currentPointCloud.material.opacity < 0.4) {
      currentPointCloud.material.opacity += 0.02;
    }
  }

  // Fade out and cleanup old clouds
  for (let i = fadingOutClouds.length - 1; i >= 0; i--) {
    const cloud = fadingOutClouds[i];
    if (state.autoRotate) cloud.rotation.y += 0.001;
    cloud.material.opacity -= 0.05;
    if (cloud.material.opacity <= 0) {
      scene.remove(cloud);
      cloud.geometry.dispose();
      (cloud.material as THREE.Material).dispose();
      fadingOutClouds.splice(i, 1);
    }
  }

  controls.update();
  renderer.render(scene, camera);

  // FPS
  frames++;
  const time = performance.now();
  if (time >= lastTime + 1000) {
    fpsCounter.innerText = `FPS: ${Math.round((frames * 1000) / (time - lastTime))}`;
    frames = 0; 
    lastTime = time;
  }
}

animate();

