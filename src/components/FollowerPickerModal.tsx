import React from 'react';
import { Shield, Crosshair, Sparkles, Sprout, X } from 'lucide-react';
import { FollowerOption } from '../engine/board.ts';

interface FollowerPickerModalProps {
  options: FollowerOption[];
  onSelectOption: (featureId: string | null) => void;
}

export const FollowerPickerModal: React.FC<FollowerPickerModalProps> = ({
  options,
  onSelectOption,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-stone-900 border-2 border-amber-800/80 rounded-3xl p-6 shadow-2xl text-stone-100 flex flex-col gap-4">
        {/* Title */}
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-amber-500 font-serif font-bold">
            Heraldic Assignment
          </div>
          <h2 className="text-2xl font-medieval text-amber-200 mt-1">
            Dispatch a Follower?
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Place a wooden meeple onto an unclaimed domain of your new tile to claim its future points.
          </p>
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-2.5 mt-2">
          {options.map((opt) => {
            return (
              <button
                key={opt.featureId}
                onClick={() => onSelectOption(opt.featureId)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-800/90 hover:bg-stone-750 border border-stone-700/80 hover:border-amber-600/70 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center group-hover:border-amber-500/60 transition">
                    {opt.type === 'city' && <Shield className="w-5 h-5 text-blue-400" />}
                    {opt.type === 'road' && <Crosshair className="w-5 h-5 text-amber-400" />}
                    {opt.type === 'monastery' && <Sparkles className="w-5 h-5 text-purple-400" />}
                    {opt.type === 'field' && <Sprout className="w-5 h-5 text-emerald-400" />}
                  </div>

                  <div>
                    <div className="font-medieval text-base text-stone-100 capitalize">
                      {opt.role} ({opt.type})
                    </div>
                    <div className="text-xs text-stone-400">
                      {opt.type === 'city' && '2 pts per tile + 2 pts per shield on completion'}
                      {opt.type === 'road' && '1 pt per tile when both ends are terminated'}
                      {opt.type === 'monastery' && '9 pts when completely surrounded by 8 tiles'}
                      {opt.type === 'field' && '3 pts per completed city touching farm at game end'}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-serif font-bold text-amber-400 group-hover:translate-x-1 transition">
                  Assign →
                </div>
              </button>
            );
          })}
        </div>

        {/* Skip Button */}
        <button
          onClick={() => onSelectOption(null)}
          className="mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-stone-800/50 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700/50 font-serif text-sm transition"
        >
          <X className="w-4 h-4" />
          <span>Keep Meeple (Skip Follower)</span>
        </button>
      </div>
    </div>
  );
};
