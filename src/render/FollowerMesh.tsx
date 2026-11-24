import * as THREE from 'three';
import React, { useMemo } from 'react';
import { Follower, PlacedTile } from '../engine/types.ts';
import { TILE_FEATURE_ANCHORS, rotateLocalPos } from './tiles/layouts.ts';
import { getHeraldryTexture, getWoodGrainTexture } from './materials/textures.ts';

interface FollowerMeshProps {
  follower: Follower;
  tile: PlacedTile;
}

export const FollowerMesh: React.FC<FollowerMeshProps> = ({ follower, tile }) => {
  const isPlayer = follower.playerId === 'player';
  const heraldryTex = useMemo(() => getHeraldryTexture(isPlayer), [isPlayer]);
  const woodTex = useMemo(() => getWoodGrainTexture(false), []);

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

  const worldX = tile.x * 1.06 + anchor.x * 1.0;
  const worldZ = -tile.y * 1.06 - anchor.y * 1.0;
  const worldY = 0.14 + anchor.z;

  return (
    <group position={[worldX, worldY, worldZ]}>
      {/* Miniature Display Pedestal Base */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.075, 0.082, 0.03, 16]} />
        <meshStandardMaterial
          color={isPlayer ? '#1e293b' : '#3b1212'}
          map={woodTex}
          roughness={0.65}
          metalness={0.2}
        />
      </mesh>
      {/* Brass Rim on Pedestal */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <torusGeometry args={[0.075, 0.005, 8, 24]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Role-Specific Detailed Medieval Figurine */}
      {follower.role === 'knight' && (
        <KnightFigurine heraldryTex={heraldryTex} />
      )}
      {follower.role === 'thief' && (
        <ThiefFigurine isPlayer={isPlayer} />
      )}
      {follower.role === 'monk' && (
        <MonkFigurine isPlayer={isPlayer} />
      )}
      {follower.role === 'farmer' && (
        <FarmerFigurine isPlayer={isPlayer} />
      )}
    </group>
  );
};

// ----------------------------------------------------
// 1. Armored Medieval Knight with Helm, Surcoat, Sword & Shield
// ----------------------------------------------------
const KnightFigurine: React.FC<{ heraldryTex: THREE.CanvasTexture }> = ({
  heraldryTex,
}) => {
  const steelColor = '#8a949e';
  const brassTrim = '#d97706';

  return (
    <group position={[0, 0.03, 0]} scale={1.2}>
      {/* Armored Legs & Sabatons */}
      <mesh position={[-0.02, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.08, 8]} />
        <meshStandardMaterial color={steelColor} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.02, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.08, 8]} />
        <meshStandardMaterial color={steelColor} metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Heraldic Surcoat / Tabard over Breastplate */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.055, 0.09, 0.04]} />
        <meshStandardMaterial map={heraldryTex} roughness={0.7} />
      </mesh>
      {/* Steel Breastplate Underlay */}
      <mesh position={[0, 0.105, 0.015]} castShadow>
        <sphereGeometry args={[0.026, 10, 10]} />
        <meshStandardMaterial color={steelColor} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Pauldrons (Shoulder Armor) */}
      <mesh position={[-0.036, 0.13, 0]} castShadow>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshStandardMaterial color={steelColor} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.036, 0.13, 0]} castShadow>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshStandardMaterial color={steelColor} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Medieval Bascinet / Great Helm */}
      <group position={[0, 0.17, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.024, 0.028, 0.048, 12]} />
          <meshStandardMaterial color={steelColor} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Crown ridge on helm */}
        <mesh position={[0, 0.024, 0]} castShadow>
          <sphereGeometry args={[0.024, 12, 8]} />
          <meshStandardMaterial color={steelColor} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Brass Visor Cross & Ocular Slit */}
        <mesh position={[0, 0.005, 0.025]} castShadow>
          <boxGeometry args={[0.034, 0.006, 0.005]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.024]} castShadow>
          <boxGeometry args={[0.006, 0.03, 0.004]} />
          <meshStandardMaterial color={brassTrim} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Left Arm holding Heraldic Heater Shield */}
      <group position={[-0.042, 0.09, 0.015]} rotation={[0, -0.25, 0]}>
        {/* Shield Curved Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.045, 0.085, 0.008]} />
          <meshStandardMaterial map={heraldryTex} roughness={0.5} />
        </mesh>
        {/* Shield Boss */}
        <mesh position={[0, 0.01, 0.006]} castShadow>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color={brassTrim} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Right Arm holding Upright Longsword */}
      <group position={[0.04, 0.1, 0.01]} rotation={[0.1, 0, -0.15]}>
        {/* Steel Blade */}
        <mesh position={[0, 0.065, 0]} castShadow>
          <boxGeometry args={[0.006, 0.13, 0.002]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Cruciform Crossguard */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.028, 0.005, 0.005]} />
          <meshStandardMaterial color={brassTrim} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Grip & Pommel */}
        <mesh position={[0, -0.018, 0]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.025, 6]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.032, 0]} castShadow>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshStandardMaterial color={brassTrim} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 2. Cloaked Medieval Thief / Highwayman with Cowl & Staff
// ----------------------------------------------------
const ThiefFigurine: React.FC<{ isPlayer: boolean }> = ({ isPlayer }) => {
  const cloakColor = isPlayer ? '#1e3a5f' : '#451212';
  const leatherColor = '#5c3a21';

  return (
    <group position={[0, 0.03, 0]} scale={1.2}>
      {/* Leather Boots & Leggings */}
      <mesh position={[-0.018, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.08, 8]} />
        <meshStandardMaterial color="#2d1e12" roughness={0.9} />
      </mesh>
      <mesh position={[0.018, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.08, 8]} />
        <meshStandardMaterial color="#2d1e12" roughness={0.9} />
      </mesh>

      {/* Quilted Doublet with Belt & Pouch */}
      <mesh position={[0, 0.095, 0]} castShadow>
        <boxGeometry args={[0.05, 0.08, 0.036]} />
        <meshStandardMaterial color={leatherColor} roughness={0.85} />
      </mesh>
      {/* Belt with Brass Buckle */}
      <mesh position={[0, 0.07, 0.002]} castShadow>
        <boxGeometry args={[0.052, 0.01, 0.038]} />
        <meshStandardMaterial color="#1a110a" roughness={0.8} />
      </mesh>
      <mesh position={[0.016, 0.065, 0.018]} castShadow>
        <boxGeometry args={[0.014, 0.016, 0.012]} />
        <meshStandardMaterial color="#3d2616" roughness={0.85} />
      </mesh>

      {/* Flowing Draped Cloak */}
      <mesh position={[0, 0.1, -0.015]} castShadow>
        <boxGeometry args={[0.062, 0.11, 0.02]} />
        <meshStandardMaterial color={cloakColor} roughness={0.9} />
      </mesh>

      {/* Deep Cowled Hood with Shadowed Visage */}
      <group position={[0, 0.165, 0.005]}>
        <mesh castShadow>
          <sphereGeometry args={[0.026, 12, 12]} />
          <meshStandardMaterial color={cloakColor} roughness={0.9} />
        </mesh>
        {/* Hood peak */}
        <mesh position={[0, 0.02, -0.012]} rotation={[-0.3, 0, 0]} castShadow>
          <coneGeometry args={[0.02, 0.03, 8]} />
          <meshStandardMaterial color={cloakColor} roughness={0.9} />
        </mesh>
        {/* Deep face shadow cavity */}
        <mesh position={[0, -0.002, 0.02]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#090706" roughness={1.0} />
        </mesh>
      </group>

      {/* Quarterstaff in Hands */}
      <group position={[0.034, 0.09, 0.02]} rotation={[0.05, 0, -0.08]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.0035, 0.004, 0.22, 6]} />
          <meshStandardMaterial color="#4a2e18" roughness={0.8} />
        </mesh>
        {/* Iron ferrule cap on top */}
        <mesh position={[0, 0.13, 0]} castShadow>
          <cylinderGeometry args={[0.0045, 0.004, 0.018, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 3. Benedictine Monk with Habit, Rope Belt & Rosary Book
// ----------------------------------------------------
const MonkFigurine: React.FC<{ isPlayer: boolean }> = ({ isPlayer }) => {
  const habitColor = isPlayer ? '#3e2b1d' : '#2b1c14';

  return (
    <group position={[0, 0.03, 0]} scale={1.2}>
      {/* Flowing Monastic Robe Base */}
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.048, 0.14, 12]} />
        <meshStandardMaterial color={habitColor} roughness={0.95} />
      </mesh>

      {/* Scapular Mantle (Over-robe) */}
      <mesh position={[0, 0.11, 0]} castShadow>
        <boxGeometry args={[0.05, 0.08, 0.04]} />
        <meshStandardMaterial color={habitColor} roughness={0.95} />
      </mesh>

      {/* Tied Rope Cincture (Belt) */}
      <mesh position={[0, 0.075, 0]} castShadow>
        <torusGeometry args={[0.035, 0.004, 6, 16]} />
        <meshStandardMaterial color="#e5dfd3" roughness={0.9} />
      </mesh>
      {/* Hanging rope cords with 3 knots */}
      <mesh position={[0.015, 0.045, 0.028]} castShadow>
        <cylinderGeometry args={[0.0025, 0.0025, 0.05, 4]} />
        <meshStandardMaterial color="#e5dfd3" roughness={0.9} />
      </mesh>

      {/* Head with Tonsure Hairstyle / Hood */}
      <group position={[0, 0.17, 0]}>
        {/* Face */}
        <mesh castShadow>
          <sphereGeometry args={[0.02, 10, 10]} />
          <meshStandardMaterial color="#dfc3a7" roughness={0.7} />
        </mesh>
        {/* Tonsured Hair Ring */}
        <mesh position={[0, 0.008, 0]} castShadow>
          <torusGeometry args={[0.019, 0.004, 6, 16]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
        {/* Draped Cowl around neck */}
        <mesh position={[0, -0.015, 0]} castShadow>
          <torusGeometry args={[0.026, 0.008, 6, 16]} />
          <meshStandardMaterial color={habitColor} roughness={0.95} />
        </mesh>
      </group>

      {/* Illuminated Prayer Manuscript in Hands */}
      <group position={[0, 0.095, 0.028]} rotation={[0.4, 0, 0]}>
        {/* Leather Tome Binding */}
        <mesh castShadow>
          <boxGeometry args={[0.038, 0.048, 0.012]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {/* Gilded Parchment Pages Edge */}
        <mesh position={[0, 0, 0.002]}>
          <boxGeometry args={[0.034, 0.044, 0.009]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Tiny Golden Cross on Cover */}
        <mesh position={[0, 0, -0.007]} castShadow>
          <boxGeometry args={[0.014, 0.022, 0.002]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 4. Medieval Farmer / Yeoman with Straw Hat & Scythe
// ----------------------------------------------------
const FarmerFigurine: React.FC<{ isPlayer: boolean }> = ({ isPlayer }) => {
  const tunicColor = isPlayer ? '#2563eb' : '#991b1b';

  return (
    <group position={[0, 0.03, 0]} scale={1.2}>
      {/* Trousers */}
      <mesh position={[-0.016, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.08, 8]} />
        <meshStandardMaterial color="#574230" roughness={0.9} />
      </mesh>
      <mesh position={[0.016, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.08, 8]} />
        <meshStandardMaterial color="#574230" roughness={0.9} />
      </mesh>

      {/* Peasant Linen Tunic */}
      <mesh position={[0, 0.095, 0]} castShadow>
        <boxGeometry args={[0.05, 0.08, 0.036]} />
        <meshStandardMaterial color={tunicColor} roughness={0.85} />
      </mesh>
      {/* Rope Sash */}
      <mesh position={[0, 0.07, 0]} castShadow>
        <boxGeometry args={[0.052, 0.008, 0.038]} />
        <meshStandardMaterial color="#d4c8b2" roughness={0.9} />
      </mesh>

      {/* Head with Wide-Brim Woven Straw Hat */}
      <group position={[0, 0.165, 0]}>
        {/* Head */}
        <mesh castShadow>
          <sphereGeometry args={[0.02, 10, 10]} />
          <meshStandardMaterial color="#d6b28f" roughness={0.7} />
        </mesh>
        {/* Straw Hat Crown */}
        <mesh position={[0, 0.018, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.026, 0.018, 12]} />
          <meshStandardMaterial color="#d4b465" roughness={0.9} />
        </mesh>
        {/* Wide Curled Brim */}
        <mesh position={[0, 0.01, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.004, 16]} />
          <meshStandardMaterial color="#d4b465" roughness={0.9} />
        </mesh>
      </group>

      {/* Iron Scythe & Wheat Sheaf */}
      <group position={[0.035, 0.09, 0.015]} rotation={[0.05, 0, -0.1]}>
        {/* Long Curved Ash Snath (Handle) */}
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.003, 0.0035, 0.22, 6]} />
          <meshStandardMaterial color="#854d0e" roughness={0.8} />
        </mesh>
        {/* Curved Steel Scythe Blade */}
        <group position={[0, 0.13, 0.015]} rotation={[0, 0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.075, 0.012, 0.003]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Golden Bound Wheat Sheaf beside Farmer */}
      <group position={[-0.035, 0.045, 0.015]} rotation={[0, 0, 0.15]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.018, 0.024, 0.09, 8]} />
          <meshStandardMaterial color="#eab308" roughness={0.85} />
        </mesh>
        {/* Straw Tie Band */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.021, 0.021, 0.01, 8]} />
          <meshStandardMaterial color="#854d0e" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
