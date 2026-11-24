import React, { useMemo } from 'react';
import { Follower, PlacedTile } from '../engine/types.ts';
import { TILE_FEATURE_ANCHORS, rotateLocalPos } from './tiles/layouts.ts';

interface FollowerMeshProps {
  follower: Follower;
  tile: PlacedTile;
}

export const FollowerMesh: React.FC<FollowerMeshProps> = ({ follower, tile }) => {
  const isPlayer = follower.playerId === 'player';
  const mainColor = isPlayer ? '#2563eb' : '#dc2626';
  const trimColor = isPlayer ? '#fbbf24' : '#1e1b18';

  // Compute anchor in 3D world
  const anchor = useMemo(() => {
    const list = TILE_FEATURE_ANCHORS[tile.code] || [];
    const found = list.find((a) => a.featureId === follower.featureId) || {
      featureId: follower.featureId,
      x: 0,
      y: 0,
      z: 0.18,
    };
    return rotateLocalPos(found, tile.rotation);
  }, [tile.code, tile.rotation, follower.featureId]);

  // World coordinates:
  // Tile center is at [tile.x * 1.06, 0, -tile.y * 1.06]
  // Local x maps to world +x, local y maps to world -z
  const worldX = tile.x * 1.06 + anchor.x * 1.0;
  const worldZ = -tile.y * 1.06 - anchor.y * 1.0;
  const worldY = 0.12 + anchor.z;

  const isFarmer = follower.role === 'farmer';

  return (
    <group
      position={[worldX, worldY, worldZ]}
      rotation={isFarmer ? [Math.PI / 2, 0, Math.PI / 4] : [0, 0, 0]}
    >
      {/* Wooden Meeple Figure */}
      {/* Head */}
      <mesh position={[0, isFarmer ? 0 : 0.16, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color={mainColor} roughness={0.5} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, isFarmer ? -0.06 : 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.09, 0.04]} />
        <meshStandardMaterial color={mainColor} roughness={0.5} />
      </mesh>

      {/* Outstretched Arms */}
      <mesh position={[0, isFarmer ? -0.04 : 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.13, 0.035, 0.035]} />
        <meshStandardMaterial color={mainColor} roughness={0.5} />
      </mesh>

      {/* Legs (Flared) */}
      <mesh position={[-0.03, isFarmer ? -0.13 : 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.032, 0.07, 0.038]} />
        <meshStandardMaterial color={mainColor} roughness={0.5} />
      </mesh>
      <mesh position={[0.03, isFarmer ? -0.13 : 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.032, 0.07, 0.038]} />
        <meshStandardMaterial color={mainColor} roughness={0.5} />
      </mesh>

      {/* Role Prop: Knight Banner or Staff */}
      {follower.role === 'knight' && (
        <group position={[0.07, 0.12, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.22, 6]} />
            <meshStandardMaterial color="#854d0e" roughness={0.8} />
          </mesh>
          <mesh position={[0.03, 0.07, 0]} castShadow>
            <boxGeometry args={[0.06, 0.05, 0.005]} />
            <meshStandardMaterial color={trimColor} roughness={0.4} />
          </mesh>
        </group>
      )}

      {follower.role === 'thief' && (
        <mesh position={[0.06, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.004, 0.004, 0.18, 6]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
};
