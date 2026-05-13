import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Particles = ({ count = 800 }: { count?: number }) => {
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
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.1;
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

const FloatingShape = ({ position, scale, color, speed }: { position: [number, number, number]; scale: number; color: string; speed: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.y = t * 0.4;
    ref.current.position.y = position[1] + Math.sin(t) * 0.3;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.25} />
    </mesh>
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
          <Particles count={700} />
          <FloatingShape position={[-4, 1.5, -2]} scale={0.9} color="#f97316" speed={0.3} />
          <FloatingShape position={[4, -1, -3]} scale={1.3} color="#fb923c" speed={0.25} />
          <FloatingShape position={[2, 2.5, -4]} scale={0.6} color="#fdba74" speed={0.4} />
          <FloatingShape position={[-3, -2, -2]} scale={0.7} color="#fb923c" speed={0.35} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Background3D;
