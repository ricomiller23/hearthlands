import { FeatureNode, FeatureGraph, MonasteryTracker } from './features.ts';
import { PlayerId, PlacedTile } from './types.ts';

export interface ScoreBreakdownItem {
  id: string;
  type: 'road' | 'city' | 'monastery' | 'field';
  points: number;
  tileCount: number;
  shieldCount?: number;
  completed: boolean;
  majorityPlayers: PlayerId[];
  coords: { x: number; y: number }[];
}

export interface ScoreResult {
  playerPoints: number;
  reevePoints: number;
  returnedFollowers: { followerId: number; playerId: PlayerId }[];
  breakdowns: ScoreBreakdownItem[];
}

export function scoreCompletedFeatures(
  finishedCities: FeatureNode[],
  finishedRoads: FeatureNode[],
  finishedMonasteries: MonasteryTracker[],
  board: Map<string, PlacedTile>
): ScoreResult {
  let playerPoints = 0;
  let reevePoints = 0;
  const returnedFollowers: { followerId: number; playerId: PlayerId }[] = [];
  const breakdowns: ScoreBreakdownItem[] = [];

  // 1. Completed Roads: 1 point per tile
  for (const road of finishedRoads) {
    if (road.followers.length === 0) continue;

    const points = road.tiles.size;
    const majority = getMajorityPlayers(road.followers);

    if (majority.includes('player')) playerPoints += points;
    if (majority.includes('reeve')) reevePoints += points;

    for (const f of road.followers) {
      returnedFollowers.push(f);
    }

    const coords = getTileCoords(road.tiles, board);
    breakdowns.push({
      id: road.key,
      type: 'road',
      points,
      tileCount: road.tiles.size,
      completed: true,
      majorityPlayers: majority,
      coords,
    });
  }

  // 2. Completed Cities: 2 points per tile + 2 points per shield
  for (const city of finishedCities) {
    if (city.followers.length === 0) continue;

    const points = city.tiles.size * 2 + city.shields * 2;
    const majority = getMajorityPlayers(city.followers);

    if (majority.includes('player')) playerPoints += points;
    if (majority.includes('reeve')) reevePoints += points;

    for (const f of city.followers) {
      returnedFollowers.push(f);
    }

    const coords = getTileCoords(city.tiles, board);
    breakdowns.push({
      id: city.key,
      type: 'city',
      points,
      tileCount: city.tiles.size,
      shieldCount: city.shields,
      completed: true,
      majorityPlayers: majority,
      coords,
    });
  }

  // 3. Completed Monasteries: 9 points
  for (const mon of finishedMonasteries) {
    if (!mon.follower) continue;

    const points = 9;
    const majority: PlayerId[] = [mon.follower.playerId];

    if (mon.follower.playerId === 'player') playerPoints += points;
    else reevePoints += points;

    returnedFollowers.push(mon.follower);

    breakdowns.push({
      id: `monastery:${mon.tileInstanceId}`,
      type: 'monastery',
      points,
      tileCount: 9,
      completed: true,
      majorityPlayers: majority,
      coords: [{ x: mon.x, y: mon.y }],
    });
  }

  return { playerPoints, reevePoints, returnedFollowers, breakdowns };
}

export function scoreEndGame(
  graph: FeatureGraph,
  board: Map<string, PlacedTile>,
  completedCityKeys: Set<string>
): ScoreResult {
  let playerPoints = 0;
  let reevePoints = 0;
  const returnedFollowers: { followerId: number; playerId: PlayerId }[] = [];
  const breakdowns: ScoreBreakdownItem[] = [];

  const processedRoots = new Set<string>();

  // 1. Incomplete Roads: 1 point per tile
  // 2. Incomplete Cities: 1 point per tile + 1 point per shield
  graph.nodes.forEach((_, key) => {
    const rootKey = graph.find(key);
    if (processedRoots.has(rootKey)) return;
    processedRoots.add(rootKey);

    const root = graph.nodes.get(rootKey);
    if (!root || root.followers.length === 0) return;

    if (root.type === 'road') {
      const points = root.tiles.size;
      const majority = getMajorityPlayers(root.followers);

      if (majority.includes('player')) playerPoints += points;
      if (majority.includes('reeve')) reevePoints += points;

      for (const f of root.followers) returnedFollowers.push(f);

      breakdowns.push({
        id: root.key,
        type: 'road',
        points,
        tileCount: root.tiles.size,
        completed: false,
        majorityPlayers: majority,
        coords: getTileCoords(root.tiles, board),
      });
    } else if (root.type === 'city') {
      // Incomplete city scores 1 pt per tile + 1 pt per shield
      const points = root.tiles.size * 1 + root.shields * 1;
      const majority = getMajorityPlayers(root.followers);

      if (majority.includes('player')) playerPoints += points;
      if (majority.includes('reeve')) reevePoints += points;

      for (const f of root.followers) returnedFollowers.push(f);

      breakdowns.push({
        id: root.key,
        type: 'city',
        points,
        tileCount: root.tiles.size,
        shieldCount: root.shields,
        completed: false,
        majorityPlayers: majority,
        coords: getTileCoords(root.tiles, board),
      });
    }
  });

  // 3. Incomplete Monasteries: 1 pt for monastery + 1 pt per adjacent neighbor
  graph.monasteries.forEach((mon) => {
    if (!mon.follower) return;

    let neighborsCount = 1; // 1 for itself
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (board.has(`${mon.x + dx},${mon.y + dy}`)) {
          neighborsCount++;
        }
      }
    }

    const points = neighborsCount;
    const majority: PlayerId[] = [mon.follower.playerId];

    if (mon.follower.playerId === 'player') playerPoints += points;
    else reevePoints += points;

    returnedFollowers.push(mon.follower);

    breakdowns.push({
      id: `monastery:${mon.tileInstanceId}`,
      type: 'monastery',
      points,
      tileCount: neighborsCount,
      completed: false,
      majorityPlayers: majority,
      coords: [{ x: mon.x, y: mon.y }],
    });
  });

  // 4. Fields (Farms): 3 points per completed city touching the field
  // City can only be counted once per player
  const playerScoredCities = new Set<string>();
  const reeveScoredCities = new Set<string>();

  const fieldRoots = new Set<string>();
  graph.nodes.forEach((_, key) => {
    const rootKey = graph.find(key);
    if (fieldRoots.has(rootKey)) return;
    fieldRoots.add(rootKey);

    const root = graph.nodes.get(rootKey);
    if (!root || root.type !== 'field' || root.followers.length === 0) return;

    const majority = getMajorityPlayers(root.followers);

    // Find all completed cities touching this field
    const touchingCompletedCities: string[] = [];
    root.adjCityKeys.forEach((cityKey) => {
      const cityRootKey = graph.find(cityKey);
      if (completedCityKeys.has(cityRootKey)) {
        touchingCompletedCities.push(cityRootKey);
      }
    });

    let awardedPlayerPoints = 0;
    let awardedReevePoints = 0;

    for (const cityRoot of touchingCompletedCities) {
      if (majority.includes('player') && !playerScoredCities.has(cityRoot)) {
        playerScoredCities.add(cityRoot);
        awardedPlayerPoints += 3;
      }
      if (majority.includes('reeve') && !reeveScoredCities.has(cityRoot)) {
        reeveScoredCities.add(cityRoot);
        awardedReevePoints += 3;
      }
    }

    playerPoints += awardedPlayerPoints;
    reevePoints += awardedReevePoints;

    for (const f of root.followers) returnedFollowers.push(f);

    breakdowns.push({
      id: root.key,
      type: 'field',
      points: Math.max(awardedPlayerPoints, awardedReevePoints),
      tileCount: root.tiles.size,
      completed: false,
      majorityPlayers: majority,
      coords: getTileCoords(root.tiles, board),
    });
  });

  return { playerPoints, reevePoints, returnedFollowers, breakdowns };
}

export function getMajorityPlayers(
  followers: { followerId: number; playerId: PlayerId }[]
): PlayerId[] {
  let pCount = 0;
  let rCount = 0;
  for (const f of followers) {
    if (f.playerId === 'player') pCount++;
    else if (f.playerId === 'reeve') rCount++;
  }
  if (pCount === 0 && rCount === 0) return [];
  if (pCount > rCount) return ['player'];
  if (rCount > pCount) return ['reeve'];
  return ['player', 'reeve'];
}

function getTileCoords(
  tileInstanceIds: Set<number>,
  board: Map<string, PlacedTile>
): { x: number; y: number }[] {
  const coords: { x: number; y: number }[] = [];
  board.forEach((pt) => {
    if (tileInstanceIds.has(pt.instanceId)) {
      coords.push({ x: pt.x, y: pt.y });
    }
  });
  return coords;
}
