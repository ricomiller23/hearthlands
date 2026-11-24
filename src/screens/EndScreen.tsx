import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Camera } from 'lucide-react';
import { GameState } from '../engine/types.ts';
import { soundManager } from '../audio/soundManager.ts';

interface EndScreenProps {
  state: GameState;
  onPlayAgain: () => void;
  onReturnHome: () => void;
  onTogglePhotoMode: () => void;
  isPhotoMode: boolean;
}

export const EndScreen: React.FC<EndScreenProps> = ({
  state,
  onPlayAgain,
  onReturnHome,
  onTogglePhotoMode,
  isPhotoMode,
}) => {
  const isPlayerWin = state.scores.player > state.scores.reeve;
  const isTie = state.scores.player === state.scores.reeve;

  useEffect(() => {
    if (isPlayerWin) {
      soundManager.playVictory();
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#3b82f6', '#f59e0b', '#10b981'],
        });
      } catch (err) {
        console.warn(err);
      }
    }
  }, [isPlayerWin]);

  if (isPhotoMode) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button
          onClick={onTogglePhotoMode}
          className="px-6 py-3 rounded-2xl bg-stone-900/90 text-amber-300 border border-amber-600/70 font-serif text-sm shadow-2xl backdrop-blur-md flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>Exit Photo Mode</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto select-none">
      <div className="w-full max-w-md bg-stone-900/95 border-2 border-amber-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 flex flex-col items-center text-center gap-5">
        {/* Heraldic Crest / Trophy */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border-2 ${
            isPlayerWin
              ? 'bg-blue-600/30 border-blue-400 text-amber-300'
              : isTie
              ? 'bg-stone-800 border-amber-500 text-amber-300'
              : 'bg-rose-900/30 border-rose-500 text-rose-300'
          }`}
        >
          <Trophy className="w-8 h-8" />
        </div>

        {/* Title */}
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-500 font-serif font-bold">
            Realm Chronicle Concluded
          </div>
          <h2 className="text-3xl font-medieval text-amber-200 mt-1">
            {isPlayerWin
              ? 'Victory for Your Realm!'
              : isTie
              ? 'A Divided Realm (Tie)'
              : 'The Reeve Has Prevailed'}
          </h2>
        </div>

        {/* Score Tally Board */}
        <div className="w-full flex rounded-2xl bg-stone-950/80 p-4 border border-stone-800 justify-around items-center">
          {/* Player Score */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-serif text-stone-400 uppercase tracking-wider">Your Score</span>
            <span className="text-3xl font-bold font-medieval text-blue-400">
              {state.scores.player}
            </span>
            <span className="text-[11px] text-stone-500 font-sans">Points</span>
          </div>

          <div className="text-stone-700 font-medieval text-xl">VS</div>

          {/* Reeve Score */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-serif text-stone-400 uppercase tracking-wider">The Reeve</span>
            <span className="text-3xl font-bold font-medieval text-rose-400">
              {state.scores.reeve}
            </span>
            <span className="text-[11px] text-stone-500 font-sans">Points</span>
          </div>
        </div>

        {/* Realm Stats Summary */}
        <div className="w-full text-left bg-stone-800/40 border border-stone-800/80 p-3.5 rounded-2xl flex flex-col gap-1 text-xs text-stone-300">
          <div className="flex justify-between">
            <span className="text-stone-400">Total Realm Tiles Placed:</span>
            <span className="font-bold text-amber-200">{state.board.size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Completed Fortress Cities:</span>
            <span className="font-bold text-amber-200">{state.completedCityKeys.size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Opponent Temperament:</span>
            <span className="font-bold text-amber-200 capitalize">{state.difficulty}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2 pt-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-serif font-bold text-sm shadow-xl border border-amber-400/50 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onTogglePhotoMode}
              className="flex-1 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 border border-stone-700 font-serif text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Orbit Photo Mode</span>
            </button>
            <button
              onClick={onReturnHome}
              className="flex-1 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 border border-stone-700 font-serif text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Title Realm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
