import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls } from '@react-three/drei';

const FlyingMail = ({ delay }) => {
    const meshRef = useRef();

    useFrame((state, delta) => {
        // Mail loops every 4 seconds, modified by a delay
        const t = (state.clock.elapsedTime + delay) % 4;
        const progress = t / 4;

        // Keep orbit framed inside viewport
        const x = -4.5 + (progress * 9);
        // Taller arc for giant sized scene, shifted up to clear the login box
        const y = 1.5 + Math.sin(progress * Math.PI) * 4;

        // Disappear exactly when it hits either point
        const scale = progress > 0.95 || progress < 0.05 ? 0 : 1;

        if (meshRef.current) {
            meshRef.current.position.set(x, y, 0);
            meshRef.current.rotation.x += delta * 2;
            meshRef.current.rotation.y += delta * 3;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[0.5, 0.3, 0.05]} />
            <meshBasicMaterial color="#f4f4f0" wireframe={true} />
        </mesh>
    );
};

const CollegeComputer = () => (
    <group position={[-4.5, 1.0, 0]} scale={[1.8, 1.8, 1.8]}>
        {/* Desk */}
        <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[2, 0.1, 1.5]} />
            <meshBasicMaterial color="#737373" wireframe={true} />
        </mesh>
        {/* Laptop Base */}
        <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[0.8, 0.05, 0.6]} />
            <meshBasicMaterial color="#f4f4f0" wireframe={true} />
        </mesh>
        {/* Laptop Screen */}
        <mesh position={[0, -0.2, -0.3]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.05]} />
            <meshBasicMaterial color="#f4f4f0" wireframe={true} />
        </mesh>
        {/* Student Body */}
        <mesh position={[0, 0.2, 0.5]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#737373" wireframe={true} />
        </mesh>
        <mesh position={[0, -0.3, 0.5]}>
            <cylinderGeometry args={[0.2, 0.4, 0.6, 8]} />
            <meshBasicMaterial color="#737373" wireframe={true} />
        </mesh>
    </group>
);

const CompanyBuilding = () => (
    <group position={[4.5, 1.0, 0]} scale={[1.8, 1.8, 1.8]}>
        {/* Building Base Block */}
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2, 4, 2]} />
            <meshBasicMaterial color="#737373" wireframe={true} />
        </mesh>
        {/* Server Level Ridges */}
        <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[2.2, 0.2, 2.2]} />
            <meshBasicMaterial color="#f4f4f0" wireframe={true} />
        </mesh>
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.2, 0.2, 2.2]} />
            <meshBasicMaterial color="#f4f4f0" wireframe={true} />
        </mesh>
        <mesh position={[0, -1.5, 0]}>
            <boxGeometry args={[2.2, 0.2, 2.2]} />
            <meshBasicMaterial color="#f4f4f0" wireframe={true} />
        </mesh>

        {/* Communication Antennas on top */}
        <mesh position={[-0.5, 2.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1, 4]} />
            <meshBasicMaterial color="#f4f4f0" wireframe={true} />
        </mesh>
        <mesh position={[0.5, 2.3, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 4]} />
            <meshBasicMaterial color="#f4f4f0" wireframe={true} />
        </mesh>
    </group>
);

const RetroMailScene = () => {
    const target = useRef([-5, -1, 0]);

    useFrame((state) => {
        // Settle out to Parallax interactivity based on the mouse
        state.camera.position.x += (state.pointer.x * 2 - state.camera.position.x) * 0.05;
        // Keep camera at neutral height level
        state.camera.position.y += (state.pointer.y * 1.5 - state.camera.position.y) * 0.05 + 0.5;
        state.camera.position.z += (7.5 - state.camera.position.z) * 0.05;

        // Smoothly look slightly upwards at the hoisted models
        target.current[0] += (0 - target.current[0]) * 0.1;
        target.current[1] += (1.0 - target.current[1]) * 0.1;

        state.camera.lookAt(target.current[0], target.current[1], target.current[2]);
    });

    return (
        <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
            <group>
                {/* The Old Style Matrix Grid Floor - Moved UP */}
                <gridHelper args={[40, 40, '#737373', '#1a1a1a']} position={[0, -0.5, 0]} />

                <CollegeComputer />
                <CompanyBuilding />

                {/* Continuously dispatching mail envelopes */}
                <FlyingMail delay={0} />
                <FlyingMail delay={1.3} />
                <FlyingMail delay={2.6} />
            </group>
        </PresentationControls>
    );
};

export const ParticleBackground = ({ noiseEnabled = true }) => (
    <div className="fixed inset-0 z-[-1] bg-vintage-dark overflow-hidden">
        {noiseEnabled && (
            <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}>
            </div>
        )}
        <Canvas camera={{ position: [0, -1, 6], fov: 60 }}>
            <RetroMailScene />
        </Canvas>
    </div>
);
