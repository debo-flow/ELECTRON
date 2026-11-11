# Electron Orbital Visualizer

**Interactive 3D visualization of hydrogen atom electron orbitals as quantum probability clouds.**

[![CI Status](https://github.com/debo-flow/ELECTRON/actions/workflows/ci.yml/badge.svg)](https://github.com/debo-flow/ELECTRON/actions/workflows/ci.yml)
[![Latest Release](https://img.shields.io/github/v/release/debo-flow/ELECTRON?label=Release)](https://github.com/debo-flow/ELECTRON/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Platforms](https://img.shields.io/badge/Platforms-Windows%20%7C%20macOS%20%7C%20Linux-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-33.0-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)

## Table of Contents

- [Preview](#preview)
- [What Is This?](#what-is-this)
- [Features](#features)
- [Screenshots](#screenshots)
- [Download and Install](#download-and-install)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Run from Source](#run-from-source)
- [How the Physics Works](#how-the-physics-works)
- [Project Structure](#project-structure)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [Contributing, License, and Acknowledgments](#contributing-license-and-acknowledgments)

---

## Preview

<!-- PLACEHOLDER: Replace with an actual hero screenshot at docs/screenshots/hero.png -->
![Electron Orbital Visualizer Hero Screenshot](./docs/screenshots/hero.png)

<!-- PLACEHOLDER: Replace with an actual animated capture at docs/screenshots/demo.gif -->
![Interactive Orbital Demo](./docs/screenshots/demo.gif)

---

## What Is This?

Contrary to the classic textbook drawing of an atom, electrons do not orbit the nucleus like tiny planets around the sun. Instead, quantum mechanics tells us that an electron exists as a three-dimensional **probability cloud** called an **orbital**—a map showing where you are most likely to find the electron at any moment. **Electron Orbital Visualizer** calculates the exact mathematical equations for a hydrogen atom and turns them into glowing, interactive 3D point clouds you can rotate, zoom, and recolor in real time.

---

## Features

- **Interactive Quantum Number Selection**: Adjust sliders for principal ($n = 1\text{–}5$), azimuthal ($l = 0\text{–}4$), and magnetic ($m = -l\text{ to }l$) quantum numbers with automatic validity clamping and live spectroscopic notation labels (e.g., `2p_z`, `3d_z²`, `4f_z³`).
- **Built-In Orbital Presets**: Jump straight to `1s`, `2s`, `2p_z`, `2p_x`, `3d_z²`, `3d_xz`, `4f_z³`, or generate a valid **Random orbital**.
- **Off-Thread Web Worker Sampling**: Generates `10k` to `500k` points (default `100k`) using Metropolis-Hastings sampling inside a dedicated Web Worker, keeping the UI and 3D camera at 60 FPS with smooth cross-fade transitions.
- **4 Color Modes & 3 Themes**: Color points by **Distance** from the nucleus, wavefunction **Phase (+/-)**, local **Density**, or **Monochrome**, paired with **Neon**, **Sunset**, and **Ice** palettes plus custom background and monochrome color pickers.
- **Bloom & Shader Animations**: Fine-tune point size, opacity, and Three.js `UnrealBloomPass` glow intensity, and toggle custom GLSL vertex shader animations (**Pulse Animation**, **Electron Motion** jitter, and **Auto-Rotate**).
- **Persistent Settings**: Automatically saves quantum numbers, visual toggles, theme preferences, and window dimensions to `orbital-settings.json` in your OS user-data directory.
- **Native Screenshots & Presentation Mode**: Export the WebGL canvas directly to a PNG file via a native save dialog, or hide all UI overlays for distraction-free viewing.

---

## Screenshots

<!-- PLACEHOLDER: Capture and save these 4 screenshots inside docs/screenshots/ -->

| ![1s Orbital](./docs/screenshots/1s.png) | ![2p_z Orbital](./docs/screenshots/2p_z.png) |
| :---: | :---: |
| **`1s` ($n=1, l=0, m=0$)** — Spherically symmetric ground state in Distance color mode | **`2p_z` ($n=2, l=1, m=0$)** — Polar lobes separated by the $z=0$ nodal plane in Phase (+/-) mode |
| ![3d_z2 Orbital](./docs/screenshots/3d_z2.png) | ![4f Orbital](./docs/screenshots/4f.png) |
| **`3d_z²` ($n=3, l=2, m=0$)** — Two polar lobes with an equatorial torus ring in the Neon theme | **`4f_z³` ($n=4, l=3, m=0$)** — Multi-lobed high-angular-momentum state |

---

## Download and Install

Prebuilt binaries for Windows, macOS, and Linux are available on the [**GitHub Releases page**](https://github.com/debo-flow/ELECTRON/releases).

| Operating System | Package Formats | Description |
| :--- | :--- | :--- |
| **Windows** | `.exe` (NSIS Installer), `.exe` (Portable) | Standard setup wizard or standalone single-file executable |
| **macOS** | `.dmg`, `.zip` (`x64` & `arm64`) | Disk image and archive for Intel and Apple Silicon Macs |
| **Linux** | `.AppImage`, `.deb` | Universal portable Linux binary and Debian/Ubuntu package |

### Opening Unsigned Builds (Windows & macOS)

Because these builds are not signed with commercial Apple or Microsoft developer certificates, your OS will show an unverified-publisher prompt on first launch:

- **Windows SmartScreen**:
  1. Double-click the downloaded `.exe` file.
  2. In the *"Windows protected your PC"* popup, click **More info**.
  3. Click **Run anyway**.
- **macOS Gatekeeper**:
  1. Drag **Electron Orbital Visualizer** from the `.dmg` into your `Applications` folder.
  2. In Finder, **Control-click** (or right-click) the app icon and choose **Open**.
  3. Click **Open** in the confirmation dialog (or open **System Settings → Privacy & Security** and click **Open Anyway**).
- **Linux AppImage**:
  ```bash
  chmod +x Electron-Orbital-Visualizer-*.AppImage
  ./Electron-Orbital-Visualizer-*.AppImage
  ```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `H` | Toggle the left control panel open or closed |
| `P` | Toggle Presentation Mode (hides the control panel and menu button) |
| `Ctrl+R` / `Cmd+R` | Reset the 3D camera view to fit the current orbital |
| `Ctrl+S` / `Cmd+S` | Save a PNG screenshot of the canvas |
| `F11` / `Ctrl+Cmd+F` | Toggle fullscreen mode |
| `Ctrl+Q` / `Cmd+Q` | Quit the application |

---

## Run from Source

### Prerequisites

- **Node.js**: `v20.x` or later (matches `.github/workflows/ci.yml` and Electron 33)
- **npm**: `v10.x` or later

### Commands

1. **Clone the repository and install dependencies**:
   ```bash
   git clone [https://github.com/debo-flow/ELECTRON.git](https://github.com/debo-flow/ELECTRON.git)
   cd ELECTRON
   npm install
   ```

2. **Start the development app with hot reload**:
   ```bash
   npm run dev
   ```

3. **Run the Vitest unit test suite**:
   ```bash
   npm run test
   ```

4. **Run ESLint and Prettier checks**:
   ```bash
   npm run lint
   ```

5. **Compile the TypeScript/Vite bundles (`out/`)**:
   ```bash
   npm run build
   ```

6. **Preview the compiled build locally**:
   ```bash
   npm run start
   ```

7. **Package production installers into `release/`**:
   ```bash
   npm run package        # Package for your host OS
   npm run package:win    # Package Windows NSIS & portable executables
   npm run package:mac    # Package macOS DMG & ZIP archives
   npm run package:linux  # Package Linux AppImage & DEB installers
   ```

---

## How the Physics Works

### 1. The Hydrogen Wavefunction

In spherical coordinates $(r, \theta, \phi)$ and atomic units (where the Bohr radius $a_0 = 1$), the stationary eigenstates of an electron in a hydrogen atom factor into a radial component and an angular component:

$$\psi_{n,l,m}(r, \theta, \phi) = R_{nl}(r) \cdot Y_{lm}(\theta, \phi)$$

- **Radial Wavefunction $R_{nl}(r)$**: Controls how the wavefunction varies with distance $r$ from the nucleus. With $\rho = \frac{2r}{n}$, the normalized radial equation is:

  $$R_{nl}(r) = \sqrt{\left(\frac{2}{n}\right)^3 \frac{(n - l - 1)!}{2n(n + l)!}} \, e^{-\rho / 2} \, \rho^l \, L_{n-l-1}^{2l+1}(\rho)$$

  where $L_{k}^{\alpha}(\rho)$ is the generalized Laguerre polynomial evaluated via its three-term recurrence relation.
- **Real Spherical Harmonics $Y_{lm}(\theta, \phi)$**: Controls the 3D directional geometry using normalized associated Legendre polynomials $P_l^{\vert{}m\vert{}}(\cos\theta)$ combined with $\cos(m\phi)$ for $m > 0$ and $\sin(\vert{}m\vert{}\phi)$ for $m < 0$.

### 2. Quantum Numbers

- **$n$ (Principal, $1 \le n \le 5$)**: Determines the energy shell and overall radial scale of the cloud (bounding radius scales roughly as $4n^2 a_0$).
- **$l$ (Azimuthal, $0 \le l < n$)**: Determines the orbital angular momentum and the number of angular nodal surfaces:

| $l$ Value | Spectroscopic Subshell | Characteristic Geometry |
| :---: | :---: | :--- |
| `0` | `s` | Concentric spherical shells |
| `1` | `p` | Two-lobed dumbbells along $x$, $y$, or $z$ |
| `2` | `d` | Four-lobed clovers or two lobes with an equatorial torus (`3d_z²`) |
| `3` | `f` | Six- and eight-lobed complex structures |
| `4` | `g` | High-order multi-nodal angular geometries |

- **$m$ (Magnetic, $-l \le m \le l$)**: Determines the spatial orientation of the orbital lobes in 3D space.

### 3. Probability Density ($\vert{}\psi\vert{}^2$) & Sampling

By Born's rule, the probability density of locating the electron at Cartesian coordinates $(x, y, z)$ is the squared amplitude of the wavefunction:

$$P(x, y, z) = \vert{}\psi_{n,l,m}(x, y, z)\vert{}^2$$

To sample $N$ points distributed according to $\vert{}\psi\vert{}^2$, `sampler.worker.ts` runs the **Metropolis-Hastings Markov Chain Monte Carlo (MCMC)** algorithm in 3D Cartesian space:
1. The walker starts off-axis at $r = n^2$ to avoid starting on a planar node where $\psi = 0$.
2. It performs `10,000` burn-in steps, then proposes uniform random steps scaled by $n$, accepting moves with probability $\min\left(1, \frac{\vert{}\psi(\mathbf{x}')\vert{}^2}{\vert{}\psi(\mathbf{x})\vert{}^2}\right)$ and thinning by `10` steps between recorded points.
3. For each sampled coordinate, the worker also records $\text{sign}(\psi) \in \{-1, +1\}$ for **Phase (+/-)** coloring and normalized local $\vert{}\psi\vert{}^2$ for **Density** coloring.

---

## Project Structure

```text
ELECTRON/
├── .github/workflows/          # CI (lint/test/build) and multi-OS Release workflows
├── build/                      # App icons (.png, .ico, .icns) for electron-builder
├── docs/screenshots/           # README screenshots and demo GIF
├── src/
│   ├── main/
│   │   └── index.ts            # Electron main process, native app menu, and IPC handlers
│   ├── preload/
│   │   ├── env.d.ts            # TypeScript Window.api interface definitions
│   │   └── index.ts            # Context-isolated preload script exposing window.api
│   └── renderer/
│       ├── physics/
│       │   ├── hydrogen.ts     # Analytical radial Laguerre & real spherical harmonics math
│       │   ├── hydrogen.test.ts# Vitest tests for 1s symmetry, 2p nodes, and radial peaks
│       │   └── sampler.worker.ts # Web Worker running Metropolis-Hastings 3D sampling
│       ├── tests/
│       │   ├── labels.test.ts  # Unit tests for spectroscopic orbital labels
│       │   ├── phase.test.ts   # Unit tests for wavefunction sign (+/-) logic
│       │   ├── settings.test.ts# Unit tests for settings validation and default fallbacks
│       │   └── state.test.ts   # Unit tests for (n, l, m) clamping rules
│       ├── ui/
│       │   └── labels.ts       # Formats (n, l, m) into spectroscopic notation (e.g. 3d_z²)
│       ├── index.html          # Renderer shell, strict CSP header, and sidebar layout
│       ├── main.ts             # Renderer entry point, UI bindings, and animation loop
│       ├── pointCloud.ts       # Custom Three.js ShaderMaterial for particle rendering
│       ├── scene.ts            # Three.js Scene, PerspectiveCamera, renderer, and OrbitControls
│       └── state.ts            # Reactive state store, quantum clamping, and color themes
├── electron-builder.yml        # Cross-platform packaging targets (NSIS, DMG, AppImage, DEB)
├── electron.vite.config.ts     # Vite configuration for main, preload, and renderer bundles
└── package.json                # Scripts, dependencies, and project metadata
```

---

## Security Notes

- **Context Isolation & Sandboxing**: The `BrowserWindow` runs with `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`. The renderer process has no direct access to Node.js or `fs`.
- **Minimal Preload Bridge**: `src/preload/index.ts` uses `contextBridge.exposeInMainWorld` to expose only specific, typed IPC methods (`loadSettings`, `saveSettings`, `saveScreenshot`, `onMenuAction`).
- **Strict Content Security Policy (CSP)**: `src/renderer/index.html` enforces `default-src 'self'`, permitting only local scripts, inline styles, data URLs for canvas screenshots, and local `blob:` Web Workers.
- **Zero External Network Requests**: All math, rendering, and UI assets run 100% offline. Loaded settings are validated and clamped via `validateSettings()` before application.

---

## Roadmap

- [ ] **2D Cross-Section Slicing**: Interactive clipping plane to inspect internal spherical and planar nodal surfaces on high-$n$ orbitals.
- [ ] **Orbital Superpositions & Hybridization**: Render linear combinations of eigenstates such as $sp$, $sp^2$, and $sp^3$ hybrid orbitals.
- [ ] **Multi-Electron Effective Nuclear Charge ($Z_{\text{eff}}$)**: Approximate heavier elements using Slater's shielding rules.
- [ ] **Time-Dependent Quantum Transitions**: Animate oscillatory superposition states during dipole photon absorption and emission.
- [ ] **WebM / MP4 Turntable Export**: Record smooth 360° orbital rotation loops directly from the canvas.

---

## Contributing, License, and Acknowledgments

- **Contributing**: Contributions, bug reports, and feature requests are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request, and check [CHANGELOG.md](./CHANGELOG.md) for release history.
- **License**: Licensed under the [MIT License](./LICENSE). Copyright © Deborudra De.
- **Acknowledgments**:
  - [Three.js](https://threejs.org/) for WebGL 3D rendering, custom shaders, and post-processing bloom.
  - [Electron](https://www.electronjs.org/) and [electron-vite](https://electron-vite.org/) for the cross-platform desktop runtime and build toolchain.
