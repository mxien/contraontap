import React, { useState, useEffect, useCallback } from 'react';
import { Question } from '../types/game';
import { sound } from '../services/soundService';
import { AlertCircle, CheckCircle, ShieldAlert, Sparkles, Keyboard } from 'lucide-react';

interface QuizGateModalProps {
  question: Question;
  gateIndex: number;
  totalGates: number;
  onAnswerCorrect: (firstTry: boolean) => void;
}

export const QuizGateModal: React.FC<QuizGateModalProps> = ({
  question,
  gateIndex,
  totalGates,
  onAnswerCorrect
}) => {
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const evaluateAnswer = useCallback((idx: number) => {
    setSelectedOpt(idx);
    if (idx === question.correctIndex) {
      setStatus('correct');
      sound.playQuizCorrect();
      setTimeout(() => {
        onAnswerCorrect(attempts === 0);
      }, 1100);
    } else {
      setStatus('wrong');
      setAttempts(prev => prev + 1);
      sound.playQuizWrong();
    }
  }, [question.correctIndex, attempts, onAnswerCorrect]);

  const handleSelectOption = (idx: number) => {
    if (status === 'correct') return;
    evaluateAnswer(idx);
  };

  const handleConfirm = () => {
    if (selectedOpt === null || status === 'correct') return;
    evaluateAnswer(selectedOpt);
  };

  // Keyboard shortcut listener for keys A, B, C, D and 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if already correct
      if (status === 'correct') return;

      const key = e.key.toLowerCase();
      let targetIndex: number | null = null;

      if (key === 'a' || e.code === 'KeyA' || key === '1' || e.code === 'Digit1') {
        targetIndex = 0;
      } else if (key === 'b' || e.code === 'KeyB' || key === '2' || e.code === 'Digit2') {
        targetIndex = 1;
      } else if (key === 'c' || e.code === 'KeyC' || key === '3' || e.code === 'Digit3') {
        targetIndex = 2;
      } else if (key === 'd' || e.code === 'KeyD' || key === '4' || e.code === 'Digit4') {
        targetIndex = 3;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        e.stopPropagation();
        evaluateAnswer(targetIndex);
      } else if (e.key === 'Enter' || e.code === 'Enter') {
        if (selectedOpt !== null) {
          e.preventDefault();
          e.stopPropagation();
          handleConfirm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Capture phase
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [status, selectedOpt, evaluateAnswer]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border-2 border-amber-500/80 rounded-2xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
        {/* Glow decorative banner */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Seal Gate status & Hotkey reminder */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <span className="font-arcade text-xs text-amber-400 tracking-wider">
                CỔNG PHONG ẤN {gateIndex + 1}/{totalGates}
              </span>
              <p className="text-[11px] text-neutral-400">
                Chiến trường tạm dừng - Bấm phím A, B, C, D hoặc Click chuột!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Phím A - B - C - D</span>
          </div>
        </div>

        {/* Question body */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {question.question}
          </h2>

          {/* 4 Choices */}
          <div className="space-y-2.5">
            {question.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedOpt === idx;
              const isConfirmedWrong = status === 'wrong' && isSelected;
              const isConfirmedCorrect = status === 'correct' && isSelected;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={status === 'correct'}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition cursor-pointer group ${
                    isConfirmedCorrect
                      ? 'bg-emerald-950/60 border-emerald-400 text-emerald-100 shadow-md ring-2 ring-emerald-500/30'
                      : isConfirmedWrong
                      ? 'bg-red-950/60 border-red-500 text-red-100 animate-shake'
                      : isSelected
                      ? 'bg-amber-950/40 border-amber-400 text-white ring-1 ring-amber-400/50'
                      : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 transition ${
                      isConfirmedCorrect
                        ? 'bg-emerald-500 text-neutral-950 scale-105'
                        : isConfirmedWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-amber-400 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700 group-hover:text-white'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-sm font-medium leading-snug flex-1">{opt}</span>
                  </div>

                  {/* Hotkey hint badge */}
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border transition shrink-0 ${
                    isConfirmedCorrect
                      ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-300'
                      : isConfirmedWrong
                      ? 'bg-red-900/60 border-red-500/50 text-red-300'
                      : isSelected
                      ? 'bg-amber-950 border-amber-500/60 text-amber-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-500 group-hover:text-neutral-300 group-hover:border-neutral-700'
                  }`}>
                    Phím [{letter}]
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Hint section */}
          {status === 'wrong' && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 space-y-1.5 animate-in fade-in duration-200">
              <div className="font-bold text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Rất tiếc, đáp án chưa chính xác! Hãy đọc gợi ý và bấm phím chọn lại:</span>
              </div>
              <p className="text-neutral-300 pl-5 leading-relaxed bg-black/30 p-2 rounded-lg border border-red-900/40">
                <strong className="text-amber-400">Gợi ý từ tổng bộ: </strong>
                {question.hint || 'Hãy suy nghĩ cẩn thận và liên hệ kiến thức trọng tâm của chủ đề này.'}
              </p>
            </div>
          )}

          {status === 'correct' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/80 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-emerald-300 text-sm">Chính xác tuyệt đối!</strong>
                <p className="text-emerald-400/90 text-xs">Cổng phong ấn đang nổ tung... Chuẩn bị tiếp tục chiến dịch!</p>
              </div>
            </div>
          )}

          {/* Helpful bottom guide */}
          <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800/80">
            <span className="flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Bấm trực tiếp phím <strong className="text-amber-300 font-mono">A, B, C, D</strong> trên bàn phím để trả lời</span>
            </span>
            {status === 'correct' && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Đang mở cổng...</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
