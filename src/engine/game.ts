import {
  GameState,
  PlacedTile,
  Follower,
  GameAction,
  GameEvent,
  GameMode,
  AIDifficulty,
  PlayerId,
} from './types.ts';
import { TILES, TILE_MAP } from './tiles.ts';
import { createRNG, shuffle } from './rng.ts';
import { FeatureGraph } from './features.ts';
import {
  getLegalPlacements,
  getLegalFollowerSpots,
  isTilePlayable,
  roleForFeatureType,
} from './board.ts';
import { scoreCompletedFeatures, scoreEndGame } from './scoring.ts';

export function createBaseDeck(): string[] {
  const deck: string[] = [];
  for (const def of TILES) {
    const count = def.isStart ? def.count - 1 : def.count;
    for (let i = 0; i < count; i++) {
      deck.push(def.code);
    }
  }
  return deck;
}

export function createInitialGameState(
  seed: number = Math.floor(Math.random() * 1000000),
  mode: GameMode = 'rival',
  difficulty: AIDifficulty = 'knight'
): GameState {
  const rng = createRNG(seed);
  const deck = shuffle(createBaseDeck(), rng);

  const board = new Map<string, PlacedTile>();
  const graph = new FeatureGraph();

  // Starter tile D at (0, 0), rot 0
  const startTile: PlacedTile = {
    instanceId: 1,
    code: 'D',
    x: 0,
    y: 0,
    rotation: 0,
  };
  board.set('0,0', startTile);
  graph.addTile(startTile, board);

  const discards: string[] = [];
  let currentTile: string | null = null;

  while (deck.length > 0) {
    const candidate = deck.pop()!;
    if (isTilePlayable(candidate, board)) {
      currentTile = candidate;
      break;
    } else {
      discards.push(candidate);
    }
  }

  const initialEvents: GameEvent[] = [
    { type: 'TilePlaced', tile: startTile },
  ];

  return {
    seed,
    mode,
    difficulty,
    board,
    deck,
    discards,
    currentTile,
    turn: 'player',
    phase: currentTile ? 'PLACE_TILE' : 'GAME_OVER',
    scores: { player: 0, reeve: 0 },
    followers: [],
    followerSupply: { player: 7, reeve: 7 },
    completedCityKeys: new Set<string>(),
    lastPlacedTile: startTile,
    nextInstanceId: 2,
    nextFollowerId: 1,
    events: initialEvents,
    history: [],
  };
}

export function applyAction(
  state: GameState,
  action: GameAction,
  graph: FeatureGraph
): { state: GameState; graph: FeatureGraph } {
  const nextState: GameState = {
    ...state,
    board: new Map(state.board),
    deck: [...state.deck],
    discards: [...state.discards],
    scores: { ...state.scores },
    followers: [...state.followers],
    followerSupply: { ...state.followerSupply },
    completedCityKeys: new Set(state.completedCityKeys),
    events: [...state.events],
    history: [...state.history, action],
  };
  const nextGraph = graph.clone();

  if (action.type === 'PLACE_TILE') {
    if (nextState.phase !== 'PLACE_TILE' || !nextState.currentTile) {
      throw new Error('Invalid phase for PLACE_TILE');
    }

    const legal = getLegalPlacements(nextState.currentTile, nextState.board);
    const isMatch = legal.some(
      (opt) =>
        opt.x === action.x &&
        opt.y === action.y &&
        opt.rotation === action.rot
    );

    if (!isMatch) {
      throw new Error(`Illegal tile placement at (${action.x},${action.y}) rot ${action.rot}`);
    }

    const placedTile: PlacedTile = {
      instanceId: nextState.nextInstanceId++,
      code: nextState.currentTile,
      x: action.x,
      y: action.y,
      rotation: action.rot,
    };

    nextState.board.set(`${placedTile.x},${placedTile.y}`, placedTile);
    nextState.lastPlacedTile = placedTile;
    nextState.events.push({ type: 'TilePlaced', tile: placedTile });

    // Update graph
    nextGraph.addTile(placedTile, nextState.board);

    // Check if player has followers and legal spots
    const playerSupply = nextState.followerSupply[nextState.turn];
    const followerSpots = getLegalFollowerSpots(placedTile, nextGraph, playerSupply);

    if (playerSupply > 0 && followerSpots.length > 0) {
      nextState.phase = 'PLACE_FOLLOWER';
    } else {
      // Auto-skip follower phase
      return resolveFollowerAndScoring(nextState, nextGraph, null);
    }

    return { state: nextState, graph: nextGraph };
  }

  if (action.type === 'PLACE_FOLLOWER') {
    if (nextState.phase !== 'PLACE_FOLLOWER') {
      throw new Error('Invalid phase for PLACE_FOLLOWER');
    }

    return resolveFollowerAndScoring(nextState, nextGraph, action.featureId);
  }

  return { state: nextState, graph: nextGraph };
}

function resolveFollowerAndScoring(
  state: GameState,
  graph: FeatureGraph,
  featureId: string | null
): { state: GameState; graph: FeatureGraph } {
  const placedTile = state.lastPlacedTile!;
  const currentTurn = state.turn;

  // Place follower if chosen
  if (featureId) {
    const tileDef = TILE_MAP.get(placedTile.code);
    const feat = tileDef?.features.find((f) => f.id === featureId);
    if (!feat) {
      throw new Error(`Feature ${featureId} not found on tile ${placedTile.code}`);
    }

    const follower: Follower = {
      id: state.nextFollowerId++,
      playerId: currentTurn,
      role: roleForFeatureType(feat.type),
      tileInstanceId: placedTile.instanceId,
      featureId: feat.id,
      x: placedTile.x,
      y: placedTile.y,
    };

    state.followers.push(follower);
    state.followerSupply[currentTurn]--;
    state.events.push({ type: 'FollowerPlaced', follower });

    graph.placeFollower(follower);
  }

  // Check completions triggered by this tile placement
  const completions = graph.checkCompletions(placedTile, state.board);

  // Track finished cities
  for (const city of completions.finishedCities) {
    const rootKey = graph.find(city.key);
    state.completedCityKeys.add(rootKey);
  }

  // Score completed features
  const scoreResult = scoreCompletedFeatures(
    completions.finishedCities,
    completions.finishedRoads,
    completions.finishedMonasteries,
    state.board
  );

  state.scores.player += scoreResult.playerPoints;
  state.scores.reeve += scoreResult.reevePoints;

  // Return followers from completed features
  for (const returned of scoreResult.returnedFollowers) {
    const idx = state.followers.findIndex((f) => f.id === returned.followerId);
    if (idx !== -1) {
      const f = state.followers[idx];
      state.followers.splice(idx, 1);
      state.followerSupply[f.playerId]++;
      state.events.push({ type: 'FollowerReturned', follower: f });
    }
  }

  // Advance turn / draw next tile
  state.currentTile = null;

  while (state.deck.length > 0) {
    const candidate = state.deck.pop()!;
    if (isTilePlayable(candidate, state.board)) {
      state.currentTile = candidate;
      break;
    } else {
      state.discards.push(candidate);
      state.events.push({ type: 'TileDiscarded', code: candidate });
    }
  }

  if (!state.currentTile) {
    // End game: score remaining features & fields
    const endScoring = scoreEndGame(graph, state.board, state.completedCityKeys);
    state.scores.player += endScoring.playerPoints;
    state.scores.reeve += endScoring.reevePoints;

    for (const returned of endScoring.returnedFollowers) {
      state.followerSupply[returned.playerId]++;
    }
    state.followers = [];

    const winner: PlayerId | 'tie' =
      state.scores.player > state.scores.reeve
        ? 'player'
        : state.scores.reeve > state.scores.player
        ? 'reeve'
        : 'tie';

    state.phase = 'GAME_OVER';
    state.events.push({ type: 'EndgameScored', breakdown: endScoring.breakdowns });
    state.events.push({ type: 'GameOver', winner });
  } else {
    state.turn = state.turn === 'player' ? 'reeve' : 'player';
    state.phase = 'PLACE_TILE';
  }

  return { state, graph };
}
