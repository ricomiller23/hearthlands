import React from 'react';
import { RotateCw, Check, AlertCircle } from 'lucide-react';
import { Rotation } from '../engine/types.ts';
import { TILE_MAP } from '../engine/tiles.ts';

interface TileDrawTrayProps {
  currentTile: string | null;
  rotation: Rotation;
  selectedCoord: { x: number; y: number } | null;
  isLegalSelection: boolean;
  onRotate: () => void;
  onConfirmPlacement: () => void;
  disabled: boolean;
}

export const TileDrawTray: React.FC<TileDrawTrayProps> = ({
  currentTile,
  rotation,
  selectedCoord,
  isLegalSelection,
  onRotate,
  onConfirmPlacement,
  disabled,
}) => {
  if (!currentTile) return null;

  const tileDef = TILE_MAP.get(currentTile);
  const rotDeg = rotation * 90;

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="bg-stone-900/90 backdrop-blur-md px-5 py-4 rounded-3xl border border-amber-900/50 shadow-2xl flex flex-col sm:flex-row items-center gap-4">
        {/* Drawn Tile Preview Card */}
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-2xl bg-stone-950 border-2 border-amber-700/60 flex items-center justify-center shadow-inner overflow-hidden">
            {/* Compass degree indicator */}
            <div
              className="text-xs font-bold text-amber-300 transition-transform duration-200"
              style={{ transform: `rotate(${rotDeg}deg)` }}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-600/50 flex items-center justify-center">
                <span className="text-sm font-medieval">{currentTile}</span>
              </div>
            </div>
            <div className="absolute bottom-0.5 right-1 text-[9px] text-stone-500 font-mono">
              {rotDeg}°
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-amber-500 font-serif font-bold">
              Current Drawn Tile
            </div>
            <div className="text-sm font-medium text-stone-200">
              Type {currentTile} ({tileDef?.features.map((f) => f.type).join(', ')})
            </div>
            <div className="text-xs text-stone-400">
              {selectedCoord
                ? `Selected Target: (${selectedCoord.x}, ${selectedCoord.y})`
                : 'Click any blue rune pad on table'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Rotate Button */}
          <button
            onClick={onRotate}
            disabled={disabled}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 font-serif text-sm transition active:scale-95 disabled:opacity-50"
            title="Rotate tile 90 degrees clockwise (Hotkey: R)"
          >
            <RotateCw className="w-4 h-4 text-amber-400" />
            <span>Rotate (R)</span>
          </button>

          {/* Confirm Placement Button */}
          <button
            onClick={onConfirmPlacement}
            disabled={disabled || !selectedCoord || !isLegalSelection}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-serif text-sm font-bold shadow-lg transition active:scale-95 ${
              isLegalSelection
                ? 'bg-amber-600 hover:bg-amber-500 text-amber-950 border border-amber-400 shadow-amber-900/40'
                : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
            }`}
          >
            {isLegalSelection ? (
              <>
                <Check className="w-4 h-4" />
                <span>Place Tile</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Select Space</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
