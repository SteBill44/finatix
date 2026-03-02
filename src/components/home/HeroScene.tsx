import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingTorus({ position, scale, speed, color }: { position: [number, number, number]; scale: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.5;
    ref.current.rotation.y += speed * 0.003;
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.8} floatingRange={[-0.2, 0.2]}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusGeometry args={[1, 0.35, 24, 48]} />
        <MeshTransmissionMaterial
          color={color}
          roughness={0.1}
          transmission={0.95}
          thickness={0.5}
          chromaticAberration={0.03}
          anisotropy={0.2}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          ior={1.5}
          backside
        />
      </mesh>
    </Float>
  );
}

function FloatingOctahedron({ position, scale, speed, color }: { position: [number, number, number]; scale: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    ref.current.rotation.y += speed * 0.004;
    ref.current.rotation.z = Math.cos(state.clock.elapsedTime * speed * 0.2) * 0.3;
  });

  return (
    <Float speed={speed * 0.8} rotationIntensity={0.6} floatIntensity={1} floatingRange={[-0.3, 0.3]}>
      <mesh ref={ref} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          color={color}
          roughness={0.05}
          transmission={0.92}
          thickness={0.8}
          chromaticAberration={0.05}
          anisotropy={0.1}
          distortion={0.15}
          distortionScale={0.3}
          temporalDistortion={0.05}
          ior={1.6}
          backside
        />
      </mesh>
    </Float>
  );
}

function FloatingIcosahedron({ position, scale, speed, color }: { position: [number, number, number]; scale: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    ref.current.rotation.x += speed * 0.002;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * speed * 0.25) * 0.4;
  });

  return (
    <Float speed={speed * 1.2} rotationIntensity={0.5} floatIntensity={0.6} floatingRange={[-0.15, 0.15]}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          color={color}
          roughness={0.08}
          transmission={0.9}
          thickness={0.6}
          chromaticAberration={0.04}
          distortion={0.08}
          distortionScale={0.15}
          temporalDistortion={0.08}
          ior={1.55}
          backside
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const count = 60;
  const mesh = useRef<THREE.InstancedMesh>(null!);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8,
        ] as [number, number, number],
        speed: 0.2 + Math.random() * 0.6,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.5,
        p.position[1] + Math.cos(t * p.speed * 0.8 + p.offset) * 0.4,
        p.position[2]
      );
      dummy.scale.setScalar(0.02 + Math.sin(t * p.speed + p.offset) * 0.01);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#20b2aa" transparent opacity={0.5} />
    </instancedMesh>
  );
}

function MouseLight() {
  const light = useRef<THREE.PointLight>(null!);
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    light.current.position.set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      3
    );
  });

  return <pointLight ref={light} intensity={2} color="#20b2aa" distance={10} />;
}

function Scene() {
  // Teal-ish and purple-ish colors matching the design tokens
  const teal = "#20b2aa";
  const purple = "#7c3aed";
  const mixed = "#4a9aad";

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[-3, -3, 2]} intensity={0.3} color={purple} />
      <MouseLight />

      {/* Main shapes - positioned to the right side */}
      <FloatingTorus position={[2.5, 0.5, -1]} scale={0.9} speed={1.2} color={teal} />
      <FloatingOctahedron position={[4, -1, -2]} scale={0.7} speed={0.9} color={purple} />
      <FloatingIcosahedron position={[1, -0.8, -0.5]} scale={0.55} speed={1.5} color={mixed} />
      <FloatingTorus position={[3.5, 1.8, -3]} scale={0.5} speed={0.7} color={purple} />
      <FloatingOctahedron position={[0.5, 1.5, -1.5]} scale={0.4} speed={1.1} color={teal} />
      
      {/* Subtle background shapes */}
      <FloatingIcosahedron position={[-1, -1.5, -4]} scale={0.35} speed={0.6} color={teal} />
      <FloatingTorus position={[5, 0, -4]} scale={0.45} speed={0.8} color={mixed} />

      <Particles />
    </>
  );
}

const HeroScene = () => {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "auto" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default HeroScene;
