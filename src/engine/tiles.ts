import { EdgeType, Rotation, TileTypeDef } from './types.ts';

export const TILES: TileTypeDef[] = [
  // Monastery with road leaving south
  {
    code: 'A',
    count: 2,
    features: [
      { id: 'm', type: 'monastery', ports: [] },
      { id: 'r0', type: 'road', ports: [7] },
      { id: 'f0', type: 'field', ports: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11] },
    ],
  },
  // Monastery alone
  {
    code: 'B',
    count: 4,
    features: [
      { id: 'm', type: 'monastery', ports: [] },
      { id: 'f0', type: 'field', ports: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    ],
  },
  // Full city, shield
  {
    code: 'C',
    count: 1,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shield: true },
    ],
  },
  // City N, straight road E–W (STARTING TILE TYPE: 4 total including the start tile)
  {
    code: 'D',
    count: 4,
    isStart: true,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2] },
      { id: 'r0', type: 'road', ports: [4, 10] },
      { id: 'f0', type: 'field', ports: [3, 11], adjCities: ['c0'] },
      { id: 'f1', type: 'field', ports: [5, 6, 7, 8, 9] },
    ],
  },
  // City cap N
  {
    code: 'E',
    count: 5,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2] },
      { id: 'f0', type: 'field', ports: [3, 4, 5, 6, 7, 8, 9, 10, 11], adjCities: ['c0'] },
    ],
  },
  // City band E–W, shield
  {
    code: 'F',
    count: 2,
    features: [
      { id: 'c0', type: 'city', ports: [3, 4, 5, 9, 10, 11], shield: true },
      { id: 'f0', type: 'field', ports: [0, 1, 2], adjCities: ['c0'] },
      { id: 'f1', type: 'field', ports: [6, 7, 8], adjCities: ['c0'] },
    ],
  },
  // City band N–S
  {
    code: 'G',
    count: 1,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2, 6, 7, 8] },
      { id: 'f0', type: 'field', ports: [3, 4, 5], adjCities: ['c0'] },
      { id: 'f1', type: 'field', ports: [9, 10, 11], adjCities: ['c0'] },
    ],
  },
  // Two separate caps, E and W
  {
    code: 'H',
    count: 3,
    features: [
      { id: 'c0', type: 'city', ports: [3, 4, 5] },
      { id: 'c1', type: 'city', ports: [9, 10, 11] },
      { id: 'f0', type: 'field', ports: [0, 1, 2, 6, 7, 8], adjCities: ['c0', 'c1'] },
    ],
  },
  // Two separate caps, E and S
  {
    code: 'I',
    count: 2,
    features: [
      { id: 'c0', type: 'city', ports: [3, 4, 5] },
      { id: 'c1', type: 'city', ports: [6, 7, 8] },
      { id: 'f0', type: 'field', ports: [0, 1, 2, 9, 10, 11], adjCities: ['c0', 'c1'] },
    ],
  },
  // City N, road curve E–S
  {
    code: 'J',
    count: 3,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2] },
      { id: 'r0', type: 'road', ports: [4, 7] },
      { id: 'f0', type: 'field', ports: [5, 6] },
      { id: 'f1', type: 'field', ports: [3, 8, 9, 10, 11], adjCities: ['c0'] },
    ],
  },
  // City N, road curve S–W
  {
    code: 'K',
    count: 3,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2] },
      { id: 'r0', type: 'road', ports: [7, 10] },
      { id: 'f0', type: 'field', ports: [8, 9] },
      { id: 'f1', type: 'field', ports: [3, 4, 5, 6, 11], adjCities: ['c0'] },
    ],
  },
  // City N, three roads (E, S, W) ending at a hamlet
  {
    code: 'L',
    count: 3,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2] },
      { id: 'r0', type: 'road', ports: [4] },
      { id: 'r1', type: 'road', ports: [7] },
      { id: 'r2', type: 'road', ports: [10] },
      { id: 'f0', type: 'field', ports: [3, 11], adjCities: ['c0'] },
      { id: 'f1', type: 'field', ports: [5, 6] },
      { id: 'f2', type: 'field', ports: [8, 9] },
    ],
  },
  // City corner N+W, shield
  {
    code: 'M',
    count: 2,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2, 9, 10, 11], shield: true },
      { id: 'f0', type: 'field', ports: [3, 4, 5, 6, 7, 8], adjCities: ['c0'] },
    ],
  },
  // City corner N+W
  {
    code: 'N',
    count: 3,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2, 9, 10, 11] },
      { id: 'f0', type: 'field', ports: [3, 4, 5, 6, 7, 8], adjCities: ['c0'] },
    ],
  },
  // City corner N+W, shield, road curve E–S
  {
    code: 'O',
    count: 2,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2, 9, 10, 11], shield: true },
      { id: 'r0', type: 'road', ports: [4, 7] },
      { id: 'f0', type: 'field', ports: [5, 6] },
      { id: 'f1', type: 'field', ports: [3, 8], adjCities: ['c0'] },
    ],
  },
  // City corner N+W, road curve E–S
  {
    code: 'P',
    count: 3,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2, 9, 10, 11] },
      { id: 'r0', type: 'road', ports: [4, 7] },
      { id: 'f0', type: 'field', ports: [5, 6] },
      { id: 'f1', type: 'field', ports: [3, 8], adjCities: ['c0'] },
    ],
  },
  // City on N, E, W; shield
  {
    code: 'Q',
    count: 1,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2, 3, 4, 5, 9, 10, 11], shield: true },
      { id: 'f0', type: 'field', ports: [6, 7, 8], adjCities: ['c0'] },
    ],
  },
  // City on N, E, W
  {
    code: 'R',
    count: 3,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2, 3, 4, 5, 9, 10, 11] },
      { id: 'f0', type: 'field', ports: [6, 7, 8], adjCities: ['c0'] },
    ],
  },
  // City on N, E, W; shield; road S
  {
    code: 'S',
    count: 2,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2, 3, 4, 5, 9, 10, 11], shield: true },
      { id: 'r0', type: 'road', ports: [7] },
      { id: 'f0', type: 'field', ports: [6], adjCities: ['c0'] },
      { id: 'f1', type: 'field', ports: [8], adjCities: ['c0'] },
    ],
  },
  // City on N, E, W; road S
  {
    code: 'T',
    count: 1,
    features: [
      { id: 'c0', type: 'city', ports: [0, 1, 2, 3, 4, 5, 9, 10, 11] },
      { id: 'r0', type: 'road', ports: [7] },
      { id: 'f0', type: 'field', ports: [6], adjCities: ['c0'] },
      { id: 'f1', type: 'field', ports: [8], adjCities: ['c0'] },
    ],
  },
  // Straight road N–S
  {
    code: 'U',
    count: 8,
    features: [
      { id: 'r0', type: 'road', ports: [1, 7] },
      { id: 'f0', type: 'field', ports: [2, 3, 4, 5, 6] },
      { id: 'f1', type: 'field', ports: [8, 9, 10, 11, 0] },
    ],
  },
  // Curved road S–W
  {
    code: 'V',
    count: 9,
    features: [
      { id: 'r0', type: 'road', ports: [7, 10] },
      { id: 'f0', type: 'field', ports: [8, 9] },
      { id: 'f1', type: 'field', ports: [11, 0, 1, 2, 3, 4, 5, 6] },
    ],
  },
  // T-junction E, S, W
  {
    code: 'W',
    count: 4,
    features: [
      { id: 'r0', type: 'road', ports: [4] },
      { id: 'r1', type: 'road', ports: [7] },
      { id: 'r2', type: 'road', ports: [10] },
      { id: 'f0', type: 'field', ports: [5, 6] },
      { id: 'f1', type: 'field', ports: [8, 9] },
      { id: 'f2', type: 'field', ports: [11, 0, 1, 2, 3] },
    ],
  },
  // Crossroads
  {
    code: 'X',
    count: 1,
    features: [
      { id: 'r0', type: 'road', ports: [1] },
      { id: 'r1', type: 'road', ports: [4] },
      { id: 'r2', type: 'road', ports: [7] },
      { id: 'r3', type: 'road', ports: [10] },
      { id: 'f0', type: 'field', ports: [2, 3] },
      { id: 'f1', type: 'field', ports: [5, 6] },
      { id: 'f2', type: 'field', ports: [8, 9] },
      { id: 'f3', type: 'field', ports: [11, 0] },
    ],
  },
];

export const TILE_MAP = new Map<string, TileTypeDef>(
  TILES.map((t) => [t.code, t])
);

/**
 * Rotates port indices by 90deg steps clockwise.
 */
export function rotatePort(port: number, rotation: Rotation): number {
  return (port + rotation * 3) % 12;
}

export function rotatePorts(ports: number[], rotation: Rotation): number[] {
  return ports.map((p) => rotatePort(p, rotation)).sort((a, b) => a - b);
}

// Side port definitions (unrotated):
// 0=N, 1=E, 2=S, 3=W
export const SIDE_PORTS: number[][] = [
  [0, 1, 2], // North
  [3, 4, 5], // East
  [6, 7, 8], // South
  [9, 10, 11], // West
];

// Opposite side matching port pairs
// N [0,1,2] <-> S [8,7,6]
// E [3,4,5] <-> W [11,10,9]
// S [6,7,8] <-> N [2,1,0]
// W [9,10,11] <-> E [5,4,3]
export const OPPOSITE_PORTS: Record<number, number> = {
  0: 8, 1: 7, 2: 6,
  3: 11, 4: 10, 5: 9,
  6: 2, 7: 1, 8: 0,
  9: 5, 10: 4, 11: 3,
};

export const OPPOSITE_SIDE: Record<number, number> = {
  0: 2, // N <-> S
  1: 3, // E <-> W
  2: 0, // S <-> N
  3: 1, // W <-> E
};

export const SIDE_OFFSETS: [number, number][] = [
  [0, 1],  // 0: North (y+1)
  [1, 0],  // 1: East  (x+1)
  [0, -1], // 2: South (y-1)
  [-1, 0], // 3: West  (x-1)
];

/**
 * Derives edge type (C, R, or F) for a given side (0=N, 1=E, 2=S, 3=W)
 * of a tile with given rotation.
 */
export function getEdgeType(tileDef: TileTypeDef, side: number, rotation: Rotation): EdgeType {
  const sidePorts = SIDE_PORTS[side];
  // Find which features own these ports after rotation
  for (const feat of tileDef.features) {
    if (feat.type === 'monastery') continue;
    const rotated = rotatePorts(feat.ports, rotation);
    // If any port belongs to a city, edge is C
    if (feat.type === 'city' && sidePorts.some((p) => rotated.includes(p))) {
      return 'C';
    }
  }
  for (const feat of tileDef.features) {
    if (feat.type === 'monastery') continue;
    const rotated = rotatePorts(feat.ports, rotation);
    // If middle port is road, edge is R
    const midPort = sidePorts[1];
    if (feat.type === 'road' && rotated.includes(midPort)) {
      return 'R';
    }
  }
  return 'F';
}
