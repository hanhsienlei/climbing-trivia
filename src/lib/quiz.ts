import type { Question } from "@/types";

export const QUIZ_SIZE = 10;
export const STORAGE_KEY_SEEN_IDS = "seenQuestionIds";
export const STORAGE_KEY_RESULT = "quizResult";

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getSeenIds(): number[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY_SEEN_IDS);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY_SEEN_IDS);
    return [];
  }
}

export function saveSeenIds(ids: number[]) {
  localStorage.setItem(STORAGE_KEY_SEEN_IDS, JSON.stringify(ids));
}

export function selectQuestions(pool: Question[], quizSize: number): Question[] {
  const poolIds = new Set(pool.map((q) => q.id));
  const persistedSeenIds = getSeenIds().filter((id) => poolIds.has(id));
  const seenIds = new Set(persistedSeenIds);
  let fresh = pool.filter((q) => !seenIds.has(q.id));

  if (fresh.length < quizSize) {
    persistedSeenIds.length = 0;
    fresh = pool;
  }

  const selected = shuffleArray(fresh).slice(0, quizSize);
  const maxSeenIds = poolIds.size;
  const mergedSeenIds = [...new Set([...persistedSeenIds, ...selected.map((q) => q.id)])];
  const cappedSeenIds = mergedSeenIds.slice(Math.max(0, mergedSeenIds.length - maxSeenIds));
  saveSeenIds(cappedSeenIds);

  return selected;
}
