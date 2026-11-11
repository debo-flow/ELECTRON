import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { setupScene } from './scene';
import { createOrbitalMesh } from './pointCloud';
import { Store, defaultState, validateSettings, THEMES } from './state';
import { getOrbitalLabel } from './ui/labels';

// Scene Setup
const canvas = document.getElementById('orbital-canvas') as HTMLCanvasElement;
const { scene, camera, renderer, controls } = setupScene(canvas);
const axesHelper = scene.children.find(c => c instanceof THREE.AxesHelper) as THREE.AxesHelper;
const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
scene.add(nucleus);

// Post Processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.4, 0.1);
composer.addPass(bloomPass);

// Engine variables
let currentPointCloud: THREE.Points | null = null;
let fadingOutClouds: THREE.Points[] = [];
let targetCameraPos = new THREE.Vector3();
let targetControlsPos = new THREE.Vector3();
let clock = new THREE.Clock();

const worker = new Worker(new URL('./physics/sampler.worker.ts', import.meta.url), { type: 'module' });
let currentJobId = 0;
let debounceTimer: ReturnType<typeof setTimeout>;

// DOM Elements
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
  
  colorMode: document.getElementById('color-mode') as HTMLSelectElement,
  theme: document.getElementById('theme-select') as HTMLSelectElement,
  bgColor: document.getElementById('bg-color') as HTMLInputElement,
  monoColor: document.getElementById('mono-color') as HTMLInputElement,
  pointSize: document.getElementById('point-size') as HTMLInputElement,
  pointOpacity: document.getElementById('point-opacity') as HTMLInputElement,
  glowIntensity: document.getElementById('glow-intensity') as HTMLInputElement,
  
  chkBloom: document.getElementById('chk-bloom') as HTMLInputElement,
  chkPulse: document.getElementById('chk-pulse') as HTMLInputElement,
  chkMotion: document.getElementById('chk-motion') as HTMLInputElement,
  chkRotate: document.getElementById('chk-rotate') as HTMLInputElement,
  chkAxes: document.getElementById('chk-axes') as HTMLInputElement,
  chkNucleus: document.getElementById('chk-nucleus') as HTMLInputElement,
  
  btnResetSettings: document.getElementById('btn-reset-settings') as HTMLButtonElement,
  sidebar: document.getElementById('sidebar') as HTMLDivElement,
  toggleBtn: document.getElementById('toggle-btn') as HTMLButtonElement,
  loading: document.getElementById('loading-indicator') as HTMLSpanElement,
  infoLine: document.getElementById('info-line') as HTMLSpanElement,
  fpsCounter: document.getElementById('fps-counter') as HTMLDivElement,
  fpsWarning: document.getElementById('fps-warning') as HTMLDivElement
};

// Initialize Application
window.api.loadSettings().then(saved => {
  const store = new Store(validateSettings(saved));
  
  worker.onmessage = (e) => {
    const { jobId, positions, phases, densities, n, timeMs, numPoints } = e.data;
    if (jobId !== currentJobId) return;
    
    els.loading.classList.remove('active');
    els.infoLine.innerText = `Points: ${(numPoints/1000).toFixed(0)}k | Time: ${timeMs.toFixed(0)}ms`;

    if (currentPointCloud) fadingOutClouds.push(currentPointCloud);
    
    currentPointCloud = createOrbitalMesh(positions, phases, densities, n);
    scene.add(currentPointCloud);
    
    targetCameraPos.set(0, 0, 4 * n * n);
    targetControlsPos.set(0, 0, 0);
    updateUniforms();
  };

  function requestSample() {
    els.loading.classList.add('active');
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentJobId++;
      worker.postMessage({ jobId: currentJobId, ...store.getState() });
    }, 200);
  }

  function updateUniforms() {
    if (!currentPointCloud) return;
    const state = store.getState();
    const mat = currentPointCloud.material as THREE.ShaderMaterial;
    
    mat.uniforms.uColorMode.value = state.colorMode;
    mat.uniforms.uPointSize.value = state.pointSize;
    mat.uniforms.uPulse.value = state.pulseEnabled ? 1 : 0;
    mat.uniforms.uMotion.value = state.motionEnabled ? 1 : 0;
    mat.uniforms.uMotionSpeed.value = state.motionSpeed;
    
    const palette = THEMES[state.theme] || THEMES.neon;
    if (state.colorMode === 3) {
      mat.uniforms.uColor1.value.setStyle(state.monoColor);
      mat.uniforms.uColor2.value.setStyle(state.monoColor);
    } else {
      mat.uniforms.uColor1.value.setHex(palette.c1);
      mat.uniforms.uColor2.value.setHex(palette.c2);
    }
  }

  // Input Bindings -> Store Updates
  els.n.oninput = (e) => store.setState({ n: parseInt((e.target as HTMLInputElement).value) });
  els.l.oninput = (e) => store.setState({ l: parseInt((e.target as HTMLInputElement).value) });
  els.m.oninput = (e) => store.setState({ m: parseInt((e.target as HTMLInputElement).value) });
  els.points.oninput = (e) => store.setState({ numPoints: parseInt((e.target as HTMLInputElement).value) });
  els.colorMode.onchange = (e) => store.setState({ colorMode: parseInt((e.target as HTMLSelectElement).value) });
  els.theme.onchange = (e) => store.setState({ theme: (e.target as HTMLSelectElement).value });
  els.bgColor.oninput = (e) => store.setState({ bgColor: (e.target as HTMLInputElement).value });
  els.monoColor.oninput = (e) => store.setState({ monoColor: (e.target as HTMLInputElement).value });
  els.pointSize.oninput = (e) => store.setState({ pointSize: parseFloat((e.target as HTMLInputElement).value) });
  els.pointOpacity.oninput = (e) => store.setState({ pointOpacity: parseFloat((e.target as HTMLInputElement).value) });
  els.glowIntensity.oninput = (e) => store.setState({ glowIntensity: parseFloat((e.target as HTMLInputElement).value) });
  els.chkBloom.onchange = (e) => store.setState({ bloomEnabled: (e.target as HTMLInputElement).checked });
  els.chkPulse.onchange = (e) => store.setState({ pulseEnabled: (e.target as HTMLInputElement).checked });
  els.chkMotion.onchange = (e) => store.setState({ motionEnabled: (e.target as HTMLInputElement).checked });
  els.chkRotate.onchange = (e) => store.setState({ autoRotate: (e.target as HTMLInputElement).checked });
  els.chkAxes.onchange = (e) => store.setState({ showAxes: (e.target as HTMLInputElement).checked });
  els.chkNucleus.onchange = (e) => store.setState({ showNucleus: (e.target as HTMLInputElement).checked });

  els.resample.onclick = requestSample;
  els.resetView.onclick = () => {
    const { n } = store.getState();
    camera.position.set(0, 0, 4 * n * n);
    controls.target.set(0, 0, 0);
  };
  els.btnResetSettings.onclick = () => {
    store.setState(defaultState);
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

  // Store Bindings -> UI Updates
  store.subscribe((state, prev) => {
    window.api.saveSettings(state); // Persist to main process
    
    // Text and sliders
    els.valN.innerText = state.n.toString(); els.n.value = state.n.toString();
    els.valL.innerText = state.l.toString(); els.l.value = state.l.toString();
    els.valM.innerText = state.m.toString(); els.m.value = state.m.toString();
    els.valPoints.innerText = `${(state.numPoints/1000).toFixed(0)}k`; els.points.value = state.numPoints.toString();
    els.label.innerText = getOrbitalLabel(state.n, state.l, state.m);
    
    els.l.max = (state.n - 1).toString(); els.l.disabled = (state.n - 1) === 0;
    els.m.min = (-state.l).toString(); els.m.max = state.l.toString(); els.m.disabled = state.l === 0;

    els.colorMode.value = state.colorMode.toString();
    els.theme.value = state.theme;
    els.bgColor.value = state.bgColor;
    els.monoColor.value = state.monoColor;
    els.pointSize.value = state.pointSize.toString();
    els.pointOpacity.value = state.pointOpacity.toString();
    els.glowIntensity.value = state.glowIntensity.toString();
    
    els.chkBloom.checked = state.bloomEnabled;
    els.chkPulse.checked = state.pulseEnabled;
    els.chkMotion.checked = state.motionEnabled;
    els.chkRotate.checked = state.autoRotate;
    els.chkAxes.checked = state.showAxes;
    els.chkNucleus.checked = state.showNucleus;

    // Apply direct visuals
    scene.background = new THREE.Color(state.bgColor);
    if (axesHelper) axesHelper.visible = state.showAxes;
    nucleus.visible = state.showNucleus;
    bloomPass.strength = state.bloomEnabled ? state.glowIntensity : 0.0;
    
    updateUniforms();

    // Trigger resampling if physical parameters change
    if (state.n !== prev.n || state.l !== prev.l || state.m !== prev.m || state.numPoints !== prev.numPoints) {
      requestSample();
    }
  });

  // Native App Menu IPC listeners
  window.api.onMenuAction((action) => {
    if (action === 'toggle-panel') els.sidebar.classList.toggle('open');
    if (action === 'presentation') document.body.classList.toggle('presentation');
    if (action === 'reset-view') {
      const { n } = store.getState();
      camera.position.set(0, 0, 4 * n * n); controls.target.set(0, 0, 0);
    }
    if (action === 'screenshot') {
      composer.render(); // Ensure buffer is flushed
      window.api.saveScreenshot(canvas.toDataURL('image/png'));
    }
  });

  // Animation Loop
  let lastTime = performance.now();
  let frames = 0;

  function animate() {
    requestAnimationFrame(animate);
    const state = store.getState();
    const dt = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    camera.position.lerp(targetCameraPos, 0.05);
    controls.target.lerp(targetControlsPos, 0.05);

    if (currentPointCloud) {
      const mat = currentPointCloud.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = elapsedTime;
      if (state.autoRotate) currentPointCloud.rotation.y += dt * 0.5;
      
      // Fade in newly created materials smoothly
      if (mat.uniforms.uOpacity.value < state.pointOpacity) {
        mat.uniforms.uOpacity.value = Math.min(state.pointOpacity, mat.uniforms.uOpacity.value + dt * 2.0);
      } else {
        mat.uniforms.uOpacity.value = state.pointOpacity;
      }
    }

    // Process old fading clouds
    for (let i = fadingOutClouds.length - 1; i >= 0; i--) {
      const cloud = fadingOutClouds[i];
      if (state.autoRotate) cloud.rotation.y += dt * 0.5;
      const mat = cloud.material as THREE.ShaderMaterial;
      mat.uniforms.uOpacity.value -= dt * 3.0;
      if (mat.uniforms.uOpacity.value <= 0) {
        scene.remove(cloud);
        cloud.geometry.dispose();
        mat.dispose();
        fadingOutClouds.splice(i, 1);
      }
    }

    controls.update();
    composer.render(); // Render with post-processing

    frames++;
    const time = performance.now();
    if (time >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (time - lastTime));
      els.fpsCounter.innerText = `FPS: ${fps}`;
      els.fpsWarning.style.display = (fps < 30 && state.numPoints >= 100000) ? 'block' : 'none';
      frames = 0; 
      lastTime = time;
    }
  }

  requestSample(); // Run initial calculation
  animate();
});
