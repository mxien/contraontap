import React, { useState, useEffect } from 'react';
import { Question, SubjectId } from '../types/game';
import { SUBJECTS } from '../data/defaultQuestions';
import { QuestionStore } from '../services/questionStore';
import { 
  Plus, Edit3, Trash2, RotateCcw, Search, CheckCircle2, 
  HelpCircle, X, AlertTriangle, ArrowLeft 
} from 'lucide-react';

interface QuestionManagerProps {
  onBack: () => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form inputs
  const [formSubject, setFormSubject] = useState<SubjectId>('hoa_hoc');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formHint, setFormHint] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formError, setFormError] = useState('');

  const reloadQuestions = () => {
    const list = QuestionStore.getAll();
    setQuestions(list);
  };

  useEffect(() => {
    reloadQuestions();
  }, []);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormSubject(selectedSubject !== 'ALL' ? selectedSubject : 'hoa_hoc');
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormHint('');
    setFormDifficulty('medium');
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormSubject(q.subjectId);
    setFormQuestion(q.question);
    setFormOptions([...q.options] as [string, string, string, string]);
    setFormCorrectIndex(q.correctIndex);
    setFormHint(q.hint || '');
    setFormDifficulty(q.difficulty || 'medium');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      setFormError('Vui lòng nhập nội dung câu hỏi!');
      return;
    }
    if (formOptions.some(opt => !opt.trim())) {
      setFormError('Vui lòng nhập đầy đủ cả 4 phương án A, B, C, D!');
      return;
    }
    if (!formHint.trim()) {
      setFormError('Vui lòng nhập gợi ý hỗ trợ học sinh khi trả lời sai!');
      return;
    }

    if (editingQuestion) {
      QuestionStore.update({
        id: editingQuestion.id,
        subjectId: formSubject,
        question: formQuestion.trim(),
        options: [formOptions[0].trim(), formOptions[1].trim(), formOptions[2].trim(), formOptions[3].trim()],
        correctIndex: formCorrectIndex,
        hint: formHint.trim(),
        difficulty: formDifficulty
      });
    } else {
      QuestionStore.add({
        subjectId: formSubject,
        question: formQuestion.trim(),
        options: [formOptions[0].trim(), formOptions[1].trim(), formOptions[2].trim(), formOptions[3].trim()],
        correctIndex: formCorrectIndex,
        hint: formHint.trim(),
        difficulty: formDifficulty
      });
    }

    setIsFormOpen(false);
    reloadQuestions();
  };

  const handleDelete = (id: string) => {
    QuestionStore.delete(id);
    setDeleteConfirmId(null);
    reloadQuestions();
  };

  const handleResetDefaults = () => {
    QuestionStore.resetToDefaults();
    setShowResetConfirm(false);
    reloadQuestions();
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSubject = selectedSubject === 'ALL' || q.subjectId === selectedSubject;
    const matchesSearch = !searchQuery.trim() || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans pb-16">
      {/* Top Bar Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Menu</span>
          </button>
          <div className="h-6 w-px bg-neutral-800 hidden sm:block" />
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-amber-400 font-mono">CONTRA</span>
            <span className="text-neutral-400 font-normal">|</span>
            <span>Quản Lý Ngân Hàng Câu Hỏi</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Khôi phục lại dữ liệu câu hỏi mẫu ban đầu"
            className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 rounded-lg transition border border-neutral-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khôi phục gốc</span>
          </button>
          
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg shadow-md hover:shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Câu Hỏi Mới</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-8 pt-6 flex-1 flex flex-col gap-6">
        {/* Subject Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/80">
          {/* Subject Pills / Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            <button
              onClick={() => setSelectedSubject('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                selectedSubject === 'ALL'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              Tất cả ({questions.length})
            </button>
            {SUBJECTS.map((sub) => {
              const count = questions.filter(q => q.subjectId === sub.id).length;
              const isActive = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-neutral-950 font-bold shadow-sm'
                      : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.name}</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded ${isActive ? 'bg-neutral-200 text-neutral-900 font-mono' : 'bg-neutral-900 text-neutral-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nội dung câu hỏi..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/80 transition"
            />
          </div>
        </div>

        {/* Questions List Display */}
        {filteredQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-neutral-900/30 rounded-xl border border-dashed border-neutral-800 my-8">
            <HelpCircle className="w-12 h-12 text-neutral-600 mb-3" />
            <p className="text-neutral-300 font-medium">Chưa có câu hỏi nào phù hợp với bộ lọc!</p>
            <p className="text-neutral-500 text-sm mt-1 mb-4">Hãy bấm nút "Thêm Câu Hỏi Mới" để tạo câu hỏi thử thách cho nhân vật Contra.</p>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm câu hỏi ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q, idx) => {
              const subObj = SUBJECTS.find(s => s.id === q.subjectId);
              return (
                <div
                  key={q.id}
                  className="bg-neutral-900/70 border border-neutral-800/90 rounded-xl p-5 hover:border-neutral-700 transition flex flex-col md:flex-row gap-4 justify-between items-start"
                >
                  <div className="flex-1 space-y-3">
                    {/* Header line with Subject & Difficulty metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-neutral-300 flex items-center gap-1 bg-neutral-800/80 px-2 py-0.5 rounded">
                        <span>{subObj?.icon}</span>
                        <span>{subObj?.name}</span>
                      </span>
                      <span className="text-neutral-500">·</span>
                      <span className={`px-2 py-0.5 rounded uppercase font-mono text-[11px] ${
                        q.difficulty === 'hard' ? 'text-red-400 bg-red-950/40 border border-red-900/50' :
                        q.difficulty === 'medium' ? 'text-amber-400 bg-amber-950/40 border border-amber-900/50' :
                        'text-emerald-400 bg-emerald-950/40 border border-emerald-900/50'
                      }`}>
                        {q.difficulty === 'hard' ? 'Khó' : q.difficulty === 'medium' ? 'Trung Bình' : 'Dễ'}
                      </span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-neutral-500 font-mono">#{idx + 1}</span>
                    </div>

                    {/* Question text */}
                    <h3 className="text-base md:text-lg font-semibold text-white leading-relaxed">
                      {q.question}
                    </h3>

                    {/* 4 Choices Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctIndex;
                        const letter = ['A', 'B', 'C', 'D'][optIdx];
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg text-sm transition ${
                              isCorrect
                                ? 'bg-emerald-950/30 border border-emerald-500/50 text-emerald-200'
                                : 'bg-neutral-950/60 border border-neutral-800/80 text-neutral-400'
                            }`}
                          >
                            <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-xs ${
                              isCorrect ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {letter}
                            </span>
                            <span className="flex-1 leading-snug">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Hint section */}
                    {q.hint && (
                      <div className="text-xs text-amber-300/90 bg-amber-950/20 border border-amber-900/40 px-3 py-2 rounded-lg flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-400">Gợi ý khi giải sai: </strong>
                          <span>{q.hint}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex md:flex-col items-center gap-2 self-end md:self-start shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() => openEditModal(q)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(q.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE / EDIT QUESTION MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <span className="text-amber-400">{editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}</span>
            </h2>
            <p className="text-neutral-400 text-xs mb-5">
              Câu hỏi này sẽ xuất hiện tại các Cổng phong ấn trong trò chơi để thách thức phản xạ và kiến thức của người chơi.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-700/80 rounded-lg text-red-300 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Subject & Difficulty Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Chủ Đề Kiến Thức *
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value as SubjectId)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Mức Độ Khó *
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="easy">Dễ (Kiến thức cơ bản)</option>
                    <option value="medium">Trung Bình (Vận dụng)</option>
                    <option value="hard">Khó (Vận dụng cao & chuyên sâu)</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nội Dung Câu Hỏi *
                </label>
                <textarea
                  rows={3}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Ví dụ: Đỉnh núi nào cao nhất Việt Nam được mệnh danh là nóc nhà Đông Dương?"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* 4 Options and pick correct radio */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  4 Phương Án Trả Lời (Đánh dấu vào phương án ĐÚNG) *
                </label>
                <div className="space-y-2">
                  {(['A', 'B', 'C', 'D'] as const).map((letter, optIdx) => (
                    <div
                      key={letter}
                      className={`flex items-center gap-3 p-2 rounded-lg border transition ${
                        formCorrectIndex === optIdx
                          ? 'bg-emerald-950/30 border-emerald-500/80'
                          : 'bg-neutral-950 border-neutral-800'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={formCorrectIndex === optIdx}
                          onChange={() => setFormCorrectIndex(optIdx)}
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        />
                        <span className={`font-mono font-bold text-xs px-2 py-1 rounded ${
                          formCorrectIndex === optIdx
                            ? 'bg-emerald-500 text-neutral-950'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}>
                          {letter}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formOptions[optIdx]}
                        onChange={(e) => {
                          const updated = [...formOptions] as [string, string, string, string];
                          updated[optIdx] = e.target.value;
                          setFormOptions(updated);
                        }}
                        placeholder={`Nhập nội dung phương án ${letter}...`}
                        className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none placeholder:text-neutral-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Hint input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Gợi Ý Giải Thích (Xuất hiện khi trả lời sai) *
                </label>
                <input
                  type="text"
                  value={formHint}
                  onChange={(e) => setFormHint(e.target.value)}
                  placeholder="Ví dụ: Đỉnh núi thuộc dãy Hoàng Liên Sơn, tỉnh Lào Cai với độ cao 3.143m."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg shadow-md transition cursor-pointer"
                >
                  {editingQuestion ? 'Cập Nhật Câu Hỏi' : 'Lưu Câu Hỏi Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-700/60 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Xác nhận xóa câu hỏi?</h3>
            <p className="text-sm text-neutral-400">
              Bạn có chắc chắn muốn xóa câu hỏi này khỏi danh sách ôn tập? Hành động này sẽ được lưu ngay vào trình duyệt.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-md transition cursor-pointer"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET DEFAULTS MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-700/60 flex items-center justify-center mx-auto text-amber-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Khôi phục ngân hàng câu hỏi gốc?</h3>
            <p className="text-sm text-neutral-400">
              Toàn bộ danh sách câu hỏi hiện tại sẽ được thay thế bằng ngân hàng câu hỏi chuẩn đầy đủ 7 môn học ban đầu.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg shadow-md transition cursor-pointer"
              >
                Khôi phục ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
