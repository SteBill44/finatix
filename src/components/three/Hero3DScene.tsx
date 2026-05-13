import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const FloatingCoin = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.4;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref} castShadow>
        <torusKnotGeometry args={[1.1, 0.36, 220, 32]} />
        <MeshDistortMaterial
          color="#f97316"
          roughness={0.15}
          metalness={0.85}
          distort={0.25}
          speed={1.5}
          envMapIntensity={1.2}
        />
      </mesh>
    </Float>
  );
};

const OrbitingSphere = ({ radius, speed, size, color, offset = 0 }: { radius: number; speed: number; size: number; color: string; offset?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = Math.sin(t * 1.4) * 0.4;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.6} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  );
};

const Hero3DScene = () => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.5, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.6} color="#fb923c" />

        <FloatingCoin />
        <OrbitingSphere radius={2.4} speed={0.5} size={0.18} color="#fb923c" />
        <OrbitingSphere radius={2.8} speed={-0.35} size={0.12} color="#fdba74" offset={2} />
        <OrbitingSphere radius={2.1} speed={0.7} size={0.09} color="#f97316" offset={4} />

        <ContactShadows position={[0, -1.8, 0]} opacity={0.35} scale={8} blur={2.4} far={3} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
};

export default Hero3DScene;
