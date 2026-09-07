'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type * as ThreeNS from 'three';

/*
 * The full-screen form that stands on its own black band after each page's
 * opening.
 *
 * Seven of them, one per page, all drawn the same way: not a solid but a cloud
 * of small white points laid on a surface — a stone, a knot, a ring, a cut
 * gem, a capsule, a dodecahedron, a sphere. What they do is the point:
 *
 *   Scroll. Each cloud is scattered dust when its band is at the edge of the
 *   screen and assembles into its form as the band comes to the middle of it.
 *   Scrolling is what builds the thing, so the movement belongs to the reader
 *   rather than to a loop running whether anyone is there or not.
 *
 *   Pointer. The points push away from the cursor and fall back when it
 *   leaves, so the surface parts under the hand like sand. The cursor is
 *   carried into the cloud's own space, so it keeps working while the form
 *   turns.
 *
 * Which form a page gets follows from its address unless a caller says
 * otherwise, so the pages themselves stay untouched.
 *
 * Three.js is heavy and this is decoration, so the library is fetched only
 * after the page is idle, the scene renders only while it is on screen and the
 * tab is visible, and the device pixel ratio is capped. With
 * `prefers-reduced-motion` it draws one still, assembled frame and stops.
 */

type Three = typeof ThreeNS;

export type Shape = 'stone' | 'knot' | 'ring' | 'prism' | 'capsule' | 'dodeca' | 'points';

const BY_PATH: [string, Shape][] = [
  ['/services', 'prism'],
  ['/work', 'ring'],
  ['/about', 'stone'],
  ['/contacts', 'capsule'],
  ['/start', 'dodeca'],
  ['/reviews', 'points'],
];

function shapeFor(pathname: string): Shape {
  return BY_PATH.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'stone';
}

/** How big a dot is: denser clouds get finer dots. */
const DOT: Record<Shape, number> = {
  stone: 0.032,
  knot: 0.026,
  ring: 0.028,
  prism: 0.032,
  capsule: 0.028,
  dodeca: 0.03,
  points: 0.028,
};

export function Sculpture({ className = '', shape }: { className?: string; shape?: Shape }) {
  const host = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const form = shape ?? shapeFor(pathname);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let cancelled = false;
    let teardown = () => {};

    const begin = async () => {
      const THREE = await import('three');
      if (cancelled) return;
      teardown = mount(THREE, el, form);
    };

    // Not before the page is settled: the type and the photographs come first.
    const idle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(() => void begin(), { timeout: 2000 })
        : window.setTimeout(() => void begin(), 400);

    return () => {
      cancelled = true;
      teardown();
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [form]);

  return <div ref={host} aria-hidden className={`pointer-events-none ${className}`} />;
}

/** A soft round dot, drawn once, so the points are beads rather than squares. */
function dotTexture(THREE: Three) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/*
 * Points laid on the flat faces of a polyhedron, in a grid on each triangle.
 * Three.js can subdivide a polyhedron, but it pushes the new vertices out
 * onto a sphere and the facets are gone; this keeps them.
 */
function facets(THREE: Three, source: ThreeNS.BufferGeometry, steps: number) {
  const p = source.getAttribute('position');
  const pos: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  for (let f = 0; f + 2 < p.count; f += 3) {
    a.fromBufferAttribute(p, f);
    b.fromBufferAttribute(p, f + 1);
    c.fromBufferAttribute(p, f + 2);
    for (let i = 0; i <= steps; i += 1) {
      for (let j = 0; j <= steps - i; j += 1) {
        const u = i / steps;
        const v = j / steps;
        const w = 1 - u - v;
        pos.push(a.x * w + b.x * u + c.x * v, a.y * w + b.y * u + c.y * v, a.z * w + b.z * u + c.z * v);
      }
    }
  }
  source.dispose();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return geometry;
}

function surface(THREE: Three, shape: Shape): ThreeNS.BufferGeometry {
  switch (shape) {
    case 'knot':
      return new THREE.TorusKnotGeometry(0.58, 0.2, 120, 14);
    case 'ring':
      return new THREE.TorusGeometry(0.68, 0.26, 18, 72);
    case 'prism':
      return facets(THREE, new THREE.OctahedronGeometry(1, 0), 14);
    case 'capsule':
      return new THREE.CapsuleGeometry(0.4, 0.9, 14, 34);
    case 'dodeca':
      return facets(THREE, new THREE.DodecahedronGeometry(0.9, 0), 8);
    case 'points':
      return new THREE.SphereGeometry(0.9, 40, 26);
    default:
      return facets(THREE, new THREE.IcosahedronGeometry(0.95, 0), 10);
  }
}

/** The form, where every point rests, where it scatters to, and how to dispose. */
function build(THREE: Three, shape: Shape) {
  const geometry = surface(THREE, shape);
  const position = geometry.getAttribute('position') as ThreeNS.BufferAttribute;
  const rest = Float32Array.from(position.array as Float32Array);
  const count = position.count;

  /*
   * Where each point comes from before the cloud assembles. Deterministic,
   * from the point's own index: the same page always builds the same way, and
   * no random table has to be kept around.
   */
  const scatter = new Float32Array(rest.length);
  for (let i = 0; i < count; i += 1) {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    const u = s - Math.floor(s);
    const t = Math.sin(i * 78.233) * 12345.6789;
    const v = t - Math.floor(t);
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const reach = 1.6 + u * 2.2;
    scatter[i * 3] = Math.sin(phi) * Math.cos(theta) * reach;
    scatter[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * reach;
    scatter[i * 3 + 2] = Math.cos(phi) * reach;
  }

  const texture = dotTexture(THREE);
  const material = new THREE.PointsMaterial({
    map: texture,
    color: 0xffffff,
    size: DOT[shape],
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    alphaTest: 0.04,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);

  const dispose = () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };

  return { object: points, position, rest, scatter, count, dispose };
}

/** How each form turns. `t` is seconds; `x`/`y` the lean; `spin` the scroll. */
function pose(shape: Shape, group: ThreeNS.Group, t: number, x: number, y: number, spin: number) {
  const r = group.rotation;
  switch (shape) {
    case 'knot':
      r.set(0.5 + x + t * 0.11, y + t * 0.17 + spin, 0);
      break;
    case 'ring':
      r.set(1.15 + x * 0.6 + Math.sin(t * 0.4) * 0.12, y + Math.sin(t * 0.3) * 0.2, t * 0.3 + spin);
      break;
    case 'prism':
      r.set(0.2 + x + Math.sin(t * 0.5) * 0.08, 0.4 + y + t * 0.3 + spin, 0);
      break;
    case 'capsule':
      r.set(Math.sin(t * 0.3) * 0.15, y + t * 0.22 + spin, 0.55 + x * 0.4 + Math.sin(t * 0.45) * 0.1);
      break;
    case 'dodeca':
      r.set(0.3 + x + t * 0.05, 0.6 + y + t * 0.12 + spin, 0);
      break;
    case 'points':
      r.set(0.4 + x * 0.8, y + t * 0.09 + spin, 0);
      break;
    default:
      r.set(0.35 + x + Math.sin(t * 0.35) * 0.06, -0.5 + y + t * 0.14 + spin, 0.08);
  }
}

/** How far the cursor reaches into the cloud, and how hard it pushes. */
const REACH = 0.9;
const PUSH = 0.55;

function mount(THREE: Three, el: HTMLElement, shape: Shape) {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = !window.matchMedia('(pointer: fine)').matches;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
  camera.position.set(0, 0, 4.4);

  const form = build(THREE, shape);
  const group = new THREE.Group();
  group.add(form.object);
  scene.add(group);

  // Pointer and scroll only nudge a target; the frame loop eases toward it.
  const target = { x: 0, y: 0, spin: 0 };
  const eased = { x: 0, y: 0, spin: 0 };
  let lastScroll = window.scrollY;

  // Where the cursor is on the plane through the middle of the scene, and how
  // strongly it is felt: it fades in when the pointer arrives, out when it goes.
  const pointer = new THREE.Vector2(0, 0);
  const cursor = new THREE.Vector3();
  const local = new THREE.Vector3();
  const inverse = new THREE.Matrix4();
  let grip = 0;
  let gripTarget = 0;

  const onPointer = (event: PointerEvent) => {
    target.x = (event.clientY / window.innerHeight - 0.5) * 0.7;
    target.y = (event.clientX / window.innerWidth - 0.5) * 0.9;
    const box = el.getBoundingClientRect();
    pointer.set(
      ((event.clientX - box.left) / box.width) * 2 - 1,
      -((event.clientY - box.top) / box.height) * 2 + 1,
    );
    gripTarget = event.clientY > box.top && event.clientY < box.bottom ? 1 : 0;
    wake();
  };
  const onLeave = () => {
    gripTarget = 0;
  };
  const onScroll = () => {
    const y = window.scrollY;
    target.spin += (y - lastScroll) * 0.0012;
    lastScroll = y;
    wake();
  };

  const resize = () => {
    const { width, height } = el.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // A tall, narrow screen would crop the form: scale it down to fit.
    group.scale.setScalar(Math.min(1.2, (width / height) * 1.35));
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(el);

  let frame = 0;
  let visible = true;
  let hidden = document.hidden;
  const born = performance.now();

  /** 1 when the band is in the middle of the screen, 0 when it is at the edge. */
  function assembly() {
    const box = el.getBoundingClientRect();
    const middle = box.top + box.height / 2;
    const off = Math.abs(middle - window.innerHeight / 2) / (window.innerHeight * 0.85);
    return Math.max(0, 1 - off);
  }

  /** Move the cursor onto the plane the cloud sits on, in the cloud's own space. */
  function cursorLocal() {
    cursor.set(pointer.x, pointer.y, 0.5).unproject(camera);
    cursor.sub(camera.position).normalize();
    cursor.multiplyScalar(-camera.position.z / cursor.z).add(camera.position);
    group.updateMatrixWorld();
    inverse.copy(group.matrixWorld).invert();
    return local.copy(cursor).applyMatrix4(inverse);
  }

  /** Every point, from where it scattered toward where it rests, minus the hand. */
  function place(gathered: number, hand: number) {
    const array = form.position.array as Float32Array;
    const { rest, scatter, count } = form;
    const spread = (1 - gathered) ** 2;
    const c = hand > 0.01 ? cursorLocal() : null;

    for (let i = 0; i < count; i += 1) {
      const k = i * 3;
      let x = rest[k] + scatter[k] * spread;
      let y = rest[k + 1] + scatter[k + 1] * spread;
      let z = rest[k + 2] + scatter[k + 2] * spread;

      if (c) {
        const dx = x - c.x;
        const dy = y - c.y;
        const dz = z - c.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < REACH && d > 0.0001) {
          const f = ((1 - d / REACH) ** 2 * PUSH * hand) / d;
          x += dx * f;
          y += dy * f;
          z += dz * f;
        }
      }

      array[k] = x;
      array[k + 1] = y;
      array[k + 2] = z;
    }
    form.position.needsUpdate = true;
  }

  const draw = () => {
    frame = 0;
    if (!visible || hidden) return;
    const t = (performance.now() - born) / 1000;

    eased.x += (target.x - eased.x) * 0.045;
    eased.y += (target.y - eased.y) * 0.045;
    eased.spin += (target.spin - eased.spin) * 0.06;
    grip += (gripTarget - grip) * 0.09;

    pose(shape, group, t, eased.x, eased.y, eased.spin);
    place(assembly(), coarse ? 0 : grip);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  };

  function wake() {
    if (!frame && visible && !hidden) frame = requestAnimationFrame(draw);
  }

  function dispose() {
    if (frame) cancelAnimationFrame(frame);
    ro.disconnect();
    form.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  if (still) {
    pose(shape, group, 0, 0, 0, 0);
    place(1, 0);
    renderer.render(scene, camera);
    return dispose;
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      wake();
    },
    { rootMargin: '10% 0px' },
  );
  io.observe(el);
  const onVisibility = () => {
    hidden = document.hidden;
    wake();
  };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerleave', onLeave, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  wake();

  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('scroll', onScroll);
    dispose();
  };
}
