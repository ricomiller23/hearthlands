import React from 'react';
import { X, Shield, Crosshair, Sparkles, Sprout, Castle } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-stone-900 border-2 border-amber-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-stone-800 pb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-500 font-serif font-bold">
              Codex of Hearthlands
            </div>
            <h2 className="text-2xl sm:text-3xl font-medieval text-amber-200 mt-1">
              Rules of Domain & Heraldry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cities */}
          <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-400 font-medieval text-lg">
              <Shield className="w-5 h-5" />
              <span>Cities & Knights</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Enclose fortress walls so no open city gates remain. A closed city awards{' '}
              <strong className="text-amber-300">2 points per tile</strong> plus{' '}
              <strong className="text-amber-300">2 points per shield</strong>. At game end, unclosed cities award 1 pt per tile & shield.
            </p>
          </div>

          {/* Roads */}
          <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-medieval text-lg">
              <Crosshair className="w-5 h-5" />
              <span>Roads & Thieves</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Connect pathways between city gates, crossroads, or monasteries. A completed road terminates at both ends and awards{' '}
              <strong className="text-amber-300">1 point per tile</strong>.
            </p>
          </div>

          {/* Monasteries */}
          <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-400 font-medieval text-lg">
              <Sparkles className="w-5 h-5" />
              <span>Monasteries & Monks</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              A secluded cloister requires serene contemplation. When all{' '}
              <strong className="text-amber-300">8 surrounding tiles</strong> are laid around the abbey, it completes for{' '}
              <strong className="text-amber-300">9 points</strong>.
            </p>
          </div>

          {/* Fields */}
          <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-medieval text-lg">
              <Sprout className="w-5 h-5" />
              <span>Farms & Farmers</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Farmers recline in the grassy meadows throughout the game. At final reckoning, each farmer supplies nearby completed cities, scoring{' '}
              <strong className="text-amber-300">3 points per unique completed city</strong> bordering their meadow.
            </p>
          </div>
        </div>

        {/* Strategic Tips */}
        <div className="bg-amber-950/30 border border-amber-800/40 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-300 font-medieval text-sm font-bold mb-1">
            <Castle className="w-4 h-4" />
            <span>The Reeve’s Tactics</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            The Reeve will aggressively claim monasteries and attempt to out-compete or block your cities. Preserve at least one meeple in reserve for timely opportunities!
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-amber-950 font-serif font-bold text-sm shadow-lg transition active:scale-95"
        >
          Return to the Realm
        </button>
      </div>
    </div>
  );
};
