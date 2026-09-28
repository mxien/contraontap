import { Question, SubjectId } from '../types/game';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

const STORAGE_KEY = 'CONTRA_QUIZ_QUESTIONS_V1';

export class QuestionStore {
  public static getAll(): Question[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUESTIONS));
        return DEFAULT_QUESTIONS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_QUESTIONS;
    } catch (e) {
      console.error('Failed to load questions from localStorage', e);
      return DEFAULT_QUESTIONS;
    }
  }

  public static getBySubject(subjectId: SubjectId): Question[] {
    const all = this.getAll();
    return all.filter((q) => q.subjectId === subjectId);
  }

  public static add(data: Omit<Question, 'id'>): Question {
    const all = this.getAll();
    const newQuestion: Question = {
      ...data,
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
    };
    all.unshift(newQuestion);
    this.saveAll(all);
    return newQuestion;
  }

  public static update(updated: Question): boolean {
    const all = this.getAll();
    const idx = all.findIndex((q) => q.id === updated.id);
    if (idx !== -1) {
      all[idx] = updated;
      this.saveAll(all);
      return true;
    }
    return false;
  }

  public static delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((q) => q.id !== id);
    if (filtered.length !== all.length) {
      this.saveAll(filtered);
      return true;
    }
    return false;
  }

  public static resetToDefaults(): Question[] {
    this.saveAll(DEFAULT_QUESTIONS);
    return DEFAULT_QUESTIONS;
  }

  public static saveAll(questions: Question[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (e) {
      console.error('Failed to save questions to localStorage', e);
    }
  }
}
