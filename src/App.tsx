import React, { useState } from 'react';
import { AIDifficulty, GameMode } from './engine/types.ts';
import { TitleScreen } from './screens/TitleScreen.tsx';
import { GameScreen } from './screens/GameScreen.tsx';
import { TutorialModal } from './components/TutorialModal.tsx';
import { soundManager } from './audio/soundManager.ts';

export const App: React.FC = () => {
  const [inGame, setInGame] = useState(false);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('knight');
  const [mode, setMode] = useState<GameMode>('rival');
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleStartGame = (diff: AIDifficulty, gameMode: GameMode, gameSeed?: number) => {
    setDifficulty(diff);
    setMode(gameMode);
    setSeed(gameSeed || Math.floor(Math.random() * 1000000));
    setInGame(true);
    soundManager.startAmbient();
  };

  const handleReturnHome = () => {
    setInGame(false);
    soundManager.stopAmbient();
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#120f0d] text-stone-100 font-sans select-none">
      {!inGame ? (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenTutorial={() => setShowTutorial(true)}
        />
      ) : (
        <GameScreen
          difficulty={difficulty}
          mode={mode}
          seed={seed}
          onReturnHome={handleReturnHome}
        />
      )}

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );
};

export default App;
