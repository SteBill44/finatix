import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function GeometricShape({ position, rotation, scale, color }: { 
  position: [number, number, number]; 
  rotation: [number, number, number];
  scale: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.15} 
          wireframe 
        />
      </mesh>
    </Float>
  );
}

function TorusShape({ position, scale, color }: { 
  position: [number, number, number]; 
  scale: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.z += 0.002;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.12} 
          wireframe 
        />
      </mesh>
    </Float>
  );
}

function OctahedronShape({ position, scale, color }: { 
  position: [number, number, number]; 
  scale: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.z += 0.001;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.1} 
          wireframe 
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  const primaryColor = "#0d9488"; // teal
  const accentColor = "#7c3aed"; // purple
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.3} />
      
      {/* Scattered geometric shapes */}
      <GeometricShape position={[-4, 2, -5]} rotation={[0.5, 0.5, 0]} scale={1.5} color={primaryColor} />
      <GeometricShape position={[5, -2, -8]} rotation={[0.3, 0.2, 0.1]} scale={2} color={accentColor} />
      <GeometricShape position={[-6, -3, -6]} rotation={[0.1, 0.4, 0.2]} scale={1.2} color={primaryColor} />
      <GeometricShape position={[7, 3, -10]} rotation={[0.2, 0.1, 0.3]} scale={2.5} color={primaryColor} />
      
      <TorusShape position={[3, 1, -4]} scale={1} color={accentColor} />
      <TorusShape position={[-5, 0, -7]} scale={1.5} color={primaryColor} />
      <TorusShape position={[6, -3, -9]} scale={1.8} color={accentColor} />
      
      <OctahedronShape position={[0, 3, -6]} scale={1.3} color={primaryColor} />
      <OctahedronShape position={[-3, -2, -5]} scale={0.9} color={accentColor} />
      <OctahedronShape position={[4, 0, -7]} scale={1.1} color={primaryColor} />
    </>
  );
}

const DynamicBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default DynamicBackground;
