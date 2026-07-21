import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  MeshDistortMaterial,
  PerformanceMonitor,
  AdaptiveDpr,
} from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * HexField3D — scroll-reactive "liquid glass" background for the homepage.
 *
 * Inspired by the iridescent-glass genre (haoqi.design et al.): a refractive
 * glass hexagon centrepiece with chromatic dispersion, orbited by morphing
 * molten-glass blobs, all lit by a warm orange studio environment so
 * reflections stay on-brand. Scroll rotates the field, dollies the camera,
 * and pushes the dispersion; the pointer adds parallax.
 *
 * Guardrails:
 * - Lazy-loaded chunk (three.js never blocks first paint)
 * - Skipped for prefers-reduced-motion / missing WebGL
 * - DPR capped; transmission kept cheap (low samples/res); fewer blobs + no
 *   transmissive centrepiece on mobile
 * - pointer-events:none, aria-hidden — purely decorative; theme-aware
 */

interface BlobData {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  distort: number;
  spin: number;
  bobPhase: number;
  bobAmp: number;
}

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Warm on-brand blob tints — molten orange through amber to cream
const BLOB_COLORS = ["#E85002", "#F16001", "#F97A1F", "#FFB07A", "#D9C3AB"];

const buildBlobs = (count: number): BlobData[] => {
  const rand = mulberry32(7);
  const blobs: BlobData[] = [];
  for (let i = 0; i < count; i++) {
    const z = -11 + rand() * 11; // -11 far … 0 near
    const depth = (z + 11) / 11;
    blobs.push({
      position: [(rand() - 0.5) * 26, (rand() - 0.5) * 15, z],
      scale: 0.7 + depth * 1.8 + rand() * 0.6,
      color: BLOB_COLORS[Math.floor(rand() * BLOB_COLORS.length)],
      speed: 0.6 + rand() * 1.4,
      distort: 0.3 + rand() * 0.35,
      spin: (rand() - 0.5) * 0.4,
      bobPhase: rand() * Math.PI * 2,
      bobAmp: 0.3 + rand() * 0.8,
    });
  }
  return blobs;
};

const GlassHex = ({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) => {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<any>(null);
  const geo = useMemo(() => new THREE.CylinderGeometry(1, 1, 0.5, 6), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const s = scrollRef.current;
    const g = ref.current;
    if (g) {
      g.rotation.z = t * 0.12 - s * Math.PI * 0.5;
      g.rotation.x = 0.4 + Math.sin(t * 0.2) * 0.15 + s * 0.4;
      g.position.y = 0.4 - s * 9;
      g.rotation.y += delta * 0.15;
    }
    // Dispersion intensifies as you scroll — the rainbow edges bloom
    if (matRef.current) matRef.current.chromaticAberration = 0.22 + s * 0.5;
  });

  return (
    <group ref={ref} position={[7.5, 0.4, -2]} scale={4.6} rotation={[0.4, 0, 0]}>
      <mesh geometry={geo}>
        <MeshTransmissionMaterial
          ref={matRef}
          samples={6}
          resolution={256}
          transmission={1}
          roughness={0.08}
          thickness={1.6}
          ior={1.35}
          chromaticAberration={0.3}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.4}
          temporalDistortion={0.2}
          attenuationColor="#ffd9bd"
          attenuationDistance={2}
          color="#fff2e8"
        />
      </mesh>
    </group>
  );
};

const Blob = ({ data }: { data: BlobData }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const m = ref.current;
    if (m) {
      m.rotation.x += data.spin * delta;
      m.rotation.y += data.spin * 0.7 * delta;
      m.position.y = data.position[1] + Math.sin(t * 0.4 + data.bobPhase) * data.bobAmp;
    }
  });
  return (
    <mesh ref={ref} position={data.position} scale={data.scale}>
      <icosahedronGeometry args={[1, 8]} />
      <MeshDistortMaterial
        color={data.color}
        speed={data.speed}
        distort={data.distort}
        metalness={0.9}
        roughness={0.12}
        envMapIntensity={1.4}
      />
    </mesh>
  );
};

const Scene = ({
  blobs,
  includeGlass,
  degraded,
}: {
  blobs: BlobData[];
  includeGlass: boolean;
  degraded: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const scrollRef = useRef(0);
  const smooth = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

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
    smooth.current += (scrollRef.current - smooth.current) * Math.min(delta * 4, 1);
    const s = smooth.current;
    const g = groupRef.current;
    if (g) {
      g.rotation.y = s * Math.PI * 0.55 + pointer.current.x * 0.08;
      g.rotation.x = s * 0.28 + pointer.current.y * 0.05;
      g.position.y = s * 7;
    }
    camera.position.z = 14 - s * 4.5;
    camera.position.y = s * 1.5;
    camera.position.x += (pointer.current.x * 0.6 - camera.position.x) * Math.min(delta * 2, 1);
    camera.lookAt(0, s * 2, 0);
  });

  // On weak hardware: render half the blobs and drop the transmissive centrepiece
  const activeBlobs = degraded ? blobs.slice(0, Math.ceil(blobs.length / 2)) : blobs;

  return (
    <>
      {/* Warm studio environment — drives every reflection/refraction on-brand */}
      <Environment resolution={degraded ? 128 : 256} frames={1}>
        <color attach="background" args={["#0a0a0a"]} />
        <Lightformer intensity={3} color="#F16001" position={[-5, 3, 2]} scale={[6, 6, 1]} />
        <Lightformer intensity={2.2} color="#FFB07A" position={[5, -2, 1]} scale={[5, 5, 1]} />
        <Lightformer intensity={1.6} color="#D9C3AB" position={[0, 5, -3]} scale={[8, 3, 1]} />
        <Lightformer intensity={2.5} color="#ffffff" position={[3, 4, 4]} scale={[3, 3, 1]} />
      </Environment>

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 4]} intensity={1.2} color="#ffd9bd" />

      <group ref={groupRef}>
        {activeBlobs.map((b, i) => (
          <Blob key={i} data={b} />
        ))}
      </group>

      {includeGlass && !degraded && <GlassHex scrollRef={smooth} />}
    </>
  );
};

const HexField3D = () => {
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(false);
  // Sticky: once we drop to lite mode we stay there, to avoid the glass
  // centrepiece popping in and out as FPS hovers around the threshold.
  const [degraded, setDegraded] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;
    setReady(true);

    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const blobs = useMemo(() => buildBlobs(isMobile ? 5 : 9), [isMobile]);

  if (!ready) return null;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      style={{ opacity: isDark ? 0.9 : 0.8 }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 14], fov: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        {/* Watches the frame rate: a sustained decline flips to lite mode,
            and after too many flip-flops onFallback locks it there. */}
        <PerformanceMonitor
          bounds={() => [45, 60]}
          flipflops={3}
          onDecline={() => setDegraded(true)}
          onFallback={() => setDegraded(true)}
        >
          <Scene blobs={blobs} includeGlass={!isMobile} degraded={degraded} />
        </PerformanceMonitor>
        {/* Auto-scales render resolution down under load, back up when idle */}
        <AdaptiveDpr pixelated />
      </Canvas>
      {/* Film grain — the premium texture layer over the glass */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.15]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
};

export default HexField3D;
