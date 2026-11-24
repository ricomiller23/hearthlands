import { PlacedTile, Rotation, FollowerRole } from './types.ts';
import { TILE_MAP, SIDE_OFFSETS, getEdgeType } from './tiles.ts';
import { FeatureGraph } from './features.ts';

export interface PlacementOption {
  x: number;
  y: number;
  rotation: Rotation;
}

export interface FollowerOption {
  featureId: string;
  type: 'city' | 'road' | 'field' | 'monastery';
  role: FollowerRole;
  shield?: boolean;
}

/**
 * Returns all legal (x, y, rotation) placement options for a given tile on the board.
 */
export function getLegalPlacements(
  tileCode: string,
  board: Map<string, PlacedTile>
): PlacementOption[] {
  const tileDef = TILE_MAP.get(tileCode);
  if (!tileDef) return [];

  // If board is empty (first tile): place at (0, 0) rot 0
  if (board.size === 0) {
    return [{ x: 0, y: 0, rotation: 0 }];
  }

  // Find all candidate empty coordinates adjacent to at least one placed tile
  const candidateCoords = new Set<string>();
  board.forEach((tile) => {
    for (const [dx, dy] of SIDE_OFFSETS) {
      const cx = tile.x + dx;
      const cy = tile.y + dy;
      const key = `${cx},${cy}`;
      if (!board.has(key)) {
        candidateCoords.add(key);
      }
    }
  });

  const legalOptions: PlacementOption[] = [];

  for (const coordStr of candidateCoords) {
    const [xStr, yStr] = coordStr.split(',');
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);

    for (let rot = 0; rot < 4; rot++) {
      const rotation = rot as Rotation;
      let valid = true;
      let hasNeighbor = false;

      for (let side = 0; side < 4; side++) {
        const [dx, dy] = SIDE_OFFSETS[side];
        const nx = x + dx;
        const ny = y + dy;
        const neighbor = board.get(`${nx},${ny}`);

        if (neighbor) {
          hasNeighbor = true;
          const neighborDef = TILE_MAP.get(neighbor.code);
          if (!neighborDef) {
            valid = false;
            break;
          }

          const myEdge = getEdgeType(tileDef, rotation, side as 0 | 1 | 2 | 3);
          const oppSide = ((side + 2) % 4) as 0 | 1 | 2 | 3;
          const neighborEdge = getEdgeType(neighborDef, neighbor.rotation, oppSide);

          if (myEdge !== neighborEdge) {
            valid = false;
            break;
          }
        }
      }

      if (valid && hasNeighbor) {
        legalOptions.push({ x, y, rotation });
      }
    }
  }

  return legalOptions;
}

/**
 * Returns whether a tile can be placed anywhere on the current board.
 */
export function isTilePlayable(
  tileCode: string,
  board: Map<string, PlacedTile>
): boolean {
  return getLegalPlacements(tileCode, board).length > 0;
}

/**
 * Maps a feature type to the corresponding follower role.
 */
export function roleForFeatureType(type: 'city' | 'road' | 'field' | 'monastery'): FollowerRole {
  switch (type) {
    case 'city':
      return 'knight';
    case 'road':
      return 'thief';
    case 'monastery':
      return 'monk';
    case 'field':
      return 'farmer';
  }
}

/**
 * Returns available follower placement options on the newly placed tile.
 * Follower can only be placed on a feature if no follower is currently present
 * in that connected feature component.
 */
export function getLegalFollowerSpots(
  placedTile: PlacedTile,
  graph: FeatureGraph,
  availableFollowers: number
): FollowerOption[] {
  if (availableFollowers <= 0) return [];

  const tileDef = TILE_MAP.get(placedTile.code);
  if (!tileDef) return [];

  const options: FollowerOption[] = [];

  for (const feat of tileDef.features) {
    if (feat.type === 'monastery') {
      const mon = graph.monasteries.get(placedTile.instanceId);
      if (mon && mon.follower === null) {
        options.push({
          featureId: feat.id,
          type: 'monastery',
          role: 'monk',
        });
      }
    } else {
      const key = `${placedTile.instanceId}:${feat.id}`;
      const root = graph.getRoot(key);
      if (root && root.followers.length === 0) {
        options.push({
          featureId: feat.id,
          type: feat.type,
          role: roleForFeatureType(feat.type),
          shield: feat.shield,
        });
      }
    }
  }

  return options;
}
