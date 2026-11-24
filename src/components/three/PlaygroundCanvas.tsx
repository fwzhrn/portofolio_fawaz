"use client";

import { useRef, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import type { DragController } from "@/lib/drag-controller";
import { getCssColor, subscribeTheme } from "@/lib/theme-color";

export type ShapeId = "ico" | "knot" | "octa";

const limit = (v: number) => Math.max(-14, Math.min(14, v));

function Geo({ shape }: { shape: ShapeId }) {
  if (shape === "knot") return <torusKnotGeometry args={[1, 0.3, 96, 8]} />;
  if (shape === "octa") return <octahedronGeometry args={[1.7, 2]} />;
  return <icosahedronGeometry args={[1.7, 1]} />;
}

function Shape({
  shape,
  line,
  dot,
  animate,
}: {
  shape: ShapeId;
  line: string;
  dot: string;
  animate: boolean;
}) {
  const g = useRef<THREE.Group>(null);

  // Muncul membesar saat bentuk diganti (key di parent me-remount komponen ini)
  useFrame((_, delta) => {
    const o = g.current;
    if (!o || !animate) return;
    const s = o.scale.x + (1 - o.scale.x) * Math.min(1, delta * 7);
    o.scale.setScalar(s);
  });

  return (
    <group ref={g} scale={animate ? 0.001 : 1}>
      <mesh>
        <Geo shape={shape} />
        <meshBasicMaterial color={line} wireframe transparent opacity={0.55} />
      </mesh>
      <points>
        <Geo shape={shape} />
        <pointsMaterial
          color={dot}
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function Scene({
  shape,
  line,
  dot,
  drag,
  reduced,
}: {
  shape: ShapeId;
  line: string;
  dot: string;
  drag: DragController;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const vel = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const d = drag.consume();

    // Dorongan keyboard: langsung memutar
    if (d.nx || d.ny) {
      g.rotation.y += d.nx * 0.3;
      g.rotation.x += d.ny * 0.3;
    }

    if (d.down) {
      // Mengikuti jari/kursor, dan mencatat kecepatan untuk inersia
      const dt = Math.max(delta, 1 / 120);
      g.rotation.y += d.dx * 0.01;
      g.rotation.x += d.dy * 0.01;
      vel.current.y = limit((d.dx * 0.01) / dt);
      vel.current.x = limit((d.dy * 0.01) / dt);
    } else if (!reduced) {
      // Setelah dilepas: meluncur lalu melambat, plus putaran idle pelan
      g.rotation.y += (vel.current.y + 0.18) * delta;
      g.rotation.x += vel.current.x * delta;
      const decay = Math.pow(0.05, delta);
      vel.current.x *= decay;
      vel.current.y *= decay;
    }
  });

  return (
    <group ref={group} rotation={[0.35, 0.6, 0]}>
      <Shape key={shape} shape={shape} line={line} dot={dot} animate={!reduced} />
    </group>
  );
}

export default function PlaygroundCanvas({
  shape,
  drag,
  reduced,
  active,
}: {
  shape: ShapeId;
  drag: DragController;
  reduced: boolean;
  active: boolean;
}) {
  const line = useSyncExternalStore(
    subscribeTheme,
    () => getCssColor("--accent"),
    () => "#ffffff",
  );
  const dot = useSyncExternalStore(
    subscribeTheme,
    () => getCssColor("--foreground"),
    () => "#ffffff",
  );

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
    >
      <Scene shape={shape} line={line} dot={dot} drag={drag} reduced={reduced} />
    </Canvas>
  );
}
