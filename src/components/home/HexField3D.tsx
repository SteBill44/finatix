import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * HexField3D — scroll-reactive 3D background for the homepage.
 *
 * A field of floating hexagonal prisms (the Finatix logo shape) rendered as
 * crisp edge outlines with faint solid cores. The whole field rotates and
 * rises with scroll while the camera dollies in; each hex idles with its own
 * spin and bob, and the pointer adds a gentle parallax.
 *
 * Performance/UX guardrails:
 * - Lazy-loaded chunk (three.js never blocks initial paint)
 * - DPR capped, edge-line rendering is cheap, ~26 shapes desktop / 12 mobile
 * - Skipped entirely for prefers-reduced-motion or missing WebGL
 * - pointer-events: none, aria-hidden — purely decorative
 */

interface HexData {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  spinX: number;
  spinY: number;
  bobPhase: number;
  bobAmp: number;
}

// Deterministic pseudo-random so the field looks composed, not chaotic
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const buildField = (count: number): HexData[] => {
  const rand = mulberry32(1337);
  const hexes: HexData[] = [];
  for (let i = 0; i < count; i++) {
    const z = -12 + rand() * 13; // -12 (far) … 1 (near)
    const depth = (z + 12) / 13; // 0 far … 1 near
    hexes.push({
      position: [(rand() - 0.5) * 30, (rand() - 0.5) * 18, z],
      scale: 0.35 + depth * 1.3 + rand() * 0.5,
      rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
      spinX: (rand() - 0.5) * 0.35,
      spinY: (rand() - 0.5) * 0.45,
      bobPhase: rand() * Math.PI * 2,
      bobAmp: 0.3 + rand() * 0.7,
    });
  }
  return hexes;
};

interface Palette {
  line: string;
  lineFaint: string;
  fill: string;
  lineOpacity: number;
  faintOpacity: number;
  fillOpacity: number;
}

const DARK_PALETTE: Palette = {
  line: "#F16001",
  lineFaint: "#D9C3AB",
  fill: "#E85002",
  lineOpacity: 0.55,
  faintOpacity: 0.14,
  fillOpacity: 0.05,
};

const LIGHT_PALETTE: Palette = {
  line: "#E85002",
  lineFaint: "#3a2c22",
  fill: "#F16001",
  lineOpacity: 0.4,
  faintOpacity: 0.1,
  fillOpacity: 0.035,
};

const Field = ({ hexes, palette }: { hexes: HexData[]; palette: Palette }) => {
  const groupRef = useRef<THREE.Group>(null);
  const heroHexRef = useRef<THREE.Group>(null);
  const scrollRef = useRef(0);
  const smoothScroll = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  // Shared geometry: hexagonal prism + its edge outline
  const { hexGeo, edgesGeo } = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1, 1, 0.24, 6);
    return { hexGeo: geo, edgesGeo: new THREE.EdgesGeometry(geo) };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    };
    const onPointer = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // Ease toward the real scroll position so motion feels weighty
    smoothScroll.current += (scrollRef.current - smoothScroll.current) * Math.min(delta * 4, 1);
    const s = smoothScroll.current;

    const group = groupRef.current;
    if (group) {
      group.rotation.y = s * Math.PI * 0.65 + pointer.current.x * 0.06;
      group.rotation.x = s * 0.3 + pointer.current.y * 0.04;
      group.position.y = s * 8; // field rises as the page scrolls down
      group.children.forEach((child, i) => {
        const hex = hexes[i];
        if (!hex) return;
        child.rotation.x += hex.spinX * delta;
        child.rotation.y += hex.spinY * delta;
        child.position.y = hex.position[1] + Math.sin(t * 0.5 + hex.bobPhase) * hex.bobAmp;
      });
    }

    // Statement piece: large hex ring slowly counter-rotating behind the hero copy
    const heroHex = heroHexRef.current;
    if (heroHex) {
      heroHex.rotation.z = t * 0.05 - s * Math.PI * 0.4;
      heroHex.rotation.x = 0.35 + s * 0.5;
      heroHex.position.y = 0.5 - s * 10; // sinks away as you scroll
    }

    // Camera dolly + slight lift
    camera.position.z = 15 - s * 5;
    camera.position.y = s * 1.5;
    camera.lookAt(0, s * 2, 0);
  });

  return (
    <>
      <group ref={groupRef}>
        {hexes.map((hex, i) => (
          <group key={i} position={hex.position} rotation={hex.rotation} scale={hex.scale}>
            <lineSegments geometry={edgesGeo}>
              <lineBasicMaterial
                color={i % 3 === 2 ? palette.lineFaint : palette.line}
                transparent
                opacity={i % 3 === 2 ? palette.faintOpacity : palette.lineOpacity * (0.45 + hex.scale * 0.3)}
              />
            </lineSegments>
            <mesh geometry={hexGeo}>
              <meshBasicMaterial color={palette.fill} transparent opacity={palette.fillOpacity} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Large hero hexagon — echoes the logo at architectural scale */}
      <group ref={heroHexRef} position={[8.5, 0.5, -3]} scale={5.2} rotation={[0.35, 0, 0]}>
        <lineSegments geometry={edgesGeo}>
          <lineBasicMaterial color={palette.line} transparent opacity={palette.lineOpacity * 0.8} />
        </lineSegments>
        <mesh geometry={hexGeo}>
          <meshBasicMaterial color={palette.fill} transparent opacity={palette.fillOpacity * 1.6} />
        </mesh>
      </group>
    </>
  );
};

const HexField3D = () => {
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    // Bail out for reduced motion or missing WebGL
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;
    setReady(true);

    // Track light/dark theme via the root class next-themes toggles
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const hexes = useMemo(() => buildField(isMobile ? 12 : 26), [isMobile]);

  if (!ready) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 15], fov: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Field hexes={hexes} palette={isDark ? DARK_PALETTE : LIGHT_PALETTE} />
      </Canvas>
    </div>
  );
};

export default HexField3D;
