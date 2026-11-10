import { probabilityDensity } from './hydrogen';

self.onmessage = (e) => {
  const { n, l, m, numPoints } = e.data;
  const positions = new Float32Array(numPoints * 3);

  // Start off-axis to avoid planar nodes where probability = 0
  const rStart = n * n;
  let x = rStart / Math.sqrt(3);
  let y = rStart / Math.sqrt(3);
  let z = rStart / Math.sqrt(3);
  let p = probabilityDensity(n, l, m, x, y, z);

  const stepSize = n; 
  const burnIn = 10000;
  const thin = 10; // Samples skipped to reduce correlation

  // Metropolis-Hastings loop
  for (let i = -burnIn; i < numPoints; i++) {
    for (let j = 0; j < (i < 0 ? 1 : thin); j++) {
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
    }
  }

  self.postMessage({ positions, n }, [positions.buffer]);
};
