import React, { useState } from 'react';
import { SubjectId, GameDifficulty } from '../types/game';
import { SUBJECTS } from '../data/defaultQuestions';
import { QuestionStore } from '../services/questionStore';
import { 
  Play, Settings, Shield, Zap, Sparkles, Crosshair, 
  Volume2, VolumeX, BookOpen, Flame
} from 'lucide-react';
import { sound } from '../services/soundService';

interface SubjectSelectMenuProps {
  onStartGame: (subjectId: SubjectId, difficulty: GameDifficulty) => void;
  onOpenQuestionManager: () => void;
}

export const SubjectSelectMenu: React.FC<SubjectSelectMenuProps> = ({
  onStartGame,
  onOpenQuestionManager
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('hoa_hoc');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const currentQuestions = QuestionStore.getBySubject(selectedSubject);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Background Graphic Ambient Glow */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center mix-blend-screen"
        style={{ backgroundImage: `url('/src/assets/images/contra_jungle_battle_1790563062141.jpg')` }}
      />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-neutral-950/80 to-neutral-950 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-500/50 shadow-sm shrink-0">
            <img 
              src="/src/assets/images/contra_hero_soldier_1790563046683.jpg" 
              alt="Contra Commando" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-arcade text-xs md:text-sm tracking-widest text-amber-400">
              CONTRA
            </span>
            <span className="text-neutral-400 text-xs ml-2 hidden sm:inline">
              Ôn Tập Kiến Thức
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition border border-neutral-800 cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onOpenQuestionManager}
            className="flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg transition shadow-sm cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Quản Lý Câu Hỏi</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Subject Selection */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 md:px-8 py-6 md:py-8 flex-1 flex flex-col justify-center gap-8">
        {/* Title Presentation */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>GAME HÀNH ĐỘNG ARCADE BẮN SÚNG & TRẮC NGHIỆM ĐA MÔN HỌC</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
            CONTRA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">ÔN TẬP KIẾN THỨC</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Vào vai chiến binh Contra xông pha căn cứ địch, bắn phá rào cản và giải quyết các câu hỏi trắc nghiệm hóc búa để mở khóa cổng phong ấn!
          </p>
        </div>

        {/* Step 1: Pick Subject */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs md:text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2 font-mono">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-bold">1</span>
              <span>Chọn Chủ Đề Ôn Tập:</span>
            </h2>
            <span className="text-xs text-neutral-400">
              Đang chọn: <strong className="text-white">{SUBJECTS.find(s => s.id === selectedSubject)?.name}</strong> ({currentQuestions.length} câu)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {SUBJECTS.map((sub) => {
              const qCount = QuestionStore.getBySubject(sub.id).length;
              const isSelected = selectedSubject === sub.id;

              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-800 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{sub.icon}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-950 text-neutral-400'
                    }`}>
                      {qCount} CÂU
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                      {sub.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5 leading-tight">
                      {sub.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Difficulty & Start CTA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6">
          {/* Difficulty selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-bold">2</span>
              <span>Cấp Độ Chiến Dịch:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => {
                const isDiff = difficulty === diff;
                const label = diff === 'easy' ? 'Dễ' : diff === 'medium' ? 'Vừa' : 'Khó';
                const subtext = diff === 'easy' ? 'Địch bắn chậm' : diff === 'medium' ? 'Cân bằng' : 'Cực thử thách';
                return (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-2 text-center rounded-lg border transition cursor-pointer ${
                      isDiff
                        ? 'bg-white text-neutral-950 font-bold border-white shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <div className="text-xs font-bold uppercase">{label}</div>
                    <div className="text-[10px] opacity-75 font-normal truncate">{subtext}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick info about items */}
          <div className="text-xs space-y-1.5 text-neutral-400 border-l md:border-r border-neutral-800 md:px-4 py-2">
            <div className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tiếp tế chiến trường:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono font-bold">🍄 Nấm:</span>
              <span>Hồi 100% Máu & Mana</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-400 font-mono font-bold">🔴 Súng S:</span>
              <span>Bắn chùm 3 tia đạn rộng</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono font-bold">⚡ Súng L:</span>
              <span>Tia Laser xuyên thấu toàn bộ địch</span>
            </div>
          </div>

          {/* Big Start Button */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onStartGame(selectedSubject, difficulty)}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-neutral-950 font-black text-lg md:text-xl rounded-xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current text-neutral-950" />
              <span>BẮT ĐẦU VƯỢT ẢI</span>
            </button>
            <p className="text-center text-[11px] text-neutral-500">
              Chủ đề: <span className="text-neutral-300 font-medium">{SUBJECTS.find(s => s.id === selectedSubject)?.name}</span> · {currentQuestions.length} câu hỏi sẵn sàng
            </p>
          </div>
        </div>

        {/* Controls Instructions Card */}
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-4">
          <div className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span>Phím Tắt Điều Khiển Contra (Hỗ trợ bàn phím máy tính & Cảm ứng):</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="font-mono font-bold text-amber-400 text-sm">A / D · ← / →</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Chạy trái / phải</div>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="font-mono font-bold text-amber-400 text-sm">W / Space · ↑</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Nhảy lên bậc địa hình</div>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="font-mono font-bold text-amber-400 text-sm">S / ↓</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Cúi người né đạn địch</div>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="font-mono font-bold text-amber-400 text-sm">Phím J / Chuột</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Bắn đạn thẳng / chéo</div>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/5">
              <div className="font-mono font-bold text-amber-300 text-sm">Phím A, B, C, D</div>
              <div className="text-amber-200/80 text-[11px] mt-0.5">Bấm trả lời trắc nghiệm</div>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="font-mono font-bold text-cyan-400 text-sm">Phím K</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Khiên Hộ Thể (30 Mana)</div>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="font-mono font-bold text-yellow-400 text-sm">Cổng Phong Ấn</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Dừng game & giải đố</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-800/80 bg-neutral-950 py-3 px-4 text-center text-xs text-neutral-500">
        <span>Trò chơi giáo dục tích hợp tư duy phản xạ & ôn tập kiến thức</span>
      </footer>
    </div>
  );
};
