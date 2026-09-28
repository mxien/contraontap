import React from 'react';
import { GameStats } from '../types/game';
import { RotateCcw, Home, Skull, ShieldAlert } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onHome
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-neutral-900 border-2 border-red-600 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-[0_0_60px_rgba(220,38,38,0.3)]">
        {/* Skull Icon Header */}
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-600 flex items-center justify-center mx-auto text-red-500 animate-pulse">
          <Skull className="w-8 h-8" />
        </div>

        <div>
          <h2 className="font-arcade text-xl sm:text-2xl text-red-500 tracking-wider">
            MISSION FAILED
          </h2>
          <p className="text-neutral-400 text-xs mt-1">
            Chiến binh Contra đã hy sinh trong khi đang làm nhiệm vụ ôn tập kiến thức.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 bg-neutral-950/80 p-4 rounded-xl border border-neutral-800 text-left">
          <div>
            <div className="text-[11px] text-neutral-500 uppercase font-mono">Tổng Điểm</div>
            <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-500 uppercase font-mono">Quái Tiêu Diệt</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {stats.enemiesKilled}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-500 uppercase font-mono">Cổng Đã Vượt</div>
            <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
              {stats.questionsAnswered}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-500 uppercase font-mono">Thời Gian</div>
            <div className="text-xl font-bold font-mono text-neutral-300 tabular-nums">
              {formatTime(stats.timeElapsed)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TÁI ĐẤU NGAY</span>
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 border border-neutral-700 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>VỀ MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
