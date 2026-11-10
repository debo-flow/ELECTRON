import * as THREE from 'three';

export function createTestPointCloud(): THREE.Points {
  const particleCount = 20000;
  const radius = 5;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    // Generate uniform random points inside a sphere
    const u = Math.random();
    const v = Math.random();
    const theta = 2.0 * Math.PI * u;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * radius;

    const sinPhi = Math.sin(phi);
    
    positions[i * 3] = r * sinPhi * Math.cos(theta);     // x
    positions[i * 3 + 1] = r * sinPhi * Math.sin(theta); // y
    positions[i * 3 + 2] = r * Math.cos(phi);            // z
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x88ccff, // semi-transparent white-blue
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false // Prevents sorting artifacts with transparency
  });

  return new THREE.Points(geometry, material);
}
