export type FeatureType = 'city' | 'road' | 'field' | 'monastery';
export type EdgeType = 'C' | 'R' | 'F';

export interface TileFeatureDef {
  id: string; // e.g. "c0", "r0", "f0", "m"
  type: FeatureType;
  ports: number[]; // 0..11, empty for monastery
  shield?: boolean;
  adjCities?: string[];
}

export interface TileTypeDef {
  code: string;
  count: number;
  features: TileFeatureDef[];
  isStart?: boolean;
}

export type Rotation = 0 | 1 | 2 | 3; // 0=0deg, 1=90deg, 2=180deg, 3=270deg clockwise

export interface PlacedTile {
  instanceId: number;
  code: string;
  x: number;
  y: number;
  rotation: Rotation;
}

export type PlayerId = 'player' | 'reeve';

export type FollowerRole = 'thief' | 'knight' | 'monk' | 'farmer';

export interface Follower {
  id: number;
  playerId: PlayerId;
  role: FollowerRole;
  tileInstanceId: number;
  featureId: string; // local feature id on that tile
  x: number;
  y: number;
}

export type AIDifficulty = 'squire' | 'knight' | 'baron' | 'reeve_lord';
export type GameMode = 'rival' | 'chronicle';

export interface DecreeCard {
  id: string;
  title: string;
  description: string;
  bonusPoints: number;
  check: (state: any) => boolean;
}

export type GameEvent =
  | { type: 'TilePlaced'; tile: PlacedTile }
  | { type: 'FollowerPlaced'; follower: Follower }
  | { type: 'FeatureFinished'; featureType: FeatureType; tiles: number[]; scorers: { playerId: PlayerId; points: number }[] }
  | { type: 'FollowerReturned'; follower: Follower }
  | { type: 'TileDiscarded'; code: string }
  | { type: 'EndgameScored'; breakdown: any }
  | { type: 'GameOver'; winner: PlayerId | 'tie' };

export type GameAction =
  | { type: 'PLACE_TILE'; x: number; y: number; rot: Rotation }
  | { type: 'PLACE_FOLLOWER'; featureId: string | null };

export interface GameState {
  seed: number;
  mode: GameMode;
  difficulty: AIDifficulty;
  board: Map<string, PlacedTile>;
  deck: string[];
  discards: string[];
  currentTile: string | null;
  turn: PlayerId;
  phase: 'PLACE_TILE' | 'PLACE_FOLLOWER' | 'GAME_OVER';
  scores: { player: number; reeve: number };
  followers: Follower[];
  followerSupply: { player: number; reeve: number };
  completedCityKeys: Set<string>;
  lastPlacedTile: PlacedTile | null;
  nextInstanceId: number;
  nextFollowerId: number;
  events: GameEvent[];
  history: GameAction[];
}
