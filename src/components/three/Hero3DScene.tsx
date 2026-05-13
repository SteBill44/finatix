import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const useHeroScroll = () => {
  const ref = useRef({ p: 0 });
  useFrame(() => {
    if (typeof window === "undefined") return;
    // 0 -> 1 across the first viewport of scroll
    const max = Math.max(1, window.innerHeight);
    const target = Math.min(1, Math.max(0, window.scrollY / max));
    ref.current.p += (target - ref.current.p) * 0.1;
  });
  return ref;
};

const FloatingCoin = ({ scrollRef }: { scrollRef: React.MutableRefObject<{ p: number }> }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const p = scrollRef.current.p;
    ref.current.rotation.y = state.clock.elapsedTime * 0.4 + p * Math.PI * 2;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15 + p * 0.6;
    const scale = 1 - p * 0.2;
    ref.current.scale.setScalar(scale);
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

const OrbitingSphere = ({
  radius,
  speed,
  size,
  color,
  offset = 0,
  scrollRef,
}: {
  radius: number;
  speed: number;
  size: number;
  color: string;
  offset?: number;
  scrollRef: React.MutableRefObject<{ p: number }>;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const p = scrollRef.current.p;
    const t = state.clock.elapsedTime * speed + offset + p * 6;
    const r = radius * (1 + p * 0.5);
    ref.current.position.x = Math.cos(t) * r;
    ref.current.position.z = Math.sin(t) * r;
    ref.current.position.y = Math.sin(t * 1.4) * 0.4 - p * 1.2;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.6} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  );
};

const CameraRig = ({ scrollRef }: { scrollRef: React.MutableRefObject<{ p: number }> }) => {
  useFrame((state) => {
    const p = scrollRef.current.p;
    state.camera.position.z = 5 + p * 2.5;
    state.camera.position.y = 0.5 - p * 1.5;
    state.camera.rotation.z = p * 0.25;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

const SceneContents = () => {
  const scrollRef = useHeroScroll();
  return (
    <>
      <CameraRig scrollRef={scrollRef} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <pointLight position={[-5, -5, -5]} intensity={0.6} color="#fb923c" />

      <FloatingCoin scrollRef={scrollRef} />
      <OrbitingSphere radius={2.4} speed={0.5} size={0.18} color="#fb923c" scrollRef={scrollRef} />
      <OrbitingSphere radius={2.8} speed={-0.35} size={0.12} color="#fdba74" offset={2} scrollRef={scrollRef} />
      <OrbitingSphere radius={2.1} speed={0.7} size={0.09} color="#f97316" offset={4} scrollRef={scrollRef} />

      <ContactShadows position={[0, -1.8, 0]} opacity={0.35} scale={8} blur={2.4} far={3} />
      <Environment preset="city" />
    </>
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
        <SceneContents />
      </Suspense>
    </Canvas>
  );
};

export default Hero3DScene;
