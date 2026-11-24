import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GameState, Rotation } from '../engine/types.ts';
import { TileDiorama } from './tiles/TileDiorama.tsx';
import { FollowerMesh } from './FollowerMesh.tsx';

interface BoardSceneProps {
  state: GameState;
  selectedCoord: { x: number; y: number } | null;
  candidateRotation: Rotation;
  legalPlacements: { x: number; y: number; rotation: Rotation }[];
  onSelectCoord: (coord: { x: number; y: number }) => void;
  cameraPreset?: 'iso' | 'top' | 'hero' | 'cinematic';
}

export const BoardScene: React.FC<BoardSceneProps> = ({
  state,
  selectedCoord,
  candidateRotation,
  legalPlacements,
  onSelectCoord,
  cameraPreset = 'iso',
}) => {
  // Extract unique (x, y) coordinates from legal placements
  const uniqueCandidateCoords = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    legalPlacements.forEach((p) => {
      map.set(`${p.x},${p.y}`, { x: p.x, y: p.y });
    });
    return Array.from(map.values());
  }, [legalPlacements]);

  const placedTiles = useMemo(() => {
    return Array.from(state.board.values());
  }, [state.board]);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ position: [0, 8, 8], fov: 42 }}
        className="w-full h-full bg-[#120f0d]"
      >
        <CameraController preset={cameraPreset} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.55} color="#dbeafe" />
        <directionalLight
          position={[10, 16, 8]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
          color="#fffbeb"
        />
        {/* Soft Warm Rim Light */}
        <directionalLight
          position={[-10, 8, -10]}
          intensity={0.4}
          color="#fed7aa"
        />

        {/* Medieval Table Surface */}
        <TableSurface />

        {/* Placed Diorama Tiles */}
        {placedTiles.map((tile) => (
          <TileDiorama key={tile.instanceId} tile={tile} />
        ))}

        {/* Placed Followers */}
        {state.followers.map((f) => {
          const tile = state.board.get(`${f.x},${f.y}`);
          if (!tile) return null;
          return <FollowerMesh key={f.id} follower={f} tile={tile} />;
        })}

        {/* Candidate Placement Markers (Ghosts) */}
        {state.phase === 'PLACE_TILE' &&
          state.turn === 'player' &&
          uniqueCandidateCoords.map((coord) => {
            const isSelected =
              selectedCoord?.x === coord.x && selectedCoord?.y === coord.y;

            return (
              <CandidateMarker
                key={`${coord.x},${coord.y}`}
                x={coord.x}
                y={coord.y}
                isSelected={isSelected}
                onClick={() => onSelectCoord(coord)}
              />
            );
          })}

        {/* Selected Tile Preview Ghost */}
        {state.phase === 'PLACE_TILE' &&
          state.turn === 'player' &&
          selectedCoord &&
          state.currentTile && (
            <TileDiorama
              tile={{
                instanceId: 99999,
                code: state.currentTile,
                x: selectedCoord.x,
                y: selectedCoord.y,
                rotation: candidateRotation,
              }}
              isGhost={true}
              isSelected={true}
            />
          )}

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.12}
        />
      </Canvas>
    </div>
  );
};

// ----------------------------------------------------
// Wooden Gaming Table
// ----------------------------------------------------
const TableSurface: React.FC = () => {
  return (
    <group position={[0, -0.06, 0]}>
      {/* Wood Slab Base */}
      <mesh receiveShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[22, 22, 0.4, 48]} />
        <meshStandardMaterial
          color="#1e1713"
          roughness={0.88}
          metalness={0.05}
        />
      </mesh>
      {/* Table Ring Inlay */}
      <mesh receiveShadow position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[12, 12.06, 64]} />
        <meshStandardMaterial
          color="#854d0e"
          roughness={0.5}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// Candidate Placement Rune Marker
// ----------------------------------------------------
const CandidateMarker: React.FC<{
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ x, y, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const posX = x * 1.06;
  const posZ = -y * 1.06;

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating pulsing animation
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = 0.04 + Math.sin(t * 3 + x + y) * 0.015;
    }
  });

  return (
    <group position={[posX, 0, posZ]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        position={[0, 0.04, 0]}
        receiveShadow
      >
        <boxGeometry args={[0.88, 0.02, 0.88]} />
        <meshStandardMaterial
          color={isSelected ? '#f59e0b' : '#38bdf8'}
          emissive={isSelected ? '#d97706' : '#0284c7'}
          emissiveIntensity={isSelected ? 0.6 : 0.3}
          transparent
          opacity={0.65}
          roughness={0.3}
        />
      </mesh>
      {/* Pulsing ring indicator */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
      >
        <ringGeometry args={[0.3, 0.36, 24]} />
        <meshBasicMaterial
          color={isSelected ? '#fbbf24' : '#7dd3fc'}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// Camera Viewpoint Controller
// ----------------------------------------------------
const CameraController: React.FC<{
  preset: 'iso' | 'top' | 'hero' | 'cinematic';
}> = ({ preset }) => {
  const angleRef = useRef(0);

  useFrame((state, delta) => {
    const camera = state.camera;

    if (preset === 'cinematic') {
      angleRef.current += delta * 0.25;
      const r = 10;
      camera.position.x = Math.sin(angleRef.current) * r;
      camera.position.z = Math.cos(angleRef.current) * r;
      camera.position.y = 6;
      camera.lookAt(0, 0, 0);
      return;
    }

    let targetPos = new THREE.Vector3(0, 8, 8);
    if (preset === 'top') {
      targetPos = new THREE.Vector3(0, 13, 0.01);
    } else if (preset === 'hero') {
      targetPos = new THREE.Vector3(0, 3.2, 5.5);
    } else if (preset === 'iso') {
      targetPos = new THREE.Vector3(6, 7, 7);
    }

    camera.position.lerp(targetPos, 0.05);
  });

  return null;
};
