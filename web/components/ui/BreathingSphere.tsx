"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null);
  const timeRef = useRef(0);

  // Particle positions for background fog
  const particles = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
    }
    return positions;
  }, []);

  useFrame((state) => {
    timeRef.current += 0.003;
    const t = timeRef.current;

    if (meshRef.current) {
      // Slow breathing scale — 4s cycle
      const breathe = Math.sin(t * Math.PI * 0.5) * 0.5 + 0.5;
      const scale = 1.0 + breathe * 0.12;
      meshRef.current.scale.setScalar(scale);

      // Very gentle rotation
      meshRef.current.rotation.y = t * 0.08;
      meshRef.current.rotation.x = Math.sin(t * 0.12) * 0.05;
    }

    if (materialRef.current) {
      const breathe = Math.sin(timeRef.current * Math.PI * 0.5) * 0.5 + 0.5;
      materialRef.current.distort = 0.25 + breathe * 0.2;
    }

    // Subtle camera drift
    state.camera.position.x = Math.sin(t * 0.07) * 0.3;
    state.camera.position.y = Math.cos(t * 0.05) * 0.15;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Main breathing sphere */}
      <Sphere ref={meshRef} args={[1.4, 64, 64]}>
        <MeshDistortMaterial
          ref={materialRef}
          color="#5a7a5a"
          emissive="#2a4a2a"
          emissiveIntensity={0.3}
          roughness={0.25}
          metalness={0.1}
          distort={0.35}
          speed={1.2}
          transparent
          opacity={0.92}
        />
      </Sphere>

      {/* Inner glow sphere */}
      <Sphere args={[1.1, 32, 32]}>
        <meshBasicMaterial
          color="#7a9a7a"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Outer halo */}
      <Sphere args={[1.9, 32, 32]}>
        <meshBasicMaterial
          color="#5a7a5a"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Background particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#8c9a8c"
          size={0.018}
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>

      {/* Lighting */}
      <ambientLight intensity={0.6} color="#e8f0e8" />
      <directionalLight
        position={[3, 5, 3]}
        intensity={1.2}
        color="#ffffff"
      />
      <pointLight
        position={[-3, -2, -2]}
        intensity={0.5}
        color="#3a5a3a"
      />
      <pointLight
        position={[2, -3, 1]}
        intensity={0.3}
        color="#8ab08a"
      />
    </>
  );
}

interface BreathingSphereProps {
  className?: string;
}

export default function BreathingSphere({ className = "" }: BreathingSphereProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <AnimatedSphere />
      </Canvas>
    </div>
  );
}
