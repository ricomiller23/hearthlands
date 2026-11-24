import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { GameState, Rotation } from '../engine/types.ts';
import { TileDiorama } from './tiles/TileDiorama.tsx';
import { FollowerMesh } from './FollowerMesh.tsx';
import { getWoodGrainTexture } from './materials/textures.ts';

interface BoardSceneProps {
  state: GameState;
  selectedCoord: { x: number; y: number } | null;
  candidateRotation: Rotation;
  legalPlacements: { x: number; y: number; rotation: Rotation }[];
  onSelectCoord: (coord: { x: number; y: number }) => void;
  cameraPreset?: 'iso' | 'top' | 'hero' | 'cinematic';
  zoomTrigger?: number; // increments to trigger zoom in/out
}

export const BoardScene: React.FC<BoardSceneProps> = ({
  state,
  selectedCoord,
  candidateRotation,
  legalPlacements,
  onSelectCoord,
  cameraPreset = 'iso',
  zoomTrigger = 0,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

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
        camera={{ position: [0, 6.5, 7.5], fov: 40 }}
        className="w-full h-full bg-[#120f0d]"
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <CameraController preset={cameraPreset} zoomTrigger={zoomTrigger} controlsRef={controlsRef} />

        {/* Ambient & Directional Sun Lighting with Warm Medieval Tone */}
        <ambientLight intensity={0.65} color="#e2e8f0" />
        <directionalLight
          position={[12, 18, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
          shadow-camera-near={0.5}
          shadow-camera-far={45}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          color="#fff8ed"
        />
        {/* Soft Warm Rim Light */}
        <directionalLight
          position={[-12, 9, -10]}
          intensity={0.45}
          color="#fed7aa"
        />

        {/* Rich Walnut Tabletop Surface */}
        <TableSurface />

        {/* Realistic Placed Diorama Tiles */}
        {placedTiles.map((tile) => (
          <TileDiorama key={tile.instanceId} tile={tile} />
        ))}

        {/* Sculpted Medieval Follower Figurines */}
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

        {/* Smooth OrbitControls with Macro Zoom Inspection */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          enableZoom={true}
          zoomSpeed={1.25}
          minDistance={0.8}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.14}
        />
      </Canvas>
    </div>
  );
};

// ----------------------------------------------------
// Rich Walnut Table Surface with Concentric Inlay
// ----------------------------------------------------
const TableSurface: React.FC = () => {
  const tableWoodTex = useMemo(() => getWoodGrainTexture(true), []);

  return (
    <group position={[0, -0.06, 0]}>
      {/* Heavy Timber Gaming Table Slab */}
      <mesh receiveShadow position={[0, -0.25, 0]}>
        <cylinderGeometry args={[24, 24, 0.5, 48]} />
        <meshStandardMaterial
          map={tableWoodTex}
          roughness={0.7}
          metalness={0.08}
        />
      </mesh>
      {/* Gilded Brass Ring Inlay */}
      <mesh receiveShadow position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[11, 11.08, 64]} />
        <meshStandardMaterial
          color="#fbbf24"
          roughness={0.35}
          metalness={0.65}
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
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = 0.04 + Math.sin(t * 3.5 + x + y) * 0.015;
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
        <boxGeometry args={[0.9, 0.02, 0.9]} />
        <meshStandardMaterial
          color={isSelected ? '#f59e0b' : '#38bdf8'}
          emissive={isSelected ? '#d97706' : '#0284c7'}
          emissiveIntensity={isSelected ? 0.7 : 0.35}
          transparent
          opacity={0.7}
          roughness={0.3}
        />
      </mesh>
      {/* Golden Rune Ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.052, 0]}
      >
        <ringGeometry args={[0.3, 0.38, 24]} />
        <meshBasicMaterial
          color={isSelected ? '#fbbf24' : '#7dd3fc'}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// Camera Viewpoint Controller with Zoom Trigger Support
// ----------------------------------------------------
const CameraController: React.FC<{
  preset: 'iso' | 'top' | 'hero' | 'cinematic';
  zoomTrigger: number;
  controlsRef: React.RefObject<OrbitControlsImpl>;
}> = ({ preset, zoomTrigger, controlsRef }) => {
  const angleRef = useRef(0);
  const { camera } = useThree();
  const lastPresetRef = useRef(preset);
  const lastZoomRef = useRef(zoomTrigger);

  // Handle on-screen zoom delta triggers
  useFrame((_, delta) => {
    if (controlsRef.current && zoomTrigger !== lastZoomRef.current) {
      const diff = zoomTrigger - lastZoomRef.current;
      lastZoomRef.current = zoomTrigger;

      // Adjust camera distance towards/away from target
      const target = controlsRef.current.target;
      const dir = camera.position.clone().sub(target);
      const factor = diff > 0 ? 0.8 : 1.25; // zoom in or out
      const newPos = target.clone().add(dir.multiplyScalar(factor));

      const dist = newPos.distanceTo(target);
      if (dist >= 0.8 && dist <= 30) {
        camera.position.copy(newPos);
        controlsRef.current.update();
      }
    }

    if (preset === 'cinematic') {
      angleRef.current += delta * 0.22;
      const r = 9;
      camera.position.x = Math.sin(angleRef.current) * r;
      camera.position.z = Math.cos(angleRef.current) * r;
      camera.position.y = 5.2;
      camera.lookAt(0, 0, 0);
      return;
    }

    // Smooth transition when preset changes
    if (preset !== lastPresetRef.current) {
      lastPresetRef.current = preset;
      let targetPos = new THREE.Vector3(5.5, 6.5, 6.5);
      if (preset === 'top') {
        targetPos = new THREE.Vector3(0, 11, 0.01);
      } else if (preset === 'hero') {
        targetPos = new THREE.Vector3(0, 2.2, 3.8);
      } else if (preset === 'iso') {
        targetPos = new THREE.Vector3(5.5, 6.5, 6.5);
      }
      camera.position.lerp(targetPos, 0.08);
      if (controlsRef.current) controlsRef.current.target.set(0, 0, 0);
    }
  });

  return null;
};
