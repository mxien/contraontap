import React, { useState } from 'react';
import { SubjectId, GameDifficulty } from './types/game';
import { SubjectSelectMenu } from './components/SubjectSelectMenu';
import { QuestionManager } from './components/QuestionManager';
import { GameCanvas } from './game/GameCanvas';

type AppView = 'MENU' | 'QUESTION_MANAGER' | 'GAME';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('MENU');
  const [activeSubject, setActiveSubject] = useState<SubjectId>('hoa_hoc');
  const [activeDifficulty, setActiveDifficulty] = useState<GameDifficulty>('medium');

  const handleStartGame = (subjectId: SubjectId, difficulty: GameDifficulty) => {
    setActiveSubject(subjectId);
    setActiveDifficulty(difficulty);
    setCurrentView('GAME');
  };

  const handleOpenQuestionManager = () => {
    setCurrentView('QUESTION_MANAGER');
  };

  const handleBackToMenu = () => {
    setCurrentView('MENU');
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950">
      {currentView === 'MENU' && (
        <SubjectSelectMenu
          onStartGame={handleStartGame}
          onOpenQuestionManager={handleOpenQuestionManager}
        />
      )}

      {currentView === 'QUESTION_MANAGER' && (
        <QuestionManager
          onBack={handleBackToMenu}
        />
      )}

      {currentView === 'GAME' && (
        <GameCanvas
          subjectId={activeSubject}
          difficulty={activeDifficulty}
          onExit={handleBackToMenu}
        />
      )}
    </div>
  );
}
