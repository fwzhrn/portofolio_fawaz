"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type * as THREE from "three";

type Pointer = { x: number; y: number };

const COLS = 56;
const ROWS = 36;
const COUNT = COLS * ROWS;
const SIZE_X = 16;
const SIZE_Y = 10;

// ── Warna accent dari CSS variable (oklch) → hex, ikut tema ──
let swatch: CanvasRenderingContext2D | null = null;

function getAccent(): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim();
  if (!swatch) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    swatch = c.getContext("2d", { willReadFrequently: true });
  }
  if (!swatch || !raw) return "#ffffff";
  swatch.clearRect(0, 0, 1, 1);
  swatch.fillStyle = raw;
  swatch.fillRect(0, 0, 1, 1);
  const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data;
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function Field({
  pointer,
  color,
}: {
  pointer: RefObject<Pointer>;
  color: string;
}) {
  const geo = useRef<THREE.BufferGeometry>(null);
  const group = useRef<THREE.Group>(null);
  const smooth = useRef<Pointer>({ x: 0, y: 0 });

  const { positions, base } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const base = new Float32Array(COUNT * 2);
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = (c / (COLS - 1) - 0.5) * SIZE_X;
        const y = (r / (ROWS - 1) - 0.5) * SIZE_Y;
        base[i * 2] = x;
        base[i * 2 + 1] = y;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        i++;
      }
    }
    return { positions, base };
  }, []);

  useFrame((state, delta) => {
    const g = geo.current;
    if (!g) return;

    const attr = g.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = state.clock.elapsedTime;

    const k = Math.min(1, delta * 4);
    smooth.current.x += (pointer.current.x - smooth.current.x) * k;
    smooth.current.y += (pointer.current.y - smooth.current.y) * k;

    const mx = smooth.current.x * SIZE_X * 0.5;
    const my = smooth.current.y * SIZE_Y * 0.5;

    for (let i = 0; i < COUNT; i++) {
      const x = base[i * 2];
      const y = base[i * 2 + 1];
      const wave =
        Math.sin(x * 0.55 + t * 0.8) * 0.28 + Math.cos(y * 0.7 + t * 0.6) * 0.22;
      const dx = x - mx;
      const dy = y - my;
      const lift = Math.exp(-(dx * dx + dy * dy) * 0.12) * 1.4;
      arr[i * 3 + 2] = wave + lift;
    }
    attr.needsUpdate = true;

    if (group.current) {
      group.current.rotation.z = smooth.current.x * -0.06;
      group.current.rotation.x = -1 + smooth.current.y * 0.05;
    }
  });

  return (
    <group ref={group} position={[0.8, -1.2, -1]} rotation={[-1, 0, 0]}>
      <points>
        <bufferGeometry ref={geo}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color={color}
          transparent
          opacity={0.75}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export default function HeroCanvas() {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const [inView, setInView] = useState(true);
  const accent = useSyncExternalStore(subscribeTheme, getAccent, () => "#ffffff");

  // Pointer dari seluruh window (kanvas sendiri tidak menerima event)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Berhenti menggambar saat Hero tidak terlihat
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="hero-canvas pointer-events-none absolute inset-0 -z-10"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        frameloop={inView ? "always" : "never"}
      >
        <Field pointer={pointer} color={accent} />
      </Canvas>
    </div>
  );
}