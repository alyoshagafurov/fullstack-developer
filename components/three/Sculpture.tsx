'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type * as ThreeNS from 'three';

/*
 * The small three-dimensional mark above the label of a black band.
 *
 * One family, seven members: every page carries its own form, cut from the
 * same dark graphite and lit the same way — one key light, one rim, a little
 * fill — so they read as a set rather than a collection. Each also moves in
 * its own manner: the stone turns, the knot tumbles, the ring spins on its
 * axis, the prism turns quickly like a cut gem, the capsule leans and bobs,
 * the dodecahedron drifts, the cloud of points breathes. All lean toward the
 * pointer and turn a touch with the scroll, so they belong to the page rather
 * than looping on top of it.
 *
 * Which form a page gets follows from its address unless a caller says
 * otherwise, so the pages themselves stay untouched.
 *
 * Three.js is heavy and this is decoration, so the library is fetched only
 * after the page is idle, the scene renders only while it is on screen and the
 * tab is visible, and the device pixel ratio is capped. With
 * `prefers-reduced-motion` it draws a single still frame and stops.
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

/** The form itself, plus everything that has to be disposed with it. */
function build(THREE: Three, shape: Shape) {
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(thing: T) => {
    disposables.push(thing);
    return thing;
  };

  const solid = () =>
    keep(
      new THREE.MeshStandardMaterial({
        color: 0x343434,
        roughness: 0.55,
        metalness: 0.12,
        flatShading: true,
      }),
    );

  // Construction lines, drawn faintly — only where a form has real edges.
  const edged = (geometry: ThreeNS.BufferGeometry, opacity = 0.16) => {
    const mesh = new THREE.Mesh(keep(geometry), solid());
    mesh.add(
      new THREE.LineSegments(
        keep(new THREE.EdgesGeometry(geometry, 1)),
        keep(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity })),
      ),
    );
    return mesh;
  };

  const smooth = (geometry: ThreeNS.BufferGeometry) => new THREE.Mesh(keep(geometry), solid());

  let object: ThreeNS.Object3D;
  switch (shape) {
    case 'knot':
      object = smooth(new THREE.TorusKnotGeometry(0.58, 0.2, 160, 24));
      break;
    case 'ring':
      object = smooth(new THREE.TorusGeometry(0.68, 0.26, 20, 64));
      break;
    case 'prism':
      object = edged(new THREE.OctahedronGeometry(1, 0), 0.2);
      break;
    case 'capsule':
      object = smooth(new THREE.CapsuleGeometry(0.4, 0.9, 8, 20));
      break;
    case 'dodeca':
      object = edged(new THREE.DodecahedronGeometry(0.9, 0));
      break;
    case 'points':
      object = new THREE.Points(
        keep(new THREE.SphereGeometry(0.9, 22, 16)),
        keep(
          new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.055,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
          }),
        ),
      );
      break;
    default:
      object = edged(new THREE.IcosahedronGeometry(0.95, 1));
  }

  return { object, dispose: () => disposables.forEach((d) => d.dispose()) };
}

/**
 * How each form moves. `t` is seconds since it appeared; `x` and `y` are the
 * eased lean toward the pointer; `spin` is what the scroll has added.
 */
function pose(
  shape: Shape,
  group: ThreeNS.Group,
  t: number,
  x: number,
  y: number,
  spin: number,
) {
  const r = group.rotation;
  group.scale.setScalar(group.userData.fit as number);
  switch (shape) {
    case 'knot':
      r.set(0.5 + x + t * 0.11, y + t * 0.17 + spin, 0);
      group.position.y = Math.sin(t * 0.5) * 0.04;
      break;
    case 'ring':
      r.set(1.15 + x * 0.6 + Math.sin(t * 0.4) * 0.12, y + Math.sin(t * 0.3) * 0.2, t * 0.3 + spin);
      group.position.y = Math.sin(t * 0.7) * 0.05;
      break;
    case 'prism':
      r.set(0.2 + x + Math.sin(t * 0.5) * 0.08, 0.4 + y + t * 0.3 + spin, 0);
      group.position.y = Math.sin(t * 0.9) * 0.06;
      break;
    case 'capsule':
      r.set(Math.sin(t * 0.3) * 0.15, y + t * 0.22 + spin, 0.55 + x * 0.4 + Math.sin(t * 0.45) * 0.1);
      group.position.y = Math.sin(t * 0.6) * 0.07;
      break;
    case 'dodeca':
      r.set(0.3 + x + t * 0.05, 0.6 + y + t * 0.12 + spin, 0);
      group.position.y = Math.sin(t * 0.55) * 0.05;
      break;
    case 'points':
      r.set(0.4 + x * 0.8, y + t * 0.09 + spin, 0);
      group.scale.multiplyScalar(1 + Math.sin(t * 0.8) * 0.03);
      break;
    default:
      r.set(0.35 + x + Math.sin(t * 0.35) * 0.06, -0.5 + y + t * 0.14 + spin, 0.08);
      group.position.y = Math.sin(t * 0.6) * 0.05;
  }
}

function mount(THREE: Three, el: HTMLElement, shape: Shape) {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
  camera.position.set(0, 0, 4.4);

  const form = build(THREE, shape);
  const group = new THREE.Group();
  group.userData.fit = 1;
  group.add(form.object);
  scene.add(group);

  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(-2.5, 3, 3.5);
  const rim = new THREE.DirectionalLight(0xffffff, 1.6);
  rim.position.set(3, -1.5, -2.5);
  const fill = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(key, rim, fill);

  // Pointer and scroll only nudge a target; the frame loop eases toward it.
  const target = { x: 0, y: 0, spin: 0 };
  const eased = { x: 0, y: 0, spin: 0 };
  let lastScroll = window.scrollY;

  const onPointer = (event: PointerEvent) => {
    target.x = (event.clientY / window.innerHeight - 0.5) * 0.7;
    target.y = (event.clientX / window.innerWidth - 0.5) * 0.9;
  };
  const onScroll = () => {
    const y = window.scrollY;
    target.spin += (y - lastScroll) * 0.0012;
    lastScroll = y;
  };

  const resize = () => {
    const { width, height } = el.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // A box narrower than it is tall would crop the form: scale it to fit.
    group.userData.fit = Math.min(1, (width / height) * 1.3);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(el);

  let frame = 0;
  let visible = true;
  let hidden = document.hidden;
  const born = performance.now();

  const draw = () => {
    frame = 0;
    if (!visible || hidden) return;
    const t = (performance.now() - born) / 1000;

    eased.x += (target.x - eased.x) * 0.045;
    eased.y += (target.y - eased.y) * 0.045;
    eased.spin += (target.spin - eased.spin) * 0.06;

    pose(shape, group, t, eased.x, eased.y, eased.spin);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  };

  const wake = () => {
    if (!frame && visible && !hidden) frame = requestAnimationFrame(draw);
  };

  function dispose() {
    if (frame) cancelAnimationFrame(frame);
    ro.disconnect();
    form.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  if (still) {
    pose(shape, group, 0, 0, 0, 0);
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
  window.addEventListener('scroll', onScroll, { passive: true });
  wake();

  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('scroll', onScroll);
    dispose();
  };
}
