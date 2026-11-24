import React, { useMemo } from 'react';
import { PlacedTile } from '../../engine/types.ts';
import { TILE_MAP } from '../../engine/tiles.ts';

interface TileDioramaProps {
  tile: PlacedTile;
  isGhost?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export const TileDiorama: React.FC<TileDioramaProps> = ({
  tile,
  isGhost = false,
  isSelected = false,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const tileDef = useMemo(() => TILE_MAP.get(tile.code), [tile.code]);

  // Convert board coords to 3D world coords: x -> x * 1.05, y -> -y * 1.05
  // Board North (+y) is -z in 3D world
  const posX = tile.x * 1.06;
  const posZ = -tile.y * 1.06;
  const rotY = -tile.rotation * (Math.PI / 2);

  const hasMonastery = tileDef?.features.some((f) => f.type === 'monastery');
  const hasShield = tileDef?.features.some((f) => f.shield);
  const cityFeatures = tileDef?.features.filter((f) => f.type === 'city') || [];
  const roadFeatures = tileDef?.features.filter((f) => f.type === 'road') || [];

  return (
    <group
      position={[posX, 0, posZ]}
      rotation={[0, rotY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver?.();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerOut?.();
      }}
    >
      {/* Stone Base Plinth */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.1, 1.0]} />
        <meshStandardMaterial
          color={isGhost ? '#60a5fa' : isSelected ? '#fbbf24' : '#38322c'}
          roughness={0.85}
          metalness={0.1}
          transparent={isGhost}
          opacity={isGhost ? 0.45 : 1.0}
        />
      </mesh>

      {/* Lush Meadow Grass Layer */}
      <mesh position={[0, 0.11, 0]} receiveShadow>
        <boxGeometry args={[0.96, 0.04, 0.96]} />
        <meshStandardMaterial
          color={isGhost ? '#93c5fd' : '#4d7c35'}
          roughness={0.7}
          transparent={isGhost}
          opacity={isGhost ? 0.45 : 1.0}
        />
      </mesh>

      {/* Roads */}
      {!isGhost && roadFeatures.length > 0 && (
        <RoadMesh tileCode={tile.code} />
      )}

      {/* Cities */}
      {!isGhost && cityFeatures.length > 0 && (
        <CityMesh tileCode={tile.code} hasShield={!!hasShield} />
      )}

      {/* Monastery */}
      {!isGhost && hasMonastery && (
        <MonasteryMesh tileCode={tile.code} />
      )}

      {/* Decorative nature: trees, shrubs */}
      {!isGhost && !hasMonastery && cityFeatures.length === 0 && (
        <NatureDecorations tileCode={tile.code} />
      )}
    </group>
  );
};

// ----------------------------------------------------
// 3D Procedural Roads
// ----------------------------------------------------
const RoadMesh: React.FC<{ tileCode: string }> = ({ tileCode }) => {
  // Render gravel path based on tile geometry
  return (
    <group position={[0, 0.132, 0]}>
      {tileCode === 'U' || tileCode === 'D' ? (
        // Straight road E-W (along x axis)
        <mesh receiveShadow>
          <boxGeometry args={[1.0, 0.01, 0.18]} />
          <meshStandardMaterial color="#cbbb98" roughness={0.9} />
        </mesh>
      ) : tileCode === 'V' ? (
        // Curved road W to S
        <group>
          <mesh position={[-0.25, 0, 0]} receiveShadow>
            <boxGeometry args={[0.5, 0.01, 0.18]} />
            <meshStandardMaterial color="#cbbb98" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.25]} receiveShadow>
            <boxGeometry args={[0.18, 0.01, 0.5]} />
            <meshStandardMaterial color="#cbbb98" roughness={0.9} />
          </mesh>
          <mesh position={[-0.1, 0, 0.1]} receiveShadow>
            <boxGeometry args={[0.22, 0.01, 0.22]} />
            <meshStandardMaterial color="#cbbb98" roughness={0.9} />
          </mesh>
        </group>
      ) : tileCode === 'W' || tileCode === 'L' ? (
        // T-Junction: E, S, W meeting in village cross
        <group>
          <mesh position={[0.25, 0, 0]} receiveShadow>
            <boxGeometry args={[0.5, 0.01, 0.18]} />
            <meshStandardMaterial color="#cbbb98" roughness={0.9} />
          </mesh>
          <mesh position={[-0.25, 0, 0]} receiveShadow>
            <boxGeometry args={[0.5, 0.01, 0.18]} />
            <meshStandardMaterial color="#cbbb98" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.25]} receiveShadow>
            <boxGeometry args={[0.18, 0.01, 0.5]} />
            <meshStandardMaterial color="#cbbb98" roughness={0.9} />
          </mesh>
          {/* Waymarker stone */}
          <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.08, 6]} />
            <meshStandardMaterial color="#8a847d" roughness={0.9} />
          </mesh>
        </group>
      ) : tileCode === 'X' ? (
        // 4-way Crossroads
        <group>
          <mesh receiveShadow>
            <boxGeometry args={[1.0, 0.01, 0.18]} />
            <meshStandardMaterial color="#cbbb98" roughness={0.9} />
          </mesh>
          <mesh receiveShadow>
            <boxGeometry args={[0.18, 0.01, 1.0]} />
            <meshStandardMaterial color="#cbbb98" roughness={0.9} />
          </mesh>
          {/* Central stone cross */}
          <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.06, 0.12, 0.06]} />
            <meshStandardMaterial color="#78716c" roughness={0.9} />
          </mesh>
        </group>
      ) : (
        // Default straight or stub road
        <mesh position={[0, 0, 0.25]} receiveShadow>
          <boxGeometry args={[0.18, 0.01, 0.5]} />
          <meshStandardMaterial color="#cbbb98" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
};

// ----------------------------------------------------
// 3D Procedural Cities
// ----------------------------------------------------
const CityMesh: React.FC<{ tileCode: string; hasShield: boolean }> = ({ tileCode, hasShield }) => {
  if (tileCode === 'C') {
    // Completely fortified city (entire tile)
    return (
      <group position={[0, 0.13, 0]}>
        {/* City Floor */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[0.92, 0.04, 0.92]} />
          <meshStandardMaterial color="#948e85" roughness={0.9} />
        </mesh>
        {/* Fortress Walls along 4 edges */}
        {[
          [0, 0.1, -0.44, 0.92, 0.16, 0.08],
          [0, 0.1, 0.44, 0.92, 0.16, 0.08],
          [-0.44, 0.1, 0, 0.08, 0.16, 0.92],
          [0.44, 0.1, 0, 0.08, 0.16, 0.92],
        ].map(([x, y, z, w, h, d], idx) => (
          <mesh key={idx} position={[x, y, z]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#645d56" roughness={0.8} />
          </mesh>
        ))}
        {/* Clustered houses inside */}
        <HouseCluster />
        {/* Tower Spire */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.28, 8]} />
          <meshStandardMaterial color="#504840" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.11, 0.18, 8]} />
          <meshStandardMaterial color="#2c3e50" roughness={0.6} />
        </mesh>
      </group>
    );
  }

  // Semi-circular city caps (e.g. E, D, J, K, etc.)
  return (
    <group position={[0, 0.13, -0.32]}>
      {/* Stone Wall Curved Arc */}
      <mesh position={[0, 0.08, 0.12]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.4, 0.16, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#68615a" roughness={0.8} />
      </mesh>
      {/* Houses nestled within wall */}
      <group position={[0, 0.04, -0.06]}>
        <mesh position={[-0.12, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.12, 0.14]} />
          <meshStandardMaterial color="#dfd7cb" roughness={0.8} />
        </mesh>
        <mesh position={[-0.12, 0.14, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.12, 0.1, 4]} />
          <meshStandardMaterial color="#963b28" roughness={0.7} />
        </mesh>
        <mesh position={[0.12, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.12, 0.14]} />
          <meshStandardMaterial color="#d4cbbd" roughness={0.8} />
        </mesh>
        <mesh position={[0.12, 0.14, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.12, 0.1, 4]} />
          <meshStandardMaterial color="#2d3748" roughness={0.7} />
        </mesh>
      </group>
      {/* Heraldic Shield */}
      {hasShield && (
        <group position={[0, 0.18, 0.22]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.08, 0.1, 0.02]} />
            <meshStandardMaterial color="#2563eb" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[0.06, 0.02, 0.01]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
};

const HouseCluster: React.FC = () => {
  return (
    <group position={[0, 0.05, 0]}>
      {[-0.2, 0.2].map((x) =>
        [-0.2, 0.2].map((z) => (
          <group key={`${x},${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.16, 0.1, 0.14]} />
              <meshStandardMaterial color="#d8d0c2" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.12, 0.09, 4]} />
              <meshStandardMaterial color={x < 0 ? '#9b3924' : '#334155'} roughness={0.7} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
};

// ----------------------------------------------------
// 3D Procedural Monastery
// ----------------------------------------------------
const MonasteryMesh: React.FC<{ tileCode: string }> = () => {
  return (
    <group position={[0, 0.13, 0]}>
      {/* Cloister stone platform */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[0.6, 0.03, 0.6]} />
        <meshStandardMaterial color="#b5a796" roughness={0.9} />
      </mesh>
      {/* Main Abbey Nave */}
      <mesh position={[-0.08, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.18, 0.38]} />
        <meshStandardMaterial color="#d4c9b9" roughness={0.8} />
      </mesh>
      {/* Abbey Pitched Roof */}
      <mesh position={[-0.08, 0.23, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.22, 0.14, 4]} />
        <meshStandardMaterial color="#882e1e" roughness={0.7} />
      </mesh>
      {/* Bell Tower */}
      <mesh position={[0.16, 0.16, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 0.32, 0.14]} />
        <meshStandardMaterial color="#c0b3a1" roughness={0.8} />
      </mesh>
      {/* Bell Spire & Cross */}
      <mesh position={[0.16, 0.38, 0.1]} castShadow receiveShadow>
        <coneGeometry args={[0.11, 0.18, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh position={[0.16, 0.5, 0.1]} castShadow>
        <boxGeometry args={[0.015, 0.08, 0.015]} />
        <meshStandardMaterial color="#d97706" metalness={0.6} />
      </mesh>
      {/* Cloister Garden Quadrangle */}
      <mesh position={[0.14, 0.03, -0.12]} receiveShadow>
        <boxGeometry args={[0.22, 0.02, 0.22]} />
        <meshStandardMaterial color="#406b29" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 3D Nature Decorations (Trees, Haystacks)
// ----------------------------------------------------
const NatureDecorations: React.FC<{ tileCode: string }> = () => {
  return (
    <group position={[0, 0.13, 0]}>
      {/* Miniature Tree 1 */}
      <group position={[-0.28, 0, -0.28]}>
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.08, 6]} />
          <meshStandardMaterial color="#5c3d22" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#355e24" roughness={0.7} />
        </mesh>
      </group>
      {/* Miniature Tree 2 */}
      <group position={[0.26, 0, 0.26]}>
        <mesh position={[0, 0.035, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.018, 0.022, 0.07, 6]} />
          <meshStandardMaterial color="#5c3d22" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#42702d" roughness={0.7} />
        </mesh>
      </group>
      {/* Miniature Haystack */}
      <mesh position={[0.24, 0.03, -0.22]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.06, 8]} />
        <meshStandardMaterial color="#d4b254" roughness={0.9} />
      </mesh>
    </group>
  );
};
