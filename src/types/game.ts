export type SubjectId = 'hoa_hoc' | 'sinh_hoc' | 'dia_ly' | 'lich_su' | 'vat_ly' | 'toan_hoc' | 'tieng_anh';

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Question {
  id: string;
  subjectId: SubjectId;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0: A, 1: B, 2: C, 3: D
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type WeaponType = 'NORMAL' | 'SPREAD' | 'LASER';

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export type DayNightPhase = 'DAY' | 'SUNSET' | 'NIGHT';

export interface GameStats {
  score: number;
  enemiesKilled: number;
  questionsAnswered: number;
  firstTryCorrect: number;
  timeElapsed: number; // seconds
}
