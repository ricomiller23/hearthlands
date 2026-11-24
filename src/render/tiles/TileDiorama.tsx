import * as THREE from 'three';
import React, { useMemo } from 'react';
import { PlacedTile } from '../../engine/types.ts';
import { TILE_MAP } from '../../engine/tiles.ts';
import {
  getStoneTexture,
  getCobblestoneTexture,
  getRoofTileTexture,
  getMeadowGrassTexture,
  getHeraldryTexture,
} from '../materials/textures.ts';

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

  // Procedural canvas textures
  const stoneTex = useMemo(() => getStoneTexture(), []);
  const grassTex = useMemo(() => getMeadowGrassTexture(), []);
  const cobbleTex = useMemo(() => getCobblestoneTexture(), []);
  const terracottaTex = useMemo(() => getRoofTileTexture(false), []);
  const slateTex = useMemo(() => getRoofTileTexture(true), []);
  const heraldryTex = useMemo(() => getHeraldryTexture(true), []);

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
      {/* Hand-Hewn Ashlar Stone Plinth Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.1, 1.0]} />
        <meshStandardMaterial
          color={isGhost ? '#60a5fa' : isSelected ? '#fbbf24' : '#ffffff'}
          map={isGhost ? undefined : stoneTex}
          roughness={0.88}
          metalness={0.08}
          transparent={isGhost}
          opacity={isGhost ? 0.45 : 1.0}
        />
      </mesh>

      {/* Chiseled Stone Bevel Rim */}
      {!isGhost && (
        <mesh position={[0, 0.098, 0]} receiveShadow>
          <boxGeometry args={[0.985, 0.01, 0.985]} />
          <meshStandardMaterial color="#4a443d" roughness={0.9} />
        </mesh>
      )}

      {/* Lush Meadow Grass Layer */}
      <mesh position={[0, 0.11, 0]} receiveShadow>
        <boxGeometry args={[0.96, 0.038, 0.96]} />
        <meshStandardMaterial
          color={isGhost ? '#93c5fd' : '#ffffff'}
          map={isGhost ? undefined : grassTex}
          roughness={0.75}
          metalness={0.02}
          transparent={isGhost}
          opacity={isGhost ? 0.45 : 1.0}
        />
      </mesh>

      {/* Detailed Roads */}
      {!isGhost && roadFeatures.length > 0 && (
        <RealisticRoadMesh tileCode={tile.code} cobbleTex={cobbleTex} />
      )}

      {/* Detailed City Fortresses & Half-Timbered Houses */}
      {!isGhost && cityFeatures.length > 0 && (
        <RealisticCityMesh
          tileCode={tile.code}
          hasShield={!!hasShield}
          stoneTex={stoneTex}
          terracottaTex={terracottaTex}
          slateTex={slateTex}
          heraldryTex={heraldryTex}
        />
      )}

      {/* Romanesque / Gothic Abbey & Cloister */}
      {!isGhost && hasMonastery && (
        <RealisticMonasteryMesh
          stoneTex={stoneTex}
          slateTex={slateTex}
          terracottaTex={terracottaTex}
          grassTex={grassTex}
        />
      )}

      {/* Trees, Hedgerows, and Golden Wheat Sheaves */}
      {!isGhost && !hasMonastery && cityFeatures.length === 0 && (
        <RealisticNatureDecorations tileCode={tile.code} />
      )}
    </group>
  );
};

// ----------------------------------------------------
// Realistic Cobblestone Roads with Stone Curbs & Waymarkers
// ----------------------------------------------------
const RealisticRoadMesh: React.FC<{
  tileCode: string;
  cobbleTex: THREE.CanvasTexture;
}> = ({ tileCode, cobbleTex }) => {
  return (
    <group position={[0, 0.132, 0]}>
      {tileCode === 'U' || tileCode === 'D' ? (
        // Straight Cobblestone Highway
        <group>
          {/* Main paved bed */}
          <mesh receiveShadow>
            <boxGeometry args={[1.0, 0.012, 0.22]} />
            <meshStandardMaterial map={cobbleTex} roughness={0.88} />
          </mesh>
          {/* Wheel rut soil borders */}
          <mesh position={[0, 0.003, -0.115]} receiveShadow>
            <boxGeometry args={[1.0, 0.008, 0.025]} />
            <meshStandardMaterial color="#382d22" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.003, 0.115]} receiveShadow>
            <boxGeometry args={[1.0, 0.008, 0.025]} />
            <meshStandardMaterial color="#382d22" roughness={0.95} />
          </mesh>
        </group>
      ) : tileCode === 'V' ? (
        // Curved Cobblestone Highway (W to S)
        <group>
          <mesh position={[-0.25, 0, 0]} receiveShadow>
            <boxGeometry args={[0.5, 0.012, 0.22]} />
            <meshStandardMaterial map={cobbleTex} roughness={0.88} />
          </mesh>
          <mesh position={[0, 0, 0.25]} receiveShadow>
            <boxGeometry args={[0.22, 0.012, 0.5]} />
            <meshStandardMaterial map={cobbleTex} roughness={0.88} />
          </mesh>
          <mesh position={[-0.1, 0, 0.1]} receiveShadow>
            <boxGeometry args={[0.26, 0.012, 0.26]} />
            <meshStandardMaterial map={cobbleTex} roughness={0.88} />
          </mesh>
        </group>
      ) : tileCode === 'W' || tileCode === 'L' ? (
        // T-Junction with Village Cross
        <group>
          <mesh position={[0.25, 0, 0]} receiveShadow>
            <boxGeometry args={[0.5, 0.012, 0.22]} />
            <meshStandardMaterial map={cobbleTex} roughness={0.88} />
          </mesh>
          <mesh position={[-0.25, 0, 0]} receiveShadow>
            <boxGeometry args={[0.5, 0.012, 0.22]} />
            <meshStandardMaterial map={cobbleTex} roughness={0.88} />
          </mesh>
          <mesh position={[0, 0, 0.25]} receiveShadow>
            <boxGeometry args={[0.22, 0.012, 0.5]} />
            <meshStandardMaterial map={cobbleTex} roughness={0.88} />
          </mesh>
          {/* Carved stone wayside cross */}
          <group position={[0, 0.08, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.035, 0.045, 0.14, 8]} />
              <meshStandardMaterial color="#736c64" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.08, 0]} castShadow>
              <boxGeometry args={[0.018, 0.08, 0.018]} />
              <meshStandardMaterial color="#8a837a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.09, 0]} castShadow>
              <boxGeometry args={[0.06, 0.018, 0.018]} />
              <meshStandardMaterial color="#8a837a" roughness={0.9} />
            </mesh>
          </group>
        </group>
      ) : tileCode === 'X' ? (
        // 4-Way Crossroads with Milestone
        <group>
          <mesh receiveShadow>
            <boxGeometry args={[1.0, 0.012, 0.22]} />
            <meshStandardMaterial map={cobbleTex} roughness={0.88} />
          </mesh>
          <mesh receiveShadow>
            <boxGeometry args={[0.22, 0.012, 1.0]} />
            <meshStandardMaterial map={cobbleTex} roughness={0.88} />
          </mesh>
          {/* Central stone marker */}
          <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.14, 6]} />
            <meshStandardMaterial color="#7a736a" roughness={0.9} />
          </mesh>
        </group>
      ) : (
        // Default Road Stub
        <mesh position={[0, 0, 0.25]} receiveShadow>
          <boxGeometry args={[0.22, 0.012, 0.5]} />
          <meshStandardMaterial map={cobbleTex} roughness={0.88} />
        </mesh>
      )}
    </group>
  );
};

// ----------------------------------------------------
// Realistic City Fortress with Stone Walls, Crenellations & Roofs
// ----------------------------------------------------
const RealisticCityMesh: React.FC<{
  tileCode: string;
  hasShield: boolean;
  stoneTex: THREE.CanvasTexture;
  terracottaTex: THREE.CanvasTexture;
  slateTex: THREE.CanvasTexture;
  heraldryTex: THREE.CanvasTexture;
}> = ({ tileCode, hasShield, stoneTex, terracottaTex, slateTex, heraldryTex }) => {
  if (tileCode === 'C') {
    // Fully Fortified Castle City (entire tile)
    return (
      <group position={[0, 0.13, 0]}>
        {/* Cobblestone City Courtyard */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[0.92, 0.03, 0.92]} />
          <meshStandardMaterial color="#6b645d" roughness={0.9} />
        </mesh>

        {/* 4 Ashlar Fortress Walls with Crenellations */}
        {[
          [0, 0.11, -0.44, 0.92, 0.18, 0.09],
          [0, 0.11, 0.44, 0.92, 0.18, 0.09],
          [-0.44, 0.11, 0, 0.09, 0.18, 0.92],
          [0.44, 0.11, 0, 0.09, 0.18, 0.92],
        ].map(([x, y, z, w, h, d], idx) => (
          <group key={idx} position={[x, y, z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial map={stoneTex} roughness={0.85} />
            </mesh>
            {/* Crenellation Battlement Teeth */}
            {[-0.3, -0.1, 0.1, 0.3].map((cx) => (
              <mesh
                key={cx}
                position={w > d ? [cx, h / 2 + 0.02, 0] : [0, h / 2 + 0.02, cx]}
                castShadow
              >
                <boxGeometry args={[0.07, 0.04, 0.08]} />
                <meshStandardMaterial map={stoneTex} roughness={0.85} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Clustered Medieval Timber-Framed Houses inside */}
        <DetailedHouseCluster terracottaTex={terracottaTex} slateTex={slateTex} />

        {/* Central High Keep / Watchtower */}
        <group position={[0, 0.15, 0]}>
          <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.28, 8]} />
            <meshStandardMaterial map={stoneTex} roughness={0.8} />
          </mesh>
          {/* Machicolation Corbel Ring */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.115, 0.09, 0.04, 8]} />
            <meshStandardMaterial color="#544c44" roughness={0.8} />
          </mesh>
          {/* Conical Slate Spire */}
          <mesh position={[0, 0.44, 0]} castShadow>
            <coneGeometry args={[0.12, 0.26, 8]} />
            <meshStandardMaterial map={slateTex} roughness={0.7} />
          </mesh>
          {/* Golden Pennant Banner */}
          <group position={[0, 0.6, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.004, 0.004, 0.1, 4]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.7} />
            </mesh>
            <mesh position={[0.035, 0.03, 0]} castShadow>
              <boxGeometry args={[0.07, 0.04, 0.002]} />
              <meshStandardMaterial map={heraldryTex} roughness={0.6} />
            </mesh>
          </group>
        </group>
      </group>
    );
  }

  // Semi-circular city caps (e.g. E, D, J, K, etc.)
  return (
    <group position={[0, 0.13, -0.32]}>
      {/* Curved Stone Curtain Wall */}
      <group position={[0, 0.09, 0.12]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.39, 0.41, 0.18, 18, 1, false, 0, Math.PI]} />
          <meshStandardMaterial map={stoneTex} roughness={0.85} />
        </mesh>
        {/* Wall Walk / Parapet */}
        <mesh position={[0, 0.09, 0]} receiveShadow>
          <cylinderGeometry args={[0.37, 0.37, 0.02, 18, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#59524a" roughness={0.9} />
        </mesh>
        {/* Crenellations along arc */}
        {[-1.2, -0.6, 0, 0.6, 1.2].map((angle, i) => (
          <mesh
            key={i}
            position={[Math.sin(angle) * 0.39, 0.11, Math.cos(angle) * 0.39]}
            castShadow
          >
            <boxGeometry args={[0.06, 0.04, 0.06]} />
            <meshStandardMaterial map={stoneTex} roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* Medieval Half-Timbered Houses inside */}
      <group position={[0, 0.05, -0.07]}>
        {/* House 1: Terracotta Gable */}
        <group position={[-0.13, 0, 0]}>
          {/* Plaster & Timber Wall */}
          <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.12, 0.15]} />
            <meshStandardMaterial color="#dfd8cb" roughness={0.9} />
          </mesh>
          {/* Timber vertical beams */}
          {[-0.07, 0, 0.07].map((tx) => (
            <mesh key={tx} position={[tx, 0.06, 0.076]} castShadow>
              <boxGeometry args={[0.012, 0.12, 0.005]} />
              <meshStandardMaterial color="#382618" roughness={0.9} />
            </mesh>
          ))}
          {/* Pitched Terracotta Roof */}
          <group position={[0, 0.16, 0]}>
            <mesh castShadow receiveShadow>
              <coneGeometry args={[0.13, 0.11, 4]} />
              <meshStandardMaterial map={terracottaTex} roughness={0.7} />
            </mesh>
            {/* Stone Chimney */}
            <mesh position={[0.04, 0.04, 0.03]} castShadow>
              <boxGeometry args={[0.025, 0.07, 0.025]} />
              <meshStandardMaterial color="#504840" roughness={0.9} />
            </mesh>
          </group>
        </group>

        {/* House 2: Slate Roof */}
        <group position={[0.13, 0, 0]}>
          <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.12, 0.15]} />
            <meshStandardMaterial color="#d8d1c4" roughness={0.9} />
          </mesh>
          {/* Timber horizontal cross beam */}
          <mesh position={[0, 0.08, 0.076]} castShadow>
            <boxGeometry args={[0.16, 0.012, 0.005]} />
            <meshStandardMaterial color="#382618" roughness={0.9} />
          </mesh>
          {/* Pitched Slate Roof */}
          <group position={[0, 0.16, 0]}>
            <mesh castShadow receiveShadow>
              <coneGeometry args={[0.13, 0.11, 4]} />
              <meshStandardMaterial map={slateTex} roughness={0.7} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Heraldic Shield on Fortress Wall */}
      {hasShield && (
        <group position={[0, 0.18, 0.24]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.09, 0.11, 0.012]} />
            <meshStandardMaterial map={heraldryTex} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.008]} castShadow>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
};

const DetailedHouseCluster: React.FC<{
  terracottaTex: THREE.CanvasTexture;
  slateTex: THREE.CanvasTexture;
}> = ({ terracottaTex, slateTex }) => {
  return (
    <group position={[0, 0.05, 0]}>
      {[-0.22, 0.22].map((x) =>
        [-0.22, 0.22].map((z) => (
          <group key={`${x},${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.16, 0.12, 0.15]} />
              <meshStandardMaterial color="#dfd7cb" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.13, 0.11, 4]} />
              <meshStandardMaterial
                map={x < 0 ? terracottaTex : slateTex}
                roughness={0.75}
              />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
};

// ----------------------------------------------------
// Romanesque Abbey with Cloister Columns & Belfry Bell
// ----------------------------------------------------
const RealisticMonasteryMesh: React.FC<{
  stoneTex: THREE.CanvasTexture;
  slateTex: THREE.CanvasTexture;
  terracottaTex: THREE.CanvasTexture;
  grassTex: THREE.CanvasTexture;
}> = ({ stoneTex, slateTex, terracottaTex, grassTex }) => {
  return (
    <group position={[0, 0.13, 0]}>
      {/* Stone Cloister Terrace Platform */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[0.66, 0.03, 0.66]} />
        <meshStandardMaterial map={stoneTex} roughness={0.9} />
      </mesh>

      {/* Main Abbey Nave & Transept */}
      <group position={[-0.1, 0, 0]}>
        {/* Nave body */}
        <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.26, 0.2, 0.44]} />
          <meshStandardMaterial map={stoneTex} roughness={0.85} />
        </mesh>
        {/* Buttresses along nave */}
        {[-0.16, 0, 0.16].map((bz) => (
          <mesh key={bz} position={[-0.14, 0.1, bz]} castShadow receiveShadow>
            <boxGeometry args={[0.03, 0.18, 0.04]} />
            <meshStandardMaterial map={stoneTex} roughness={0.85} />
          </mesh>
        ))}
        {/* High Steep Pitched Roof */}
        <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.22, 0.16, 4]} />
          <meshStandardMaterial map={terracottaTex} roughness={0.7} />
        </mesh>
        {/* Small Rose Window Tracery */}
        <mesh position={[0, 0.14, 0.222]} receiveShadow>
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      {/* Stone Bell Tower with Working Bell */}
      <group position={[0.16, 0, 0.12]}>
        {/* Tower Body */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.36, 0.15]} />
          <meshStandardMaterial map={stoneTex} roughness={0.85} />
        </mesh>
        {/* Belfry Open Arches */}
        <mesh position={[0, 0.39, 0]} castShadow>
          <boxGeometry args={[0.13, 0.07, 0.13]} />
          <meshStandardMaterial color="#2d2620" roughness={0.9} />
        </mesh>
        {/* Suspended Bronze Bell */}
        <mesh position={[0, 0.39, 0]} castShadow>
          <sphereGeometry args={[0.024, 10, 10]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Tower Slate Spire */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <coneGeometry args={[0.12, 0.22, 4]} />
          <meshStandardMaterial map={slateTex} roughness={0.65} />
        </mesh>
        {/* Golden Church Spire Cross */}
        <group position={[0, 0.65, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.012, 0.07, 0.012]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.015, 0]} castShadow>
            <boxGeometry args={[0.045, 0.012, 0.012]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      </group>

      {/* Cloister Garth (Herb Garden) with Stone Well */}
      <group position={[0.14, 0.035, -0.14]}>
        {/* Garden Grass Lawn */}
        <mesh receiveShadow>
          <boxGeometry args={[0.26, 0.01, 0.26]} />
          <meshStandardMaterial map={grassTex} roughness={0.8} />
        </mesh>
        {/* Carved Octagonal Stone Well / Fountain */}
        <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.05, 8]} />
          <meshStandardMaterial color="#78716c" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
};

// ----------------------------------------------------
// Realistic Nature Details: Multi-Tier Trees & Haystacks
// ----------------------------------------------------
const RealisticNatureDecorations: React.FC<{ tileCode: string }> = () => {
  return (
    <group position={[0, 0.13, 0]}>
      {/* Hand-Crafted Oak Tree 1 */}
      <group position={[-0.28, 0, -0.28]}>
        {/* Organic Trunk with Root Flare */}
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.02, 0.035, 0.1, 7]} />
          <meshStandardMaterial color="#4a2e18" roughness={0.9} />
        </mesh>
        {/* Multi-Tier Canopy */}
        <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.08, 1]} />
          <meshStandardMaterial color="#2d5218" roughness={0.7} />
        </mesh>
        <mesh position={[0.02, 0.18, 0.01]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.06, 1]} />
          <meshStandardMaterial color="#3b6920" roughness={0.7} />
        </mesh>
      </group>

      {/* Hand-Crafted Elm Tree 2 */}
      <group position={[0.26, 0, 0.26]}>
        <mesh position={[0, 0.045, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.018, 0.03, 0.09, 7]} />
          <meshStandardMaterial color="#4a2e18" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.07, 1]} />
          <meshStandardMaterial color="#365e1c" roughness={0.7} />
        </mesh>
      </group>

      {/* Golden Bound Hay Sheaf */}
      <group position={[0.25, 0.04, -0.22]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.05, 0.07, 8]} />
          <meshStandardMaterial color="#eab308" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.032, 0.032, 0.01, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
