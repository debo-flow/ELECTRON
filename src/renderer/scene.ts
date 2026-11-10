import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function setupScene(canvas: HTMLCanvasElement) {
  // 1. Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0f11);

  // 2. Camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 12);

  // 3. Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 4. Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // 5. Axes Helper (Faint)
  const axesHelper = new THREE.AxesHelper(3);
  const axesMaterial = axesHelper.material as THREE.LineBasicMaterial;
  axesMaterial.transparent = true;
  axesMaterial.opacity = 0.3;
  scene.add(axesHelper);

  // 6. Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls };
}
