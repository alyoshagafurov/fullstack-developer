'use client';

import { useEffect, useRef } from 'react';
import type * as ThreeNS from 'three';

/*
 * The one three-dimensional thing on the site.
 *
 * A faceted stone in dark graphite, the size of a mark, turning slowly above
 * the label of a black band — lit the way the studio objects are lit: one key
 * light, one rim, a little fill. It leans toward the pointer and turns a touch
 * with the scroll, so it belongs to the page rather than looping on top of it.
 * Small on purpose: the owner asked for three-dimensional touches, not a
 * sculpture behind his headlines, and at this size it reads as a signature.
 *
 * Three.js is heavy and this is decoration, so the library is fetched only
 * after the page is idle, the scene renders only while it is on screen and the
 * tab is visible, and the device pixel ratio is capped. With
 * `prefers-reduced-motion` it draws a single still frame and stops.
 */

type Three = typeof ThreeNS;

export function Sculpture({ className = '' }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let cancelled = false;
    let teardown = () => {};

    const begin = async () => {
      const THREE = await import('three');
      if (cancelled) return;
      teardown = mount(THREE, el);
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
  }, []);

  return <div ref={host} aria-hidden className={`pointer-events-none ${className}`} />;
}

function mount(THREE: Three, el: HTMLElement) {
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

  // The stone. Flat shading is what makes it read as cut rather than blown.
  const geometry = new THREE.IcosahedronGeometry(0.95, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x343434,
    roughness: 0.55,
    metalness: 0.12,
    flatShading: true,
  });
  const stone = new THREE.Mesh(geometry, material);

  // Its edges, drawn faintly, like the construction lines on a plan.
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 1),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 }),
  );
  stone.add(edges);

  const group = new THREE.Group();
  group.add(stone);
  group.rotation.set(0.35, -0.5, 0.08);
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
    // A portrait phone is narrower than the stone: scale it to fit the width.
    const fit = Math.min(1, (width / height) * 1.3);
    group.scale.setScalar(fit);
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

    group.rotation.x = 0.35 + eased.x + Math.sin(t * 0.35) * 0.06;
    group.rotation.y = -0.5 + eased.y + t * 0.14 + eased.spin;
    group.position.y = Math.sin(t * 0.6) * 0.05;

    renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  };

  const wake = () => {
    if (!frame && visible && !hidden) frame = requestAnimationFrame(draw);
  };

  if (still) {
    renderer.render(scene, camera);
  } else {
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

  function dispose() {
    if (frame) cancelAnimationFrame(frame);
    ro.disconnect();
    geometry.dispose();
    material.dispose();
    edges.geometry.dispose();
    (edges.material as ThreeNS.Material).dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  return dispose;
}
