import React, { useEffect } from 'react';
import { GameStats, Subject } from '../types/game';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Star, Target, CheckCircle2, Clock } from 'lucide-react';

interface VictoryModalProps {
  stats: GameStats;
  subject: Subject;
  onRestart: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  subject,
  onRestart,
  onHome
}) => {
  useEffect(() => {
    // Fire celebratory confetti!
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-neutral-900 border-2 border-amber-500 rounded-2xl max-w-lg w-full p-6 text-center space-y-6 shadow-[0_0_80px_rgba(245,158,11,0.35)] relative overflow-hidden">
        {/* Victory Badge Crest */}
        <div className="relative mx-auto w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/20">
          <img 
            src="/src/assets/images/contra_victory_badge_1790563075720.jpg" 
            alt="Victory Medal" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>CHIẾN THẮNG HUY HOÀNG</span>
          </div>
          <h2 className="font-arcade text-xl sm:text-2xl text-white tracking-wider">
            MISSION ACCOMPLISHED!
          </h2>
          <p className="text-neutral-300 text-xs mt-1">
            Bạn đã xuất sắc vượt qua toàn bộ cổng phong ấn chủ đề <strong className="text-amber-400">{subject.name}</strong> và tiêu diệt căn cứ địch!
          </p>
        </div>

        {/* Detailed Stats Cards */}
        <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-left">
          <div className="space-y-0.5">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>TỔNG ĐIỂM SỐ</span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-red-400" />
              <span>KẺ ĐỊCH TIÊU DIỆT</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats.enemiesKilled}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ĐÚNG NGAY LẦN 1</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {stats.firstTryCorrect} / {stats.questionsAnswered}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>THỜI GIAN VƯỢT ẢI</span>
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
              {formatTime(stats.timeElapsed)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CHƠI LẠI MÀN NÀY</span>
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 border border-neutral-700 cursor-pointer active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>CHỌN CHỦ ĐỀ KHÁC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
