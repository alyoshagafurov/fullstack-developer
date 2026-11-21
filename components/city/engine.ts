import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/*
 * The night city. Everything is generated here, in code, so it weighs almost
 * nothing to download: thousands of buildings in one instanced mesh whose
 * windows are drawn by a shader, streets of sodium light with cars running
 * along them, a ring of mountains like the ones around Dushanbe, stars, and
 * the towers that carry the owner's sites as lit facades.
 *
 * The camera is not free: it flies a scripted path, and the page's scroll
 * decides where along that path it is. update(progress) is called every
 * frame with a value from 0 to 1.
 */

export type TowerSpec = {
  /** Image shown on the facade: a full-page capture, scrolled while the camera holds. */
  image: string;
  /** Pixel size of that image, to keep its proportions on the screen. */
  width: number;
  height: number;
};

export type CityOptions = {
  towers: TowerSpec[];
  logo: string;
  mobile: boolean;
  onReady?: () => void;
};

const BLOCK = 22; // one city block, in metres
const FOG = new THREE.Color('#14163a');

/* ---------------------------------------------------------------- shaders */

const FOG_GLSL = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  vec3 applyFog(vec3 c, float dist) {
    float f = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
    return mix(c, uFogColor, clamp(f, 0.0, 1.0));
  }
`;

const HASH_GLSL = /* glsl */ `
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
`;

const buildingVertex = /* glsl */ `
  attribute float aSeed;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vSeed;
  varying float vHeight;
  void main() {
    #ifdef USE_INSTANCING
      mat4 m = modelMatrix * instanceMatrix;
      vHeight = instanceMatrix[1][1];
    #else
      mat4 m = modelMatrix;
      vHeight = 1.0;
    #endif
    vec4 world = m * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normal;
    vSeed = aSeed;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const buildingFragment = /* glsl */ `
  ${FOG_GLSL}
  ${HASH_GLSL}
  uniform float uTime;
  uniform float uWake;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vSeed;
  varying float vHeight;

  void main() {
    vec3 n = normalize(vNormal);
    float dist = distance(cameraPosition, vWorld);
    vec3 facade = vec3(0.028, 0.032, 0.05);

    // roofs: dark, with the odd lit roof-top
    if (abs(n.y) > 0.5) {
      vec3 roof = vec3(0.02, 0.022, 0.03);
      gl_FragColor = vec4(applyFog(roof, dist), 1.0);
      return;
    }

    float u = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
    float side = abs(n.x) > 0.5 ? sign(n.x) * 2.0 : sign(n.z) * 3.0;
    vec2 cellSize = vec2(1.7, 2.6);
    vec2 g = vec2(u, vWorld.y) / cellSize;
    vec2 cell = floor(g);
    vec2 f = fract(g);

    // the window pane inside its cell, softened so it does not shimmer
    vec2 w = fwidth(g);
    float px = smoothstep(0.18 - w.x, 0.18 + w.x, f.x) * smoothstep(0.82 + w.x, 0.82 - w.x, f.x);
    float py = smoothstep(0.22 - w.y, 0.22 + w.y, f.y) * smoothstep(0.8 + w.y, 0.8 - w.y, f.y);
    float pane = px * py;

    float r = hash12(cell + vec2(vSeed * 91.7 + side, vSeed * 17.3));
    float r2 = hash12(cell.yx + vec2(vSeed * 13.1, side * 7.0));
    // lights come on floor by floor as the city wakes
    float wake = smoothstep(r * 0.9, r * 0.9 + 0.1, uWake);
    float lit = step(0.6, r) * wake;
    // a few windows flicker, like a TV inside
    lit *= 0.85 + 0.15 * sin(uTime * (2.0 + r2 * 6.0) + r * 40.0) * step(0.96, r2);

    vec3 warm = vec3(1.0, 0.66, 0.34);
    vec3 cool = vec3(0.62, 0.78, 1.0);
    vec3 tint = r2 < 0.72 ? warm : (r2 < 0.95 ? cool : vec3(1.0, 0.45, 0.7));
    float intensity = mix(0.55, 1.5, fract(r * 13.7));
    vec3 window = tint * intensity * lit;

    // far away the pattern becomes its average glow instead of noise
    float far = clamp((max(w.x, w.y) - 0.25) * 2.0, 0.0, 1.0);
    vec3 avg = mix(warm, cool, 0.25) * 0.55 * 0.4 * uWake;
    vec3 col = mix(facade + window * pane, facade + avg, far);

    // warm street light washing up the lowest floors
    col += vec3(0.5, 0.25, 0.1) * exp(-vWorld.y / 7.0) * 0.35;
    // shop fronts on the ground floor
    float shop = step(vWorld.y, 4.2) * step(1.0, vWorld.y) * step(0.45, hash12(vec2(floor(u / 5.0), vSeed * 31.0 + side)));
    col += vec3(1.0, 0.7, 0.45) * shop * 1.4 * px;

    gl_FragColor = vec4(applyFog(col, dist), 1.0);
  }
`;

const groundFragment = /* glsl */ `
  ${FOG_GLSL}
  ${HASH_GLSL}
  uniform float uBlock;
  uniform float uWake;
  varying vec3 vWorld;
  void main() {
    float dist = distance(cameraPosition, vWorld);
    vec2 p = vWorld.xz / uBlock;
    vec2 f = abs(fract(p) - 0.5) * uBlock; // distance from the middle of a block
    float road = max(step(uBlock * 0.5 - 3.2, f.x), step(uBlock * 0.5 - 3.2, f.y));
    vec3 col = mix(vec3(0.012, 0.013, 0.018), vec3(0.03, 0.028, 0.03), road);
    // sodium lamps along the kerbs
    vec2 lp = vWorld.xz / 9.0;
    float lamp = 0.0;
    float kerbX = smoothstep(0.7, 0.0, abs(f.x - (uBlock * 0.5 - 3.4)));
    float kerbY = smoothstep(0.7, 0.0, abs(f.y - (uBlock * 0.5 - 3.4)));
    float dotsX = smoothstep(0.35, 0.0, abs(fract(lp.y) - 0.5) * 2.0);
    float dotsY = smoothstep(0.35, 0.0, abs(fract(lp.x) - 0.5) * 2.0);
    lamp = kerbX * dotsX + kerbY * dotsY;
    col += vec3(1.0, 0.55, 0.2) * lamp * 2.2 * uWake;
    // a soft pool of light on the asphalt
    col += vec3(0.25, 0.12, 0.05) * road * 0.35 * uWake;
    gl_FragColor = vec4(applyFog(col, dist), 1.0);
  }
`;

const simpleVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const skyFragment = /* glsl */ `
  varying vec3 vWorld;
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  void main() {
    vec3 d = normalize(vWorld - cameraPosition);
    float h = clamp(d.y, -0.2, 1.0);
    vec3 col = mix(uHorizon, uTop, smoothstep(-0.02, 0.45, h));
    col += uGlow * exp(-max(h, 0.0) * 9.0) * 0.9; // the city's glow on the haze
    gl_FragColor = vec4(col, 1.0);
  }
`;

const carVertex = /* glsl */ `
  attribute vec4 aLane; // x: fixed coord, y: start, z: speed (signed), w: axis (0 = along x, 1 = along z)
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uSpan;
  varying vec3 vColor;
  varying vec3 vWorld;
  void main() {
    float t = mod(aLane.y + uTime * aLane.z, uSpan * 2.0) - uSpan;
    vec3 base = aLane.w < 0.5 ? vec3(t, 0.6, aLane.x) : vec3(aLane.x, 0.6, t);
    vec3 p = position;
    if (aLane.w > 0.5) p = vec3(p.z, p.y, p.x);
    vec4 w = modelMatrix * vec4(base + p, 1.0);
    vWorld = w.xyz;
    vColor = aColor;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const carFragment = /* glsl */ `
  ${FOG_GLSL}
  uniform float uWake;
  varying vec3 vColor;
  varying vec3 vWorld;
  void main() {
    float dist = distance(cameraPosition, vWorld);
    gl_FragColor = vec4(applyFog(vColor * uWake, dist), 1.0);
  }
`;

/* ------------------------------------------------------------------ helpers */

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smooth(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* A camera key: where it is, where it looks, at what point of the scroll. */
type Key = { at: number; pos: THREE.Vector3; look: THREE.Vector3 };

/* ------------------------------------------------------------------- engine */

export class CityEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private clock = new THREE.Clock();
  private shared = {
    uFogColor: { value: FOG },
    uFogDensity: { value: 0.00115 },
    uTime: { value: 0 },
    uWake: { value: 0 },
  };
  private keys: Key[] = [];
  private screens: { mesh: THREE.Mesh; tex: THREE.Texture; view: number; from: number; to: number; halo: THREE.MeshBasicMaterial }[] = [];
  private neon: THREE.MeshBasicMaterial | null = null;
  private beacons: THREE.InstancedMesh | null = null;
  private progress = 0;
  private smoothed = 0;
  private pointer = new THREE.Vector2();
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private frame = 0;
  private disposed = false;
  private startTime = 0;
  readonly towerFocus: number[] = [];

  constructor(private canvas: HTMLCanvasElement, private opts: CityOptions) {
    const dpr = Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 1.75);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(dpr);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.camera = new THREE.PerspectiveCamera(opts.mobile ? 62 : 46, 1, 0.5, 4000);
    this.scene.fog = null;

    this.buildSky();
    this.buildMountains();
    this.buildGround();
    const towers = this.buildCity();
    this.buildCars();
    this.buildTowers(towers);
    this.buildPath(towers);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), opts.mobile ? 0.6 : 0.75, 0.5, 0.82);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.resize();
    this.camPos.copy(this.keys[0].pos);
    this.camLook.copy(this.keys[0].look);
    this.startTime = performance.now();
    this.loop();
  }

  /* ----- scenery ----- */

  private buildSky() {
    const geo = new THREE.SphereGeometry(3000, 32, 16);
    const mat = new THREE.ShaderMaterial({
      vertexShader: simpleVertex,
      fragmentShader: skyFragment,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color('#02030a') },
        uHorizon: { value: new THREE.Color('#0d1233') },
        uGlow: { value: new THREE.Color('#3a2a55') },
      },
    });
    this.scene.add(new THREE.Mesh(geo, mat));

    // stars
    const rand = mulberry(4);
    const count = 1800;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(1 - rand() * 0.9);
      pos[i * 3] = 2600 * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = 2600 * Math.cos(phi) + 80;
      pos[i * 3 + 2] = 2600 * Math.sin(phi) * Math.sin(theta);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(
      sg,
      new THREE.PointsMaterial({ color: '#cfd8ff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.75, depthWrite: false }),
    );
    this.scene.add(stars);
  }

  private buildMountains() {
    // Two rings of ridges, the near one darker: the bowl Dushanbe sits in.
    const rand = mulberry(9);
    const ridge = (radius: number, height: number, color: string, phase: number) => {
      const seg = 360;
      const pos: number[] = [];
      const idx: number[] = [];
      const noise = (a: number) =>
        Math.sin(a * 3 + phase) * 0.35 +
        Math.sin(a * 7.3 + phase * 2) * 0.22 +
        Math.sin(a * 17.1 + phase * 3) * 0.1 +
        Math.sin(a * 41 + phase) * 0.04;
      for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        const h = height * (0.55 + noise(a) + (rand() - 0.5) * 0.04);
        const x = Math.cos(a) * radius;
        const z = Math.sin(a) * radius;
        pos.push(x, -20, z, x, h, z);
        if (i < seg) {
          const k = i * 2;
          idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      const mat = new THREE.ShaderMaterial({
        vertexShader: simpleVertex,
        fragmentShader: /* glsl */ `
          varying vec3 vWorld;
          uniform vec3 uColor;
          uniform float uTop;
          void main() {
            // a faint rim of moonlight along the crest
            float rim = smoothstep(uTop * 0.55, uTop, vWorld.y) * 0.25;
            gl_FragColor = vec4(uColor + vec3(0.06, 0.08, 0.16) * rim, 1.0);
          }
        `,
        uniforms: { uColor: { value: new THREE.Color(color) }, uTop: { value: height * 1.2 } },
        side: THREE.DoubleSide,
      });
      this.scene.add(new THREE.Mesh(g, mat));
    };
    ridge(2300, 520, '#0b1030', 1.3);
    ridge(1700, 300, '#060918', 4.1);
  }

  private buildGround() {
    const geo = new THREE.PlaneGeometry(4000, 4000);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: simpleVertex,
      fragmentShader: groundFragment,
      uniforms: { ...this.shared, uBlock: { value: BLOCK } },
    });
    this.scene.add(new THREE.Mesh(geo, mat));
  }

  /* The blocks. Returns the plots kept free for the owner's towers. */
  private buildCity() {
    const rand = mulberry(21);
    const towerPlots = [
      new THREE.Vector3(-2 * BLOCK, 0, -4 * BLOCK),
      new THREE.Vector3(3 * BLOCK, 0, -9 * BLOCK),
      new THREE.Vector3(-3 * BLOCK, 0, -15 * BLOCK),
    ].slice(0, Math.max(1, this.opts.towers.length));
    const reserved = new Set(towerPlots.map((p) => `${Math.round(p.x / BLOCK)},${Math.round(p.z / BLOCK)}`));

    const span = this.opts.mobile ? 26 : 34;
    const boxes: { x: number; z: number; w: number; d: number; h: number }[] = [];
    for (let gx = -span; gx <= span; gx++) {
      for (let gz = -span - 10; gz <= span - 6; gz++) {
        const key = `${gx},${gz}`;
        // keep the square in front of each tower open, so the camera can come close
        if (reserved.has(key) || reserved.has(`${gx},${gz + 1}`)) continue;
        const cx = gx * BLOCK;
        const cz = gz * BLOCK;
        const d = Math.hypot(cx, cz + 8 * BLOCK);
        const downtown = Math.exp(-d / 260);
        const lots = rand() < 0.35 ? 1 : rand() < 0.6 ? 2 : 4;
        const inner = BLOCK - 7;
        const sub = lots === 1 ? 1 : 2;
        for (let i = 0; i < (lots === 1 ? 1 : lots); i++) {
          const ix = lots === 1 ? 0 : (i % 2) - 0.5;
          const iz = lots === 4 ? Math.floor(i / 2) - 0.5 : lots === 2 ? 0 : 0;
          const lw = inner / sub - 1.2;
          const ld = lots === 4 ? inner / 2 - 1.2 : inner - (lots === 2 ? 0 : 0);
          const w = lw * (0.75 + rand() * 0.25);
          const dd = (lots === 2 ? inner - 1 : ld) * (0.75 + rand() * 0.25);
          let h = 6 + rand() * 18 + downtown * (30 + rand() * 110) * (rand() < 0.2 ? 1.45 : 1);
          if (rand() < 0.03) h *= 1.6;
          // tall buildings are broad buildings: no needles
          const broad = h > 80 ? 1.35 : 1;
          boxes.push({ x: cx + ix * (inner / sub), z: cz + iz * (inner / 2), w: Math.min(w * broad, inner), d: Math.min(dd * broad, inner), h });
        }
      }
    }

    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const seeds = new Float32Array(boxes.length);
    const mat = new THREE.ShaderMaterial({
      vertexShader: buildingVertex,
      fragmentShader: buildingFragment,
      uniforms: this.shared,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, boxes.length);
    const m = new THREE.Matrix4();
    const beaconSpots: THREE.Vector3[] = [];
    boxes.forEach((b, i) => {
      m.makeScale(b.w, b.h, b.d);
      m.setPosition(b.x, 0, b.z);
      mesh.setMatrixAt(i, m);
      seeds[i] = rand();
      if (b.h > 150) beaconSpots.push(new THREE.Vector3(b.x, b.h + 1.2, b.z));
    });
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    mesh.frustumCulled = false;
    this.scene.add(mesh);

    // red aviation lights on the tallest roofs, blinking
    const bg = new THREE.SphereGeometry(0.7, 8, 6);
    const bm = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.3, 0.25), toneMapped: false });
    this.beacons = new THREE.InstancedMesh(bg, bm, Math.max(1, beaconSpots.length));
    beaconSpots.forEach((p, i) => this.beacons!.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z)));
    this.scene.add(this.beacons);

    return towerPlots;
  }

  private buildCars() {
    const rand = mulberry(33);
    const count = this.opts.mobile ? 500 : 1100;
    const geo = new THREE.BoxGeometry(2.2, 0.5, 0.9);
    const inst = new THREE.InstancedBufferGeometry();
    inst.index = geo.index;
    inst.setAttribute('position', geo.getAttribute('position'));
    const lane = new Float32Array(count * 4);
    const color = new Float32Array(count * 3);
    const span = 34 * BLOCK;
    for (let i = 0; i < count; i++) {
      const axis = rand() < 0.5 ? 0 : 1;
      const road = Math.floor((rand() * 2 - 1) * 34) * BLOCK + BLOCK / 2;
      const dir = rand() < 0.5 ? 1 : -1;
      const side = dir > 0 ? -1.1 : 1.1;
      lane[i * 4] = road + side;
      lane[i * 4 + 1] = rand() * span * 2;
      lane[i * 4 + 2] = dir * (9 + rand() * 9);
      lane[i * 4 + 3] = axis;
      // white headlights coming, red tail-lights going
      const head = rand() < 0.5;
      color.set(head ? [3.2, 3.0, 2.6] : [3.2, 0.25, 0.15], i * 3);
    }
    inst.setAttribute('aLane', new THREE.InstancedBufferAttribute(lane, 4));
    inst.setAttribute('aColor', new THREE.InstancedBufferAttribute(color, 3));
    inst.instanceCount = count;
    const mat = new THREE.ShaderMaterial({
      vertexShader: carVertex,
      fragmentShader: carFragment,
      uniforms: { ...this.shared, uSpan: { value: span } },
    });
    const mesh = new THREE.Mesh(inst, mat);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
  }

  /* The owner's towers: tall, lit, each with one of his sites as a screen. */
  private buildTowers(plots: THREE.Vector3[]) {
    const loader = new THREE.TextureLoader();
    const heights = [210, 250, 190];
    const towerMat = new THREE.ShaderMaterial({
      vertexShader: buildingVertex,
      fragmentShader: buildingFragment,
      uniforms: this.shared,
    });
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    boxGeo.translate(0, 0.5, 0);
    boxGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(new Array(24).fill(0.37), 1));

    plots.forEach((plot, i) => {
      const spec = this.opts.towers[i];
      if (!spec) return;
      const h = heights[i % heights.length];
      const w = 30;
      const tower = new THREE.Mesh(boxGeo, towerMat);
      tower.scale.set(w, h, w);
      tower.position.copy(plot);
      this.scene.add(tower);

      // the screen: 16:10 on desktop, tall like a phone on a phone
      const portrait = this.opts.mobile;
      const sw = portrait ? 17 : 27;
      const sh = portrait ? sw * 2.05 : sw / 1.6;
      const viewRatio = portrait ? Math.min(1, (spec.width * 2.05) / spec.height) : Math.min(1, (spec.width / 1.6) / spec.height);
      const tex = loader.load(spec.image, () => this.opts.onReady?.());
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1, viewRatio);
      tex.offset.set(0, 1 - viewRatio);
      const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(1.0, 1.0, 1.0) });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), screenMat);
      const cy = h - sh / 2 - 14;
      screen.position.set(plot.x, cy, plot.z + w / 2 + 0.35);
      this.scene.add(screen);

      // a thin lit frame and a soft halo, so the screen reads from far away
      const frame = new THREE.Mesh(
        new THREE.PlaneGeometry(sw + 1.4, sh + 1.4),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 0.82, 0.9), toneMapped: false }),
      );
      frame.position.set(plot.x, cy, plot.z + w / 2 + 0.25);
      this.scene.add(frame);
      const haloMat = new THREE.MeshBasicMaterial({
          map: this.haloTexture(),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          color: new THREE.Color(0.25, 0.3, 0.55),
        });
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(sw * 2.6, sh * 2.2), haloMat);
      halo.position.set(plot.x, cy, plot.z + w / 2 + 0.1);
      this.scene.add(halo);

      this.screens.push({ mesh: screen, tex, view: viewRatio, from: 0, to: 0, halo: haloMat });
      this.towerFocus.push(i);

      if (i === 1) this.buildNeon(plot, h, w);
    });
  }

  private haloCache: THREE.Texture | null = null;
  private haloTexture() {
    if (this.haloCache) return this.haloCache;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,0.55)');
    grd.addColorStop(0.45, 'rgba(255,255,255,0.12)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    this.haloCache = new THREE.CanvasTexture(c);
    return this.haloCache;
  }

  /* His wordmark in pink neon on the roof of the tallest tower. */
  private buildNeon(plot: THREE.Vector3, h: number, w: number) {
    const tex = new THREE.TextureLoader().load(this.opts.logo);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.neon = new THREE.MeshBasicMaterial({
      color: new THREE.Color(3.2, 0.6, 1.6),
      map: tex,
      transparent: true,
      toneMapped: false,
      depthWrite: false,
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(26, 26 * 462 / 663), this.neon);
    sign.position.set(plot.x, h + 11, plot.z + w / 2 - 2);
    this.scene.add(sign);
    const mast = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 1), new THREE.MeshBasicMaterial({ color: '#111' }));
    mast.position.set(plot.x, h + 1.5, plot.z + w / 2 - 2);
    this.scene.add(mast);
  }

  /* ----- the flight ----- */

  private buildPath(plots: THREE.Vector3[]) {
    const m = this.opts.mobile;
    const keys: Key[] = [];
    const k = (at: number, pos: [number, number, number], look: [number, number, number]) =>
      keys.push({ at, pos: new THREE.Vector3(...pos), look: new THREE.Vector3(...look) });

    // arrival: high above the haze, the whole valley ahead
    k(0, [60, 620, 720], [0, 40, -260]);
    k(0.1, [20, 260, 260], [-20, 120, -160]);

    // each tower: approach, hold while its site scrolls, leave
    const n = this.screens.length;
    const start = 0.16;
    const end = 0.84;
    const per = (end - start) / n;
    plots.slice(0, n).forEach((p, i) => {
      const s = this.screens[i];
      const sy = s.mesh.position.y;
      const sz = s.mesh.position.z;
      const sx = p.x;
      const dist = m ? 48 : 46;
      const side = m ? 0 : -9; // on desktop the screen sits right of centre, the story left
      const a = start + per * i;
      k(a, [sx + side + 30, sy + 18, sz + dist + 70], [sx + side, sy, sz]);
      k(a + per * 0.22, [sx + side, sy + 1, sz + dist], [sx + side, sy, sz - 10]);
      k(a + per * 0.82, [sx + side, sy - 1, sz + dist - 4], [sx + side, sy, sz - 10]);
      s.from = a + per * 0.22;
      s.to = a + per * 0.82;
    });

    // the end: rise over the city, the neon in view
    k(0.92, [140, 330, 240], [0, 120, -200]);
    k(1, [180, 420, 380], [0, 80, -220]);
    keys.sort((x, y) => x.at - y.at);
    this.keys = keys;
  }

  /** Where the scroll is: 0 at the top of the city, 1 at its end. */
  setProgress(p: number) {
    this.progress = Math.min(1, Math.max(0, p));
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
  }

  /** The scroll progress at which each tower's screen is held, for the overlay and the chapter rail. */
  holds() {
    return this.screens.map((s) => ({ from: s.from, to: s.to }));
  }

  private sample(p: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
    const keys = this.keys;
    if (p <= keys[0].at) {
      outPos.copy(keys[0].pos);
      outLook.copy(keys[0].look);
      return;
    }
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (p <= b.at) {
        const t = smooth((p - a.at) / Math.max(1e-6, b.at - a.at));
        outPos.lerpVectors(a.pos, b.pos, t);
        outLook.lerpVectors(a.look, b.look, t);
        return;
      }
    }
    const last = keys[keys.length - 1];
    outPos.copy(last.pos);
    outLook.copy(last.look);
  }

  private tmpPos = new THREE.Vector3();
  private tmpLook = new THREE.Vector3();

  private loop = () => {
    if (this.disposed) return;
    this.frame = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    const t = this.clock.elapsedTime;
    this.shared.uTime.value = t;
    // the city wakes in the first seconds: windows and streets come on
    const wake = Math.min(1, (performance.now() - this.startTime) / 2600);
    this.shared.uWake.value = smooth(wake);
    if (this.neon) {
      const flick = wake < 1 ? (Math.random() < 0.3 ? 0.2 : 1) : 1 - 0.06 * Math.max(0, Math.sin(t * 23)) * (Math.sin(t * 0.7) > 0.95 ? 1 : 0);
      this.neon.opacity = flick * smooth(Math.max(0, wake * 1.4 - 0.4));
    }
    if (this.beacons) {
      (this.beacons.material as THREE.MeshBasicMaterial).color.setScalar(Math.sin(t * 2.4) > 0.6 ? 1 : 0.05).multiply(new THREE.Color(4, 0.3, 0.25));
    }

    // ease toward the scroll, so a flick of the wheel becomes a glide
    this.smoothed += (this.progress - this.smoothed) * (1 - Math.exp(-dt * 3.2));
    this.sample(this.smoothed, this.tmpPos, this.tmpLook);
    // a breath of pointer parallax
    this.tmpPos.x += this.pointer.x * 3;
    this.tmpPos.y += this.pointer.y * 2;
    this.camPos.lerp(this.tmpPos, 1 - Math.exp(-dt * 6));
    this.camLook.lerp(this.tmpLook, 1 - Math.exp(-dt * 6));
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    // the site on each screen scrolls while the camera holds in front of it;
    // near a screen the glow steps back so the site stays crisp
    let nearest = Infinity;
    for (const s of this.screens) nearest = Math.min(nearest, this.camPos.distanceTo(s.mesh.position));
    const near = Math.min(1, Math.max(0, (nearest - 50) / 300));
    this.bloom.strength = (this.opts.mobile ? 0.45 : 0.6) * (0.25 + 0.75 * near);
    for (const s of this.screens) {
      s.halo.opacity = 0.15 + 0.85 * near;
      const local = Math.min(1, Math.max(0, (this.smoothed - s.from) / Math.max(1e-6, s.to - s.from)));
      s.tex.offset.y = (1 - s.view) * (1 - smooth(local));
    }

    this.composer.render();
  };

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloom.resolution.set(w / 2, h / 2);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
    });
    this.composer.dispose();
    this.renderer.dispose();
  }
}
