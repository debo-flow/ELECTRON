import * as THREE from 'three';

export function createOrbitalMesh(positions: Float32Array, n: number) {
  const numPoints = positions.length / 3;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const colors = new Float32Array(numPoints * 3);
  const color = new THREE.Color();
  const maxRadius = 4 * n * n; // Heuristic for coloring

  for (let i = 0; i < numPoints; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    const r = Math.sqrt(x * x + y * y + z * z);
    
    // Normalize distance and map from Blue (near) to Orange (far)
    const t = Math.min(r / maxRadius, 1.0);
    color.setHSL(0.6 - t * 0.5, 1.0, 0.6); 
    
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);

  // Add the nucleus
  const nucleusGeom = new THREE.SphereGeometry(0.15, 16, 16);
  const nucleusMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
  points.add(nucleus);

  return points;
}
