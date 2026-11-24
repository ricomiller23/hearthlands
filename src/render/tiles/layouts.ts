import { Rotation } from '../../engine/types.ts';

export interface LocalFeaturePos {
  featureId: string;
  x: number; // -0.5 to 0.5
  y: number; // -0.5 to 0.5
  z: number; // elevation
}

/**
 * Follower anchor coordinates in tile-local unrotated coordinates [-0.5, 0.5].
 * z is elevation above tile base.
 */
export const TILE_FEATURE_ANCHORS: Record<string, LocalFeaturePos[]> = {
  A: [
    { featureId: 'm', x: 0, y: 0.1, z: 0.28 },
    { featureId: 'r0', x: 0, y: -0.35, z: 0.12 },
    { featureId: 'f0', x: -0.3, y: -0.1, z: 0.1 },
  ],
  B: [
    { featureId: 'm', x: 0, y: 0, z: 0.28 },
    { featureId: 'f0', x: -0.3, y: -0.3, z: 0.1 },
  ],
  C: [
    { featureId: 'c0', x: 0, y: 0, z: 0.26 },
  ],
  D: [
    { featureId: 'c0', x: 0, y: 0.32, z: 0.26 },
    { featureId: 'r0', x: 0, y: 0, z: 0.12 },
    { featureId: 'f0', x: 0, y: 0.16, z: 0.1 },
    { featureId: 'f1', x: 0, y: -0.3, z: 0.1 },
  ],
  E: [
    { featureId: 'c0', x: 0, y: 0.34, z: 0.26 },
    { featureId: 'f0', x: 0, y: -0.2, z: 0.1 },
  ],
  F: [
    { featureId: 'c0', x: 0, y: 0, z: 0.26 },
    { featureId: 'f0', x: -0.38, y: -0.38, z: 0.1 },
    { featureId: 'f1', x: 0.38, y: 0.38, z: 0.1 },
  ],
  G: [
    { featureId: 'c0', x: 0, y: 0, z: 0.26 },
    { featureId: 'f0', x: 0, y: -0.38, z: 0.1 },
  ],
  H: [
    { featureId: 'c0', x: -0.28, y: 0, z: 0.26 },
    { featureId: 'c1', x: 0.28, y: 0, z: 0.26 },
    { featureId: 'f0', x: 0, y: 0, z: 0.1 },
  ],
  I: [
    { featureId: 'c0', x: 0, y: 0.34, z: 0.26 },
    { featureId: 'c1', x: 0.34, y: 0, z: 0.26 },
    { featureId: 'f0', x: -0.15, y: -0.15, z: 0.1 },
  ],
  J: [
    { featureId: 'c0', x: 0, y: 0.34, z: 0.26 },
    { featureId: 'r0', x: 0.15, y: -0.15, z: 0.12 },
    { featureId: 'f0', x: 0.3, y: 0.15, z: 0.1 },
    { featureId: 'f1', x: -0.2, y: -0.2, z: 0.1 },
  ],
  K: [
    { featureId: 'c0', x: 0, y: 0.34, z: 0.26 },
    { featureId: 'r0', x: -0.15, y: -0.15, z: 0.12 },
    { featureId: 'f0', x: -0.3, y: 0.15, z: 0.1 },
    { featureId: 'f1', x: 0.2, y: -0.2, z: 0.1 },
  ],
  L: [
    { featureId: 'c0', x: 0, y: 0.34, z: 0.26 },
    { featureId: 'r0', x: 0.3, y: 0, z: 0.12 },
    { featureId: 'r1', x: 0, y: -0.3, z: 0.12 },
    { featureId: 'r2', x: -0.3, y: 0, z: 0.12 },
    { featureId: 'f0', x: 0.3, y: 0.2, z: 0.1 },
    { featureId: 'f1', x: 0.2, y: -0.2, z: 0.1 },
    { featureId: 'f2', x: -0.2, y: -0.2, z: 0.1 },
    { featureId: 'f3', x: -0.3, y: 0.2, z: 0.1 },
  ],
  M: [
    { featureId: 'c0', x: -0.12, y: 0.12, z: 0.26 },
    { featureId: 'f0', x: 0.25, y: -0.25, z: 0.1 },
  ],
  N: [
    { featureId: 'c0', x: -0.12, y: 0.12, z: 0.26 },
    { featureId: 'f0', x: 0.25, y: -0.25, z: 0.1 },
  ],
  O: [
    { featureId: 'c0', x: -0.12, y: 0.12, z: 0.26 },
    { featureId: 'r0', x: 0.25, y: -0.25, z: 0.12 },
    { featureId: 'f0', x: 0.05, y: -0.05, z: 0.1 },
    { featureId: 'f1', x: 0.4, y: -0.4, z: 0.1 },
  ],
  P: [
    { featureId: 'c0', x: -0.12, y: 0.12, z: 0.26 },
    { featureId: 'r0', x: 0.25, y: -0.25, z: 0.12 },
    { featureId: 'f0', x: 0.05, y: -0.05, z: 0.1 },
    { featureId: 'f1', x: 0.4, y: -0.4, z: 0.1 },
  ],
  Q: [
    { featureId: 'c0', x: 0, y: 0.08, z: 0.26 },
    { featureId: 'f0', x: 0, y: -0.38, z: 0.1 },
  ],
  R: [
    { featureId: 'c0', x: 0, y: 0.08, z: 0.26 },
    { featureId: 'f0', x: 0, y: -0.38, z: 0.1 },
  ],
  S: [
    { featureId: 'c0', x: 0, y: 0.08, z: 0.26 },
    { featureId: 'r0', x: 0, y: -0.35, z: 0.12 },
    { featureId: 'f0', x: -0.3, y: -0.35, z: 0.1 },
    { featureId: 'f1', x: 0.3, y: -0.35, z: 0.1 },
  ],
  T: [
    { featureId: 'c0', x: 0, y: 0.08, z: 0.26 },
    { featureId: 'r0', x: 0, y: -0.35, z: 0.12 },
    { featureId: 'f0', x: -0.3, y: -0.35, z: 0.1 },
    { featureId: 'f1', x: 0.3, y: -0.35, z: 0.1 },
  ],
  U: [
    { featureId: 'r0', x: 0, y: 0, z: 0.12 },
    { featureId: 'f0', x: -0.28, y: 0, z: 0.1 },
    { featureId: 'f1', x: 0.28, y: 0, z: 0.1 },
  ],
  V: [
    { featureId: 'r0', x: -0.15, y: -0.15, z: 0.12 },
    { featureId: 'f0', x: -0.38, y: -0.38, z: 0.1 },
    { featureId: 'f1', x: 0.15, y: 0.15, z: 0.1 },
  ],
  W: [
    { featureId: 'r0', x: 0.3, y: 0, z: 0.12 },
    { featureId: 'r1', x: 0, y: -0.3, z: 0.12 },
    { featureId: 'r2', x: -0.3, y: 0, z: 0.12 },
    { featureId: 'f0', x: 0, y: 0.3, z: 0.1 },
    { featureId: 'f1', x: 0.28, y: -0.28, z: 0.1 },
    { featureId: 'f2', x: -0.28, y: -0.28, z: 0.1 },
  ],
  X: [
    { featureId: 'r0', x: 0, y: 0.3, z: 0.12 },
    { featureId: 'r1', x: 0.3, y: 0, z: 0.12 },
    { featureId: 'r2', x: 0, y: -0.3, z: 0.12 },
    { featureId: 'r3', x: -0.3, y: 0, z: 0.12 },
    { featureId: 'f0', x: 0.25, y: 0.25, z: 0.1 },
    { featureId: 'f1', x: 0.25, y: -0.25, z: 0.1 },
    { featureId: 'f2', x: -0.25, y: -0.25, z: 0.1 },
    { featureId: 'f3', x: -0.25, y: 0.25, z: 0.1 },
  ],
};

export function rotateLocalPos(
  pos: { x: number; y: number; z: number },
  rotation: Rotation
): { x: number; y: number; z: number } {
  let rx = pos.x;
  let ry = pos.y;

  // rotation: 0 = 0deg, 1 = 90deg clockwise, 2 = 180deg, 3 = 270deg
  // In screen/map coords where N is +y, E is +x:
  // rotating 90 deg clockwise transforms (x, y) -> (y, -x)
  switch (rotation) {
    case 0:
      return { x: rx, y: ry, z: pos.z };
    case 1:
      return { x: ry, y: -rx, z: pos.z };
    case 2:
      return { x: -rx, y: -ry, z: pos.z };
    case 3:
      return { x: -ry, y: rx, z: pos.z };
  }
}
