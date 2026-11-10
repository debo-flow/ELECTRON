const FACTORIALS = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880];
function fact(n: number): number { return FACTORIALS[n]; }

// Generalized Laguerre Polynomial L_{k}^{alpha}(x) via recurrence
function laguerre(k: number, alpha: number, x: number): number {
  if (k === 0) return 1;
  if (k === 1) return 1 + alpha - x;
  let L0 = 1;
  let L1 = 1 + alpha - x;
  for (let i = 2; i <= k; i++) {
    const L2 = ((2 * i - 1 + alpha - x) * L1 - (i - 1 + alpha) * L0) / i;
    L0 = L1;
    L1 = L2;
  }
  return L1;
}

// Associated Legendre Polynomial P_l^m(x) (without Condon-Shortley phase)
function assocLegendre(l: number, m: number, x: number): number {
  if (l === 0) return 1;
  if (l === 1) {
    if (m === 0) return x;
    if (m === 1) return Math.sqrt(1 - x * x);
  }
  if (l === 2) {
    if (m === 0) return 0.5 * (3 * x * x - 1);
    if (m === 1) return 3 * x * Math.sqrt(1 - x * x);
    if (m === 2) return 3 * (1 - x * x);
  }
  if (l === 3) {
    if (m === 0) return 0.5 * (5 * x * x * x - 3 * x);
    if (m === 1) return 1.5 * (5 * x * x - 1) * Math.sqrt(1 - x * x);
    if (m === 2) return 15 * x * (1 - x * x);
    if (m === 3) return 15 * Math.pow(1 - x * x, 1.5);
  }
  if (l === 4) { // Added l=4 support for n=5
    const x2 = x * x;
    if (m === 0) return 0.125 * (35 * x2 * x2 - 30 * x2 + 3);
    if (m === 1) return 2.5 * x * (7 * x2 - 3) * Math.sqrt(1 - x2);
    if (m === 2) return 7.5 * (7 * x2 - 1) * (1 - x2);
    if (m === 3) return 105 * x * Math.pow(1 - x2, 1.5);
    if (m === 4) return 105 * Math.pow(1 - x2, 2);
  }
  return 0;
}

export function probabilityDensity(n: number, l: number, m: number, x: number, y: number, z: number): number {
  if (n < 1 || l < 0 || l >= n || Math.abs(m) > l || l > 4) return 0;

  const r = Math.sqrt(x * x + y * y + z * z);
  if (r === 0) return l === 0 ? Math.pow(2 / n, 3) / (2 * n) : 0; // Quick origin bailout

  // 1. Radial Wavefunction R_nl(r)
  const rho = (2 * r) / n;
  const normR = Math.sqrt(Math.pow(2 / n, 3) * (fact(n - l - 1) / (2 * n * fact(n + l))));
  const R = normR * Math.exp(-rho / 2) * Math.pow(rho, l) * laguerre(n - l - 1, 2 * l + 1, rho);

  // 2. Real Spherical Harmonics Y_lm(theta, phi)
  const cosTheta = z / r;
  const absM = Math.abs(m);
  const P = assocLegendre(l, absM, cosTheta);
  const normY = Math.sqrt(((2 * l + 1) / (4 * Math.PI)) * (fact(l - absM) / fact(l + absM)));
  
  let Y = normY * P;
  if (m !== 0) {
    const phi = Math.atan2(y, x);
    Y *= Math.SQRT2 * (m > 0 ? Math.cos(m * phi) : Math.sin(absM * phi));
  }

  // |psi|^2
  return R * R * Y * Y;
}
