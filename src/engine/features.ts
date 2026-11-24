import { FeatureType, Follower, PlacedTile, PlayerId } from './types.ts';
import { OPPOSITE_PORTS, rotatePort, SIDE_OFFSETS, SIDE_PORTS, TILE_MAP } from './tiles.ts';

export interface FeatureNode {
  key: string; // "tileInstanceId:localFeatureId"
  parent: string;
  type: FeatureType;
  tiles: Set<number>;
  shields: number;
  openPorts: Set<string>; // "tileInstanceId:port"
  openRoadEnds: Set<string>; // "tileInstanceId:port"
  followers: { followerId: number; playerId: PlayerId }[];
  adjCityKeys: Set<string>; // for fields: set of city root keys
}

export interface MonasteryTracker {
  tileInstanceId: number;
  x: number;
  y: number;
  follower: { followerId: number; playerId: PlayerId } | null;
}

export class FeatureGraph {
  public nodes: Map<string, FeatureNode> = new Map();
  public monasteries: Map<number, MonasteryTracker> = new Map();

  public find(key: string): string {
    const node = this.nodes.get(key);
    if (!node) return key;
    if (node.parent === key) return key;
    node.parent = this.find(node.parent);
    return node.parent;
  }

  public getRoot(key: string): FeatureNode | undefined {
    const rootKey = this.find(key);
    return this.nodes.get(rootKey);
  }

  public union(keyA: string, keyB: string): string {
    const rootA = this.find(keyA);
    const rootB = this.find(keyB);
    if (rootA === rootB) return rootA;

    const nodeA = this.nodes.get(rootA);
    const nodeB = this.nodes.get(rootB);
    if (!nodeA || !nodeB) return rootA || rootB;

    // Attach B under A
    nodeB.parent = rootA;

    // Merge tiles
    nodeB.tiles.forEach((t) => nodeA.tiles.add(t));
    nodeA.shields += nodeB.shields;

    // Merge open ports
    nodeB.openPorts.forEach((p) => nodeA.openPorts.add(p));
    nodeB.openRoadEnds.forEach((p) => nodeA.openRoadEnds.add(p));

    // Merge followers
    nodeA.followers.push(...nodeB.followers);

    // Merge adjacent cities
    nodeB.adjCityKeys.forEach((c) => nodeA.adjCityKeys.add(c));

    return rootA;
  }

  /**
   * Adds all features of a newly placed tile and connects them to adjacent placed tiles.
   */
  public addTile(tile: PlacedTile, board: Map<string, PlacedTile>) {
    return this.addPlacedTile(tile, board);
  }

  public addPlacedTile(
    tile: PlacedTile,
    board: Map<string, PlacedTile>
  ): {
    finishedCities: FeatureNode[];
    finishedRoads: FeatureNode[];
    finishedMonasteries: MonasteryTracker[];
  } {
    const tileDef = TILE_MAP.get(tile.code)!;

    // 1. Initialize local feature nodes
    for (const feat of tileDef.features) {
      const key = `${tile.instanceId}:${feat.id}`;
      const rotatedPorts = feat.ports.map((p) => rotatePort(p, tile.rotation));

      const openPorts = new Set<string>();
      const openRoadEnds = new Set<string>();

      if (feat.type === 'city') {
        rotatedPorts.forEach((p) => openPorts.add(`${tile.instanceId}:${p}`));
      } else if (feat.type === 'road') {
        rotatedPorts.forEach((p) => openRoadEnds.add(`${tile.instanceId}:${p}`));
      }

      const adjCityKeys = new Set<string>();
      if (feat.type === 'field' && feat.adjCities) {
        feat.adjCities.forEach((cId) => {
          adjCityKeys.add(`${tile.instanceId}:${cId}`);
        });
      }

      this.nodes.set(key, {
        key,
        parent: key,
        type: feat.type,
        tiles: new Set([tile.instanceId]),
        shields: feat.shield ? 1 : 0,
        openPorts,
        openRoadEnds,
        followers: [],
        adjCityKeys,
      });

      if (feat.type === 'monastery') {
        this.monasteries.set(tile.instanceId, {
          tileInstanceId: tile.instanceId,
          x: tile.x,
          y: tile.y,
          follower: null,
        });
      }
    }

    // Map rotated port -> local feature ID
    const portToLocalFeat = new Map<number, string>();
    for (const feat of tileDef.features) {
      if (feat.type === 'monastery') continue;
      for (const p of feat.ports) {
        const rotP = rotatePort(p, tile.rotation);
        portToLocalFeat.set(rotP, feat.id);
      }
    }

    // 2. Connect to orthogonal neighbors
    for (let side = 0; side < 4; side++) {
      const [dx, dy] = SIDE_OFFSETS[side];
      const neighborCoord = `${tile.x + dx},${tile.y + dy}`;
      const neighbor = board.get(neighborCoord);
      if (!neighbor) continue;

      const neighborDef = TILE_MAP.get(neighbor.code)!;
      const neighborPortToFeat = new Map<number, string>();
      for (const feat of neighborDef.features) {
        if (feat.type === 'monastery') continue;
        for (const p of feat.ports) {
          const rotP = rotatePort(p, neighbor.rotation);
          neighborPortToFeat.set(rotP, feat.id);
        }
      }

      const sidePorts = SIDE_PORTS[side];
      for (const myPort of sidePorts) {
        const neighborPort = OPPOSITE_PORTS[myPort];
        const myFeatId = portToLocalFeat.get(myPort);
        const neighborFeatId = neighborPortToFeat.get(neighborPort);

        if (myFeatId && neighborFeatId) {
          const myKey = `${tile.instanceId}:${myFeatId}`;
          const neighborKey = `${neighbor.instanceId}:${neighborFeatId}`;

          const root = this.union(myKey, neighborKey);
          const rootNode = this.nodes.get(root)!;

          // Matched port is no longer open!
          rootNode.openPorts.delete(`${tile.instanceId}:${myPort}`);
          rootNode.openPorts.delete(`${neighbor.instanceId}:${neighborPort}`);

          rootNode.openRoadEnds.delete(`${tile.instanceId}:${myPort}`);
          rootNode.openRoadEnds.delete(`${neighbor.instanceId}:${neighborPort}`);
        }
      }
    }

    // 3. Find completed features
    const finishedCities: FeatureNode[] = [];
    const finishedRoads: FeatureNode[] = [];
    const finishedMonasteries: MonasteryTracker[] = [];

    const checkedRoots = new Set<string>();

    for (const feat of tileDef.features) {
      if (feat.type === 'monastery') continue;
      const rootKey = this.find(`${tile.instanceId}:${feat.id}`);
      if (checkedRoots.has(rootKey)) continue;
      checkedRoots.add(rootKey);

      const rootNode = this.nodes.get(rootKey)!;
      if (rootNode.type === 'city' && rootNode.openPorts.size === 0) {
        finishedCities.push(rootNode);
      } else if (rootNode.type === 'road' && rootNode.openRoadEnds.size === 0) {
        finishedRoads.push(rootNode);
      }
    }

    // Check monasteries (this tile or any of its 8 neighbors)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const checkX = tile.x + dx;
        const checkY = tile.y + dy;
        const checkTile = board.get(`${checkX},${checkY}`);
        if (!checkTile) continue;

        const mon = this.monasteries.get(checkTile.instanceId);
        if (mon) {
          let neighborsCount = 0;
          for (let ndx = -1; ndx <= 1; ndx++) {
            for (let ndy = -1; ndy <= 1; ndy++) {
              if (ndx === 0 && ndy === 0) continue;
              if (board.has(`${checkX + ndx},${checkY + ndy}`)) {
                neighborsCount++;
              }
            }
          }
          if (neighborsCount === 8) {
            finishedMonasteries.push(mon);
          }
        }
      }
    }

    return { finishedCities, finishedRoads, finishedMonasteries };
  }


  public checkCompletions(
    tile: PlacedTile,
    board: Map<string, PlacedTile>
  ): {
    finishedCities: FeatureNode[];
    finishedRoads: FeatureNode[];
    finishedMonasteries: MonasteryTracker[];
  } {
    const tileDef = TILE_MAP.get(tile.code)!;
    const finishedCities: FeatureNode[] = [];
    const finishedRoads: FeatureNode[] = [];
    const finishedMonasteries: MonasteryTracker[] = [];

    const checkedRoots = new Set<string>();

    for (const feat of tileDef.features) {
      if (feat.type === 'monastery') continue;
      const rootKey = this.find(tile.instanceId + ':' + feat.id);
      if (checkedRoots.has(rootKey)) continue;
      checkedRoots.add(rootKey);

      const rootNode = this.nodes.get(rootKey);
      if (!rootNode) continue;
      if (rootNode.type === 'city' && rootNode.openPorts.size === 0) {
        finishedCities.push(rootNode);
      } else if (rootNode.type === 'road' && rootNode.openRoadEnds.size === 0) {
        finishedRoads.push(rootNode);
      }
    }

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const checkX = tile.x + dx;
        const checkY = tile.y + dy;
        const checkTile = board.get(checkX + ',' + checkY);
        if (!checkTile) continue;

        const mon = this.monasteries.get(checkTile.instanceId);
        if (mon) {
          let neighborsCount = 0;
          for (let ndx = -1; ndx <= 1; ndx++) {
            for (let ndy = -1; ndy <= 1; ndy++) {
              if (ndx === 0 && ndy === 0) continue;
              if (board.has((checkX + ndx) + ',' + (checkY + ndy))) {
                neighborsCount++;
              }
            }
          }
          if (neighborsCount === 8) {
            finishedMonasteries.push(mon);
          }
        }
      }
    }

    return { finishedCities, finishedRoads, finishedMonasteries };
  }

  public placeFollower(
    follower: Follower
  ) {
    if (follower.role === 'monk') {
      const mon = this.monasteries.get(follower.tileInstanceId);
      if (mon) {
        mon.follower = { followerId: follower.id, playerId: follower.playerId };
      }
      return;
    }

    const key = `${follower.tileInstanceId}:${follower.featureId}`;
    const rootKey = this.find(key);
    const rootNode = this.nodes.get(rootKey);
    if (rootNode) {
      rootNode.followers.push({
        followerId: follower.id,
        playerId: follower.playerId,
      });
    }
  }

  public clone(): FeatureGraph {
    const copy = new FeatureGraph();
    this.nodes.forEach((val, k) => {
      copy.nodes.set(k, {
        key: val.key,
        parent: val.parent,
        type: val.type,
        tiles: new Set(val.tiles),
        shields: val.shields,
        openPorts: new Set(val.openPorts),
        openRoadEnds: new Set(val.openRoadEnds),
        followers: val.followers.map((f) => ({ ...f })),
        adjCityKeys: new Set(val.adjCityKeys),
      });
    });
    this.monasteries.forEach((val, k) => {
      copy.monasteries.set(k, {
        tileInstanceId: val.tileInstanceId,
        x: val.x,
        y: val.y,
        follower: val.follower ? { ...val.follower } : null,
      });
    });
    return copy;
  }
}
