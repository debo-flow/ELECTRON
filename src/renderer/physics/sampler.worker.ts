import { probabilityDensity, wavefunction } from './hydrogen';

self.onmessage = (e) => {
  const { jobId, n, l, m, numPoints } = e.data;
  const t0 = performance.now();
  
  const positions = new Float32Array(numPoints * 3);
  const phases = new Float32Array(numPoints);
  const densities = new Float32Array(numPoints);

  const rStart = n * n;
  let x = rStart / Math.sqrt(3), y = rStart / Math.sqrt(3), z = rStart / Math.sqrt(3);
  let p = probabilityDensity(n, l, m, x, y, z);

  const stepSize = n; 
  const burnIn = 10000;
  let maxDensity = 0;
  
  for (let i = -burnIn; i < numPoints; i++) {
    for (let j = 0; j < (i < 0 ? 1 : 10); j++) {
      const nx = x + (Math.random() - 0.5) * stepSize;
      const ny = y + (Math.random() - 0.5) * stepSize;
      const nz = z + (Math.random() - 0.5) * stepSize;
      const np = probabilityDensity(n, l, m, nx, ny, nz);
      
      if (np >= p || Math.random() < np / p) {
        x = nx; y = ny; z = nz; p = np;
      }
    }
    if (i >= 0) {
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      const psi = wavefunction(n, l, m, x, y, z);
      phases[i] = Math.sign(psi);
      densities[i] = p;
      if (p > maxDensity) maxDensity = p;
    }
  }

  // Normalize densities 0.0 -> 1.0 for the shader
  if (maxDensity > 0) {
    for (let i = 0; i < numPoints; i++) densities[i] /= maxDensity;
  }

  const timeMs = performance.now() - t0;
  self.postMessage(
    { jobId, positions, phases, densities, n, timeMs, numPoints }, 
    [positions.buffer, phases.buffer, densities.buffer]
  );
};
