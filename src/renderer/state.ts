export interface AppState {
  n: number;
  l: number;
  m: number;
  numPoints: number;
  autoRotate: boolean;
  showAxes: boolean;
  showNucleus: boolean;
  colorMode: number;
  theme: string;
  bgColor: string;
  monoColor: string;
  pointSize: number;
  pointOpacity: number;
  bloomEnabled: boolean;
  glowIntensity: number;
  pulseEnabled: boolean;
  motionEnabled: boolean;
  motionSpeed: number;
}

export const THEMES: Record<string, { c1: number, c2: number }> = {
  neon: { c1: 0x00ffff, c2: 0xff00ff },
  sunset: { c1: 0xffaa00, c2: 0xaa00ff },
  ice: { c1: 0xffffff, c2: 0x0088ff },
  mono: { c1: 0x00ffcc, c2: 0x00ffcc } // Uses monoColor picker visually
};

export const defaultState: AppState = {
  n: 2, l: 1, m: 0, numPoints: 100000,
  autoRotate: true, showAxes: true, showNucleus: true,
  colorMode: 0, theme: 'neon', bgColor: '#050506', monoColor: '#00ffcc',
  pointSize: 1.5, pointOpacity: 0.6,
  bloomEnabled: true, glowIntensity: 1.0,
  pulseEnabled: false, motionEnabled: false, motionSpeed: 1.0
};

export function clampQuantumNumbers(n: number, l: number, m: number) {
  const safeN = Math.max(1, Math.min(5, Math.floor(n)));
  const safeL = Math.max(0, Math.min(safeN - 1, Math.floor(l)));
  const safeM = Math.max(-safeL, Math.min(safeL, Math.floor(m)));
  return { n: safeN, l: safeL, m: safeM };
}

export function validateSettings(data: any): AppState {
  if (!data || typeof data !== 'object') return { ...defaultState };
  const merged = { ...defaultState, ...data };
  const clamped = clampQuantumNumbers(merged.n, merged.l, merged.m);
  merged.n = clamped.n;
  merged.l = clamped.l;
  merged.m = clamped.m;
  return merged;
}

export class Store {
  private state: AppState;
  private listeners: Array<(state: AppState, prev: AppState) => void> = [];

  constructor(initialState: AppState) {
    this.state = initialState;
  }

  getState() {
    return { ...this.state };
  }

  setState(partial: Partial<AppState>) {
    const prev = { ...this.state };
    const next = { ...this.state, ...partial };
    
    if (partial.n !== undefined || partial.l !== undefined || partial.m !== undefined) {
      const clamped = clampQuantumNumbers(next.n, next.l, next.m);
      next.n = clamped.n;
      next.l = clamped.l;
      next.m = clamped.m;
    }

    this.state = next;
    this.listeners.forEach(listener => listener(this.state, prev));
  }

  subscribe(listener: (state: AppState, prev: AppState) => void) {
    this.listeners.push(listener);
    listener(this.state, this.state); // Initial fire
  }
}
