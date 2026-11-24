import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, Rotation, AIDifficulty, GameMode } from '../engine/types.ts';
import { createInitialGameState, applyAction } from '../engine/game.ts';
import { getLegalPlacements, getLegalFollowerSpots, FollowerOption } from '../engine/board.ts';
import { chooseAITilePlacement, chooseAIFollowerPlacement } from '../engine/ai/reeveAI.ts';
import { FeatureGraph } from '../engine/features.ts';
import { soundManager } from '../audio/soundManager.ts';
import { BoardScene } from '../render/BoardScene.tsx';
import { HeaderHUD } from '../components/HeaderHUD.tsx';
import { TileDrawTray } from '../components/TileDrawTray.tsx';
import { FollowerPickerModal } from '../components/FollowerPickerModal.tsx';
import { TutorialModal } from '../components/TutorialModal.tsx';
import { EndScreen } from './EndScreen.tsx';

interface GameScreenProps {
  difficulty: AIDifficulty;
  mode: GameMode;
  seed?: number;
  onReturnHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  difficulty,
  mode,
  seed,
  onReturnHome,
}) => {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(seed, mode, difficulty)
  );
  const [featureGraph, setFeatureGraph] = useState<FeatureGraph>(() => {
    const g = new FeatureGraph();
    const startTile = gameState.board.get('0,0');
    if (startTile) g.addTile(startTile, gameState.board);
    return g;
  });

  const [selectedCoord, setSelectedCoord] = useState<{ x: number; y: number } | null>(null);
  const [candidateRotation, setCandidateRotation] = useState<Rotation>(0);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'top' | 'hero' | 'cinematic'>('iso');
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [showTutorial, setShowTutorial] = useState(false);
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const [zoomTrigger, setZoomTrigger] = useState(0);

  const handleZoomIn = useCallback(() => {
    setZoomTrigger((z) => z + 1);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomTrigger((z) => z - 1);
  }, []);

  // Compute legal placement options for the current tile
  const legalPlacements = useMemo(() => {
    if (gameState.phase !== 'PLACE_TILE' || !gameState.currentTile) return [];
    return getLegalPlacements(gameState.currentTile, gameState.board);
  }, [gameState.phase, gameState.currentTile, gameState.board]);

  // Check if current (selectedCoord + candidateRotation) is legal
  const isLegalSelection = useMemo(() => {
    if (!selectedCoord) return false;
    return legalPlacements.some(
      (p) =>
        p.x === selectedCoord.x &&
        p.y === selectedCoord.y &&
        p.rotation === candidateRotation
    );
  }, [selectedCoord, candidateRotation, legalPlacements]);

  // Available follower spots on newly placed tile
  const followerOptions: FollowerOption[] = useMemo(() => {
    if (
      gameState.phase !== 'PLACE_FOLLOWER' ||
      gameState.turn !== 'player' ||
      !gameState.lastPlacedTile
    ) {
      return [];
    }
    const supply = gameState.followerSupply.player;
    return getLegalFollowerSpots(gameState.lastPlacedTile, featureGraph, supply);
  }, [gameState.phase, gameState.turn, gameState.lastPlacedTile, featureGraph, gameState.followerSupply.player]);

  // Auto-pick rotation if only one rotation is valid for the selected coordinate
  const handleSelectCoord = useCallback(
    (coord: { x: number; y: number }) => {
      setSelectedCoord(coord);
      const matchingRots = legalPlacements
        .filter((p) => p.x === coord.x && p.y === coord.y)
        .map((p) => p.rotation);

      if (matchingRots.length > 0 && !matchingRots.includes(candidateRotation)) {
        setCandidateRotation(matchingRots[0]);
      }
      soundManager.playTileRotate();
    },
    [legalPlacements, candidateRotation]
  );

  const handleRotate = useCallback(() => {
    if (gameState.phase !== 'PLACE_TILE' || gameState.turn !== 'player') return;
    setCandidateRotation((prev) => ((prev + 1) % 4) as Rotation);
    soundManager.playTileRotate();
  }, [gameState.phase, gameState.turn]);

  const handleConfirmPlacement = useCallback(() => {
    if (!selectedCoord || !isLegalSelection) return;

    try {
      const res = applyAction(
        gameState,
        {
          type: 'PLACE_TILE',
          x: selectedCoord.x,
          y: selectedCoord.y,
          rot: candidateRotation,
        },
        featureGraph
      );

      soundManager.playTileSnap();
      setGameState(res.state);
      setFeatureGraph(res.graph);
      setSelectedCoord(null);
      setCandidateRotation(0);
    } catch (err) {
      console.error(err);
    }
  }, [selectedCoord, isLegalSelection, gameState, candidateRotation, featureGraph]);

  const handleSelectFollower = useCallback(
    (featureId: string | null) => {
      try {
        const res = applyAction(
          gameState,
          { type: 'PLACE_FOLLOWER', featureId },
          featureGraph
        );

        if (featureId) {
          const opt = followerOptions.find((o) => o.featureId === featureId);
          soundManager.playFollowerPlace(opt?.role || 'knight');
        }

        // Check recent events for completions
        const recent = res.state.events.slice(-3);
        for (const ev of recent) {
          if (ev.type === 'FeatureFinished') {
            if (ev.featureType === 'city') soundManager.playCityComplete();
            else if (ev.featureType === 'road') soundManager.playRoadComplete();
            else if (ev.featureType === 'monastery') soundManager.playMonasteryComplete();
          }
        }

        setGameState(res.state);
        setFeatureGraph(res.graph);
      } catch (err) {
        console.error(err);
      }
    },
    [gameState, featureGraph, followerOptions]
  );

  // Keyboard controls: 'R' to rotate, 'Enter' to place
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        handleRotate();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === 'Enter') {
        if (isLegalSelection) handleConfirmPlacement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRotate, isLegalSelection, handleConfirmPlacement]);

  // Reeve (AI) Autonomous Turn Execution
  useEffect(() => {
    if (gameState.phase === 'GAME_OVER' || gameState.turn !== 'reeve') return;

    let timeoutId: number;

    if (gameState.phase === 'PLACE_TILE') {
      timeoutId = window.setTimeout(() => {
        try {
          const placement = chooseAITilePlacement(gameState, featureGraph);
          const res = applyAction(
            gameState,
            {
              type: 'PLACE_TILE',
              x: placement.x,
              y: placement.y,
              rot: placement.rotation,
            },
            featureGraph
          );
          soundManager.playTileSnap();
          setGameState(res.state);
          setFeatureGraph(res.graph);
        } catch (err) {
          console.error('Reeve AI Tile Error:', err);
        }
      }, 750);
    } else if (gameState.phase === 'PLACE_FOLLOWER') {
      timeoutId = window.setTimeout(() => {
        try {
          const followerDecision = chooseAIFollowerPlacement(gameState, featureGraph);
          const res = applyAction(
            gameState,
            { type: 'PLACE_FOLLOWER', featureId: followerDecision.featureId },
            featureGraph
          );
          if (followerDecision.featureId) {
            soundManager.playFollowerPlace('knight');
          }
          setGameState(res.state);
          setFeatureGraph(res.graph);
        } catch (err) {
          console.error('Reeve AI Follower Error:', err);
        }
      }, 550);
    }

    return () => clearTimeout(timeoutId);
  }, [gameState, featureGraph]);

  const handleToggleMute = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  const handleRestart = () => {
    const initial = createInitialGameState(Math.floor(Math.random() * 1000000), mode, difficulty);
    const g = new FeatureGraph();
    const startTile = initial.board.get('0,0');
    if (startTile) g.addTile(startTile, initial.board);
    setGameState(initial);
    setFeatureGraph(g);
    setSelectedCoord(null);
    setCandidateRotation(0);
  };

  return (
    <div className="relative w-full h-full bg-[#120f0d] overflow-hidden select-none">
      {/* 3D Scene */}
      <BoardScene
        state={gameState}
        selectedCoord={selectedCoord}
        candidateRotation={candidateRotation}
        legalPlacements={legalPlacements}
        onSelectCoord={handleSelectCoord}
        cameraPreset={isPhotoMode ? 'cinematic' : cameraPreset}
        zoomTrigger={zoomTrigger}
      />

      {/* Top HUD */}
      {!isPhotoMode && (
        <HeaderHUD
          state={gameState}
          isMuted={isMuted}
          cameraPreset={cameraPreset}
          onToggleMute={handleToggleMute}
          onSelectCamera={setCameraPreset}
          onOpenTutorial={() => setShowTutorial(true)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRestart={handleRestart}
        />
      )}

      {/* Bottom Tile Draw Tray */}
      {!isPhotoMode && gameState.phase === 'PLACE_TILE' && gameState.turn === 'player' && (
        <TileDrawTray
          currentTile={gameState.currentTile}
          rotation={candidateRotation}
          selectedCoord={selectedCoord}
          isLegalSelection={isLegalSelection}
          onRotate={handleRotate}
          onConfirmPlacement={handleConfirmPlacement}
          disabled={gameState.turn !== 'player'}
        />
      )}

      {/* Follower Modal */}
      {gameState.phase === 'PLACE_FOLLOWER' &&
        gameState.turn === 'player' &&
        followerOptions.length > 0 && (
          <FollowerPickerModal
            options={followerOptions}
            onSelectOption={handleSelectFollower}
          />
        )}

      {/* End Screen */}
      {gameState.phase === 'GAME_OVER' && (
        <EndScreen
          state={gameState}
          onPlayAgain={handleRestart}
          onReturnHome={onReturnHome}
          onTogglePhotoMode={() => setIsPhotoMode(!isPhotoMode)}
          isPhotoMode={isPhotoMode}
        />
      )}

      {/* Rules / Tutorial Codex Modal */}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );
};
