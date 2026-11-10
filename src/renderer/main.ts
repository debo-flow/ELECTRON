import { setupScene } from './scene';
import { createTestPointCloud } from './pointCloud';

const canvas = document.getElementById('orbital-canvas') as HTMLCanvasElement;
const fpsCounter = document.getElementById('fps-counter') as HTMLDivElement;

// Initialize Foundation
const { scene, camera, renderer, controls } = setupScene(canvas);

// Add Test Cloud
const pointCloud = createTestPointCloud();
scene.add(pointCloud);

// FPS Tracking Variables
let lastTime = performance.now();
let frames = 0;

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Slowly auto-rotate the cloud
  pointCloud.rotation.y += 0.002;
  pointCloud.rotation.x += 0.001;

  controls.update(); // required if damping is enabled
  renderer.render(scene, camera);

  // Update FPS Counter (once per second)
  frames++;
  const time = performance.now();
  if (time >= lastTime + 1000) {
    fpsCounter.innerText = `FPS: ${Math.round((frames * 1000) / (time - lastTime))}`;
    frames = 0;
    lastTime = time;
  }
}

animate();
