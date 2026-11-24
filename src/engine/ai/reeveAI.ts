import { GameState, PlacedTile, Rotation, AIDifficulty } from '../types.ts';
import { FeatureGraph } from '../features.ts';
import { getLegalPlacements, getLegalFollowerSpots, FollowerOption } from '../board.ts';
import { TILE_MAP } from '../tiles.ts';

export interface AIDecisionTile {
  x: number;
  y: number;
  rotation: Rotation;
}

export interface AIDecisionFollower {
  featureId: string | null;
}

export function chooseAITilePlacement(
  state: GameState,
  graph: FeatureGraph
): AIDecisionTile {
  if (!state.currentTile) {
    throw new Error('No current tile to place');
  }

  const legal = getLegalPlacements(state.currentTile, state.board);
  if (legal.length === 0) {
    throw new Error('No legal tile placements');
  }

  const scoredOptions = legal.map((opt) => {
    const score = evaluatePlacement(opt, state, graph, state.difficulty);
    return { opt, score };
  });

  // Sort descending by score
  scoredOptions.sort((a, b) => b.score - a.score);

  if (state.difficulty === 'squire') {
    // Add some noise: pick among top 3
    const topN = scoredOptions.slice(0, Math.min(3, scoredOptions.length));
    return topN[Math.floor(Math.random() * topN.length)].opt;
  }

  return scoredOptions[0].opt;
}

export function chooseAIFollowerPlacement(
  state: GameState,
  graph: FeatureGraph
): AIDecisionFollower {
  const placedTile = state.lastPlacedTile;
  if (!placedTile) return { featureId: null };

  const supply = state.followerSupply.reeve;
  if (supply <= 0) return { featureId: null };

  const spots = getLegalFollowerSpots(placedTile, graph, supply);
  if (spots.length === 0) return { featureId: null };

  // Evaluate each spot
  const scoredSpots = spots.map((spot) => {
    const score = evaluateFollowerSpot(spot, placedTile, state, graph, supply);
    return { spot, score };
  });

  scoredSpots.sort((a, b) => b.score - a.score);

  const best = scoredSpots[0];
  // Minimum threshold to commit a meeple
  const threshold = supply === 1 ? 7 : supply <= 2 ? 4 : 2;

  if (best && best.score >= threshold) {
    return { featureId: best.spot.featureId };
  }

  return { featureId: null };
}

function evaluatePlacement(
  opt: { x: number; y: number; rotation: Rotation },
  state: GameState,
  graph: FeatureGraph,
  difficulty: AIDifficulty
): number {
  let score = 0;
  const tileCode = state.currentTile!;
  const tileDef = TILE_MAP.get(tileCode);
  if (!tileDef) return 0;

  // 1. Connectivity bonus: placing adjacent to more tiles builds cohesive diorama
  let neighborCount = 0;
  for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
    if (state.board.has(`${opt.x + dx},${opt.y + dy}`)) neighborCount++;
  }
  score += neighborCount * 2;

  // 2. Simulate placement on cloned graph
  const simTile: PlacedTile = {
    instanceId: 9999,
    code: tileCode,
    x: opt.x,
    y: opt.y,
    rotation: opt.rotation,
  };

  const simBoard = new Map(state.board);
  simBoard.set(`${opt.x},${opt.y}`, simTile);

  const simGraph = graph.clone();
  simGraph.addTile(simTile, simBoard);

  const completions = simGraph.checkCompletions(simTile, simBoard);

  // Completed cities
  for (const c of completions.finishedCities) {
    const reeveHas = c.followers.some((f) => f.playerId === 'reeve');
    const playerHas = c.followers.some((f) => f.playerId === 'player');
    const pts = c.tiles.size * 2 + c.shields * 2;

    if (reeveHas && !playerHas) score += pts * 3;
    else if (reeveHas && playerHas) score += pts * 1.5;
    else if (!reeveHas && playerHas) {
      // Completed player city? We want to avoid helping player unless blocking!
      score -= pts * 2;
    }
  }

  // Completed roads
  for (const r of completions.finishedRoads) {
    const reeveHas = r.followers.some((f) => f.playerId === 'reeve');
    const playerHas = r.followers.some((f) => f.playerId === 'player');
    const pts = r.tiles.size;

    if (reeveHas && !playerHas) score += pts * 2;
    else if (reeveHas && playerHas) score += pts;
    else if (!reeveHas && playerHas) score -= pts;
  }

  // Monastery completion
  for (const m of completions.finishedMonasteries) {
    if (m.follower?.playerId === 'reeve') score += 18;
    else if (m.follower?.playerId === 'player') score -= 9;
  }

  // Higher difficulty additions: strategic blocking & field positioning
  if (difficulty === 'baron' || difficulty === 'reeve_lord') {
    // Encourage placing monastery in well-surrounded spots
    if (tileDef.features.some((f) => f.type === 'monastery')) {
      score += neighborCount * 3;
    }

    // Discourage placing tiles that make opponent's open cities easy to close
    graph.nodes.forEach((node) => {
      if (node.type === 'city' && node.openPorts.size === 1) {
        const playerHas = node.followers.some((f) => f.playerId === 'player');
        const reeveHas = node.followers.some((f) => f.playerId === 'reeve');
        if (playerHas && !reeveHas) {
          score -= 4; // penalty for closing opponent's near-closed city
        }
      }
    });
  }

  return score;
}

function evaluateFollowerSpot(
  spot: FollowerOption,
  tile: PlacedTile,
  state: GameState,
  graph: FeatureGraph,
  supply: number
): number {
  let score = 0;

  switch (spot.type) {
    case 'monastery': {
      // Monasteries are very reliable points
      let neighbors = 1;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          if (state.board.has(`${tile.x + dx},${tile.y + dy}`)) neighbors++;
        }
      }
      score = 5 + neighbors; // 6 to 13
      break;
    }
    case 'city': {
      const key = `${tile.instanceId}:${spot.featureId}`;
      const root = graph.getRoot(key);
      const size = root ? root.tiles.size : 1;
      const shields = root ? root.shields : 0;
      score = 4 + size * 2 + shields * 2;
      break;
    }
    case 'road': {
      const key = `${tile.instanceId}:${spot.featureId}`;
      const root = graph.getRoot(key);
      const size = root ? root.tiles.size : 1;
      score = 2 + size;
      break;
    }
    case 'field': {
      // Farmers don't return until end of game!
      // Only place farmer if deck has <= 30 tiles and supply >= 3
      if (state.deck.length > 35 || supply < 3) {
        return 0;
      }
      const key = `${tile.instanceId}:${spot.featureId}`;
      const root = graph.getRoot(key);
      const adjCities = root ? root.adjCityKeys.size : 0;
      score = 3 + adjCities * 3;
      break;
    }
  }

  return score;
}
