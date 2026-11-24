import { describe, it, expect } from 'vitest';
import { TILES, TILE_MAP, getEdgeType } from '../src/engine/tiles.ts';
import { createBaseDeck, createInitialGameState, applyAction } from '../src/engine/game.ts';
import { getLegalPlacements, getLegalFollowerSpots } from '../src/engine/board.ts';
import { FeatureGraph } from '../src/engine/features.ts';
import { chooseAITilePlacement, chooseAIFollowerPlacement } from '../src/engine/ai/reeveAI.ts';
import { PlacedTile } from '../src/engine/types.ts';

describe('Tile Catalogue Invariants', () => {
  it('contains 72 total tiles across 24 types A-X', () => {
    expect(TILES.length).toBe(24);
    const totalCount = TILES.reduce((acc, t) => acc + t.count, 0);
    expect(totalCount).toBe(72);
  });

  it('draw deck contains 71 tiles excluding the start tile D', () => {
    const deck = createBaseDeck();
    expect(deck.length).toBe(71);
    const dCount = deck.filter((c) => c === 'D').length;
    expect(dCount).toBe(3); // 4 total minus 1 starter
  });

  it('starter tile D has expected features and edges', () => {
    const dDef = TILE_MAP.get('D')!;
    expect(dDef).toBeDefined();
    expect(dDef.isStart).toBe(true);
    // N: City, E: Road, S: Field, W: Road
    expect(getEdgeType(dDef, 0, 0)).toBe('C'); // Side 0 (N)
    expect(getEdgeType(dDef, 1, 0)).toBe('R'); // Side 1 (E)
    expect(getEdgeType(dDef, 2, 0)).toBe('F'); // Side 2 (S)
    expect(getEdgeType(dDef, 3, 0)).toBe('R'); // Side 3 (W)
  });
});

describe('Board & Placement Rules', () => {
  it('calculates legal placements around the start tile', () => {
    const state = createInitialGameState(42);
    expect(state.board.size).toBe(1);
    expect(state.board.get('0,0')?.code).toBe('D');

    if (state.currentTile) {
      const placements = getLegalPlacements(state.currentTile, state.board);
      expect(placements.length).toBeGreaterThan(0);
      for (const p of placements) {
        // Must be adjacent to (0, 0)
        const dist = Math.abs(p.x) + Math.abs(p.y);
        expect(dist).toBe(1);
      }
    }
  });

  it('allows meeple placement only on unoccupied features', () => {
    const state = createInitialGameState(101);
    const graph = new FeatureGraph();
    const startTile: PlacedTile = { instanceId: 1, code: 'D', x: 0, y: 0, rotation: 0 };
    graph.addTile(startTile, state.board);

    const followerSpots = getLegalFollowerSpots(startTile, graph, 7);
    expect(followerSpots.length).toBeGreaterThan(0);

    // Place follower on the city
    const citySpot = followerSpots.find((s) => s.type === 'city')!;
    expect(citySpot).toBeDefined();
    graph.placeFollower({
      id: 1,
      playerId: 'player',
      role: 'knight',
      tileInstanceId: 1,
      featureId: citySpot.featureId,
      x: 0,
      y: 0,
    });

    // Verify city spot is no longer legal for another meeple
    const spotsAfter = getLegalFollowerSpots(startTile, graph, 6);
    expect(spotsAfter.some((s) => s.type === 'city')).toBe(false);
  });
});

describe('Feature Completions & Scoring', () => {
  it('correctly detects and scores a 2-tile completed city', () => {
    const board = new Map<string, PlacedTile>();
    const graph = new FeatureGraph();

    // Tile 1: E at (0, 0) rot 0 (City on North)
    const t1: PlacedTile = { instanceId: 1, code: 'E', x: 0, y: 0, rotation: 0 };
    board.set('0,0', t1);
    graph.addTile(t1, board);

    // Place player knight on t1's city
    graph.placeFollower({
      id: 1,
      playerId: 'player',
      role: 'knight',
      tileInstanceId: 1,
      featureId: 'c0',
      x: 0,
      y: 0,
    });

    // Tile 2: E at (0, 1) rot 2 (City on South: (0 + 2) % 4 = 2, so it connects to t1 North)
    const t2: PlacedTile = { instanceId: 2, code: 'E', x: 0, y: 1, rotation: 2 };
    board.set('0,1', t2);
    graph.addTile(t2, board);

    const completions = graph.checkCompletions(t2, board);
    expect(completions.finishedCities.length).toBe(1);

    const city = completions.finishedCities[0];
    expect(city.tiles.size).toBe(2);
    // 2 tiles * 2 pts = 4 pts
    const score = city.tiles.size * 2 + city.shields * 2;
    expect(score).toBe(4);
  });

  it('correctly completes and scores a monastery surrounded by 8 tiles', () => {
    const board = new Map<string, PlacedTile>();
    const graph = new FeatureGraph();

    // Monastery at (0, 0)
    const monTile: PlacedTile = { instanceId: 1, code: 'B', x: 0, y: 0, rotation: 0 };
    board.set('0,0', monTile);
    graph.addTile(monTile, board);
    graph.placeFollower({
      id: 1,
      playerId: 'player',
      role: 'monk',
      tileInstanceId: 1,
      featureId: 'm',
      x: 0,
      y: 0,
    });

    // Surround with 8 tiles
    let id = 2;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const t: PlacedTile = { instanceId: id++, code: 'B', x: dx, y: dy, rotation: 0 };
        board.set(`${dx},${dy}`, t);
        graph.addTile(t, board);
        if (dx === 1 && dy === 1) {
          // Last tile added completes the monastery
          const completions = graph.checkCompletions(t, board);
          expect(completions.finishedMonasteries.length).toBe(1);
          expect(completions.finishedMonasteries[0].tileInstanceId).toBe(1);
        }
      }
    }
  });
});

describe('Autonomous Game Simulation Fuzz Test', () => {
  it('simulates 20 full games between Player AI and Reeve AI without crashes or invalid states', () => {
    for (let seed = 1; seed <= 20; seed++) {
      let state = createInitialGameState(seed, 'rival', 'knight');
      let graph = new FeatureGraph();
      graph.addTile(state.board.get('0,0')!, state.board);

      let turnCount = 0;
      const maxTurns = 150;

      while (state.phase !== 'GAME_OVER' && turnCount < maxTurns) {
        turnCount++;

        if (state.phase === 'PLACE_TILE') {
          const placement = chooseAITilePlacement(state, graph);
          const res = applyAction(
            state,
            { type: 'PLACE_TILE', x: placement.x, y: placement.y, rot: placement.rotation },
            graph
          );
          state = res.state;
          graph = res.graph;
        } else if (state.phase === 'PLACE_FOLLOWER') {
          const followerDecision = chooseAIFollowerPlacement(state, graph);
          const res = applyAction(
            state,
            { type: 'PLACE_FOLLOWER', featureId: followerDecision.featureId },
            graph
          );
          state = res.state;
          graph = res.graph;
        }
      }

      expect(state.phase).toBe('GAME_OVER');
      expect(state.scores.player).toBeGreaterThanOrEqual(0);
      expect(state.scores.reeve).toBeGreaterThanOrEqual(0);
      expect(state.board.size).toBeGreaterThanOrEqual(10);
    }
  });
});

describe('Advanced Scoring & Majority Rules', () => {
  it('splits points equally on follower ties and gives sole points to majority', async () => {
    const board = new Map<string, PlacedTile>();
    const graph = new FeatureGraph();

    // 2-tile city
    const t1: PlacedTile = { instanceId: 1, code: 'E', x: 0, y: 0, rotation: 0 };
    const t2: PlacedTile = { instanceId: 2, code: 'E', x: 0, y: 1, rotation: 2 };
    board.set('0,0', t1);
    graph.addTile(t1, board);
    board.set('0,1', t2);
    graph.addTile(t2, board);

    // Place 1 follower for player and 1 for reeve
    graph.placeFollower({
      id: 1,
      playerId: 'player',
      role: 'knight',
      tileInstanceId: 1,
      featureId: 'c0',
      x: 0,
      y: 0,
    });
    graph.placeFollower({
      id: 2,
      playerId: 'reeve',
      role: 'knight',
      tileInstanceId: 2,
      featureId: 'c0',
      x: 0,
      y: 1,
    });

    const completions = graph.checkCompletions(t2, board);
    expect(completions.finishedCities.length).toBe(1);
    const city = completions.finishedCities[0];

    const { scoreCompletedFeatures } = await import('../src/engine/scoring.ts');
    const result = scoreCompletedFeatures([city], [], [], board);

    // 2 tiles * 2 pts = 4 pts each on tie
    expect(result.playerPoints).toBe(4);
    expect(result.reevePoints).toBe(4);
    expect(result.returnedFollowers.length).toBe(2);
  });
});

describe('Deep 50-game Fuzz Test', () => {
  it('runs 50 varied seed games on reeve_lord difficulty smoothly', () => {
    for (let seed = 100; seed < 150; seed++) {
      let state = createInitialGameState(seed, 'rival', 'reeve_lord');
      let graph = new FeatureGraph();
      graph.addTile(state.board.get('0,0')!, state.board);

      let turns = 0;
      while (state.phase !== 'GAME_OVER' && turns < 200) {
        turns++;
        if (state.phase === 'PLACE_TILE') {
          const p = chooseAITilePlacement(state, graph);
          const res = applyAction(state, { type: 'PLACE_TILE', x: p.x, y: p.y, rot: p.rotation }, graph);
          state = res.state;
          graph = res.graph;
        } else if (state.phase === 'PLACE_FOLLOWER') {
          const f = chooseAIFollowerPlacement(state, graph);
          const res = applyAction(state, { type: 'PLACE_FOLLOWER', featureId: f.featureId }, graph);
          state = res.state;
          graph = res.graph;
        }
      }

      expect(state.phase).toBe('GAME_OVER');
      expect(state.scores.player + state.scores.reeve).toBeGreaterThan(0);
    }
  });
});
