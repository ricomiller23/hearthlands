import React, { useState } from 'react';
import { Castle, Shield, Sparkles, BookOpen, Play } from 'lucide-react';
import { AIDifficulty, GameMode } from '../engine/types.ts';

interface TitleScreenProps {
  onStartGame: (difficulty: AIDifficulty, mode: GameMode, seed?: number) => void;
  onOpenTutorial: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenTutorial,
}) => {
  const [difficulty, setDifficulty] = useState<AIDifficulty>('knight');
  const [mode, setMode] = useState<GameMode>('rival');

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#130f0c] text-stone-100 p-4 overflow-hidden select-none">
      {/* Background Medieval Vignette & Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-amber-950/20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Parchment Box */}
      <div className="relative z-10 w-full max-w-xl bg-stone-900/90 border-2 border-amber-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md flex flex-col items-center text-center gap-6">
        {/* Heraldic Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border-2 border-amber-600/70 flex items-center justify-center text-amber-400 shadow-xl">
          <Castle className="w-8 h-8" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-medieval text-amber-200 tracking-wide drop-shadow-md">
            HEARTHLANDS
          </h1>
          <p className="text-xs sm:text-sm font-serif uppercase tracking-widest text-amber-500/90 mt-1 font-semibold">
            Solo & AI Medieval Tile-Laying Diorama
          </p>
        </div>

        {/* Mode Selector */}
        <div className="w-full flex rounded-2xl bg-stone-950/80 p-1.5 border border-stone-800">
          <button
            onClick={() => setMode('rival')}
            className={`flex-1 py-2.5 rounded-xl font-serif text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
              mode === 'rival'
                ? 'bg-amber-700/80 text-amber-100 border border-amber-500/60 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Rival Mode (vs The Reeve)</span>
          </button>
          <button
            onClick={() => setMode('chronicle')}
            className={`flex-1 py-2.5 rounded-xl font-serif text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
              mode === 'chronicle'
                ? 'bg-amber-700/80 text-amber-100 border border-amber-500/60 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Chronicle Mode</span>
          </button>
        </div>

        {/* AI Difficulty Selector */}
        <div className="w-full text-left">
          <div className="text-xs font-serif uppercase tracking-wider text-stone-400 mb-2 font-bold">
            The Reeve’s Skill & Temperament:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'squire', label: 'Squire', desc: 'Gentle' },
              { id: 'knight', label: 'Knight', desc: 'Balanced' },
              { id: 'baron', label: 'Baron', desc: 'Cunning' },
              { id: 'reeve_lord', label: 'Reeve-Lord', desc: 'Master' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setDifficulty(item.id as AIDifficulty)}
                className={`p-3 rounded-2xl border text-center transition ${
                  difficulty === item.id
                    ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow-md'
                    : 'bg-stone-800/40 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <div className="font-medieval text-sm">{item.label}</div>
                <div className="text-[10px] text-stone-400 font-serif">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onStartGame(difficulty, mode)}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-serif font-bold text-base shadow-xl border border-amber-400/50 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Enter the Realm</span>
          </button>

          <button
            onClick={onOpenTutorial}
            className="px-5 py-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700 font-serif text-sm flex items-center justify-center gap-2 transition active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Codex / Rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};
