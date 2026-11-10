export interface AppState {
  n: number;
  l: number;
  m: number;
  numPoints: number;
  autoRotate: boolean;
  showAxes: boolean;
  showNucleus: boolean;
}

export function clampQuantumNumbers(n: number, l: number, m: number) {
  const safeN = Math.max(1, Math.min(5, Math.floor(n)));
  const safeL = Math.max(0, Math.min(safeN - 1, Math.floor(l)));
  const safeM = Math.max(-safeL, Math.min(safeL, Math.floor(m)));
  return { n: safeN, l: safeL, m: safeM };
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
    
    // Automatically clamp quantum numbers if they were changed
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
