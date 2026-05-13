import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Smooth-tracked scroll progress (0 at top, grows with scroll). Updated each frame.
const useScrollProgress = () => {
  const ref = useRef({ raw: 0, smooth: 0 });
  useFrame(() => {
    if (typeof window === "undefined") return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    ref.current.raw = window.scrollY / max;
    // simple lerp smoothing
    ref.current.smooth += (ref.current.raw - ref.current.smooth) * 0.08;
  });
  return ref;
};

const Particles = ({ count = 800, scrollRef }: { count?: number; scrollRef: React.MutableRefObject<{ raw: number; smooth: number }> }) => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const s = scrollRef.current.smooth;
    ref.current.rotation.y = state.clock.elapsedTime * 0.04 + s * Math.PI * 1.4;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.1 + s * 0.6;
    ref.current.position.y = -s * 2.5;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#f97316"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const FloatingShape = ({
  position,
  scale,
  color,
  speed,
  scrollFactor,
  scrollRef,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  scrollFactor: number;
  scrollRef: React.MutableRefObject<{ raw: number; smooth: number }>;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    const s = scrollRef.current.smooth;
    ref.current.rotation.x = t * 0.3 + s * 4 * scrollFactor;
    ref.current.rotation.y = t * 0.4 + s * 3 * scrollFactor;
    ref.current.position.y = position[1] + Math.sin(t) * 0.3 - s * 4 * scrollFactor;
    ref.current.position.x = position[0] + s * 1.6 * scrollFactor;
    const pulse = 1 + Math.sin(t * 1.5) * 0.05;
    ref.current.scale.setScalar(scale * pulse);
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.25} />
    </mesh>
  );
};

const SceneContents = () => {
  const scrollRef = useScrollProgress();
  return (
    <>
      <Particles count={700} scrollRef={scrollRef} />
      <FloatingShape position={[-4, 1.5, -2]} scale={0.9} color="#f97316" speed={0.3} scrollFactor={1} scrollRef={scrollRef} />
      <FloatingShape position={[4, -1, -3]} scale={1.3} color="#fb923c" speed={0.25} scrollFactor={-0.8} scrollRef={scrollRef} />
      <FloatingShape position={[2, 2.5, -4]} scale={0.6} color="#fdba74" speed={0.4} scrollFactor={0.6} scrollRef={scrollRef} />
      <FloatingShape position={[-3, -2, -2]} scale={0.7} color="#fb923c" speed={0.35} scrollFactor={-1.1} scrollRef={scrollRef} />
    </>
  );
};

const Background3D = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-br from-background via-[hsl(25,95%,85%)] to-[hsl(25,95%,75%)] dark:from-background dark:via-[hsl(25,60%,12%)] dark:to-[hsl(210,11%,8%)]">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Background3D;
