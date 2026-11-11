import * as THREE from 'three';

export function createOrbitalMesh(positions: Float32Array, phases: Float32Array, densities: Float32Array, n: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aDensity', new THREE.BufferAttribute(densities, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorMode: { value: 0 }, // 0: Dist, 1: Phase, 2: Density, 3: Mono
      uColor1: { value: new THREE.Color(0x00aaff) },
      uColor2: { value: new THREE.Color(0xff8800) },
      uMaxRadius: { value: 4 * n * n },
      uPointSize: { value: 1.5 },
      uOpacity: { value: 0.0 }, // Starts at 0 for fade in
      uPulse: { value: 0 },
      uMotion: { value: 0 },
      uMotionSpeed: { value: 1.0 }
    },
    vertexShader: `
      uniform float uTime; 
      uniform float uPointSize; 
      uniform float uPulse; 
      uniform float uMotion; 
      uniform float uMotionSpeed;
      
      attribute float aPhase; 
      attribute float aDensity;
      
      varying vec3 vPos; 
      varying float vPhase; 
      varying float vDensity;
      
      void main() {
        vPos = position; 
        vPhase = aPhase; 
        vDensity = aDensity;
        
        vec3 pos = position;
        
        // Electron motion jitter
        if (uMotion > 0.5) {
           pos.x += sin(uTime * uMotionSpeed * 5.0 + position.y * 10.0) * 0.05;
           pos.y += cos(uTime * uMotionSpeed * 5.0 + position.z * 10.0) * 0.05;
           pos.z += sin(uTime * uMotionSpeed * 5.0 + position.x * 10.0) * 0.05;
        }
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        
        // Pulse animation
        float pulseFactor = 1.0;
        if (uPulse > 0.5) {
            pulseFactor += 0.3 * sin(uTime * 3.0 + length(position));
        }
        
        gl_PointSize = uPointSize * pulseFactor * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform int uColorMode; 
      uniform vec3 uColor1; 
      uniform vec3 uColor2;
      uniform float uMaxRadius; 
      uniform float uOpacity;
      
      varying vec3 vPos; 
      varying float vPhase; 
      varying float vDensity;
      
      void main() {
        // Create circular points instead of squares
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        vec3 color = uColor1;
        float r = length(vPos);
        float t = min(r / uMaxRadius, 1.0);
        
        if (uColorMode == 0) {
            color = mix(uColor1, uColor2, t); // Distance
        } else if (uColorMode == 1) {
            color = vPhase > 0.0 ? uColor1 : uColor2; // Phase
        } else if (uColorMode == 2) {
            color = mix(uColor2, uColor1, vDensity); // Density (dense = color1, sparse = color2)
        } else if (uColorMode == 3) {
            color = uColor1; // Mono
        }
        
        // Soft edge alpha
        float alpha = uOpacity * (1.0 - (dist * 2.0));
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true, 
    blending: THREE.AdditiveBlending, 
    depthWrite: false
  });

  return new THREE.Points(geometry, material);
}
