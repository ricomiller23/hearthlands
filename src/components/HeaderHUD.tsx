import React from 'react';
import { Volume2, VolumeX, BookOpen, RotateCcw, Eye, Shield, Compass, ZoomIn, ZoomOut } from 'lucide-react';
import { GameState } from '../engine/types.ts';

interface HeaderHUDProps {
  state: GameState;
  isMuted: boolean;
  cameraPreset: 'iso' | 'top' | 'hero' | 'cinematic';
  onToggleMute: () => void;
  onSelectCamera: (preset: 'iso' | 'top' | 'hero' | 'cinematic') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenTutorial: () => void;
  onRestart: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  state,
  isMuted,
  cameraPreset,
  onToggleMute,
  onSelectCamera,
  onZoomIn,
  onZoomOut,
  onOpenTutorial,
  onRestart,
}) => {
  const isPlayerTurn = state.turn === 'player';

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-3">
      {/* Left: Player Scores & Meeples */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-stone-900/85 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-amber-900/50 shadow-2xl">
        {/* Player Badge */}
        <div className="flex items-center gap-2 pr-3 border-r border-stone-700/60">
          <div className="w-8 h-8 rounded-xl bg-blue-600/90 flex items-center justify-center text-amber-200 font-bold border border-blue-400/50 shadow-md">
            P
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-400 font-serif">You</div>
            <div className="text-lg font-bold text-blue-400 font-medieval leading-tight">
              {state.scores.player} <span className="text-xs text-stone-500 font-sans font-normal">pts</span>
            </div>
            {/* Meeples icons */}
            <div className="flex gap-0.5 mt-0.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < state.followerSupply.player ? 'bg-blue-400 shadow-sm' : 'bg-stone-700/60'
                  }`}
                  title="Player Meeples"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Rival Badge */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-xl bg-rose-700/90 flex items-center justify-center text-amber-200 font-bold border border-rose-500/50 shadow-md">
            R
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-400 font-serif">The Reeve</div>
            <div className="text-lg font-bold text-rose-400 font-medieval leading-tight">
              {state.scores.reeve} <span className="text-xs text-stone-500 font-sans font-normal">pts</span>
            </div>
            {/* Meeples icons */}
            <div className="flex gap-0.5 mt-0.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < state.followerSupply.reeve ? 'bg-rose-400 shadow-sm' : 'bg-stone-700/60'
                  }`}
                  title="Reeve Meeples"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Turn Status & Deck Counter */}
      <div className="pointer-events-auto bg-stone-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-900/50 shadow-2xl flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            isPlayerTurn ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500 animate-spin'
          }`}
        />
        <div className="text-sm font-serif">
          {state.phase === 'GAME_OVER' ? (
            <span className="text-amber-300 font-bold">Realm Chronicle Concluded</span>
          ) : isPlayerTurn ? (
            <span className="text-emerald-300 font-semibold">Your Turn: Place Tile</span>
          ) : (
            <span className="text-amber-300 italic">The Reeve is surveying the realm...</span>
          )}
        </div>
        <div className="border-l border-stone-700/80 pl-3 text-xs text-stone-400">
          <span className="font-bold text-amber-200">{state.deck.length}</span> tiles remaining
        </div>
      </div>

      {/* Right: Camera Views, Zoom Controls & Audio */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-amber-900/50 shadow-2xl">
        {/* Zoom Controls */}
        <button
          onClick={onZoomIn}
          className="p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-stone-800 transition"
          title="Zoom In (or scroll wheel)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-stone-800 transition"
          title="Zoom Out (or scroll wheel)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-stone-700 mx-0.5" />

        {/* Camera Views */}
        <button
          onClick={() => onSelectCamera('iso')}
          className={`p-2 rounded-xl transition ${
            cameraPreset === 'iso' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
          title="Isometric View"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectCamera('top')}
          className={`p-2 rounded-xl transition ${
            cameraPreset === 'top' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
          title="Top-Down Plan View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectCamera('hero')}
          className={`p-2 rounded-xl transition ${
            cameraPreset === 'hero' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
          title="Low Hero Diorama View"
        >
          <Shield className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-stone-700 mx-0.5" />

        {/* Audio Mute */}
        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
        </button>

        {/* Tutorial */}
        <button
          onClick={onOpenTutorial}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
          title="Realm Codex / Rules"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Restart */}
        <button
          onClick={onRestart}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
          title="Restart Game"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
