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

function dedupeAndCapRecent(ids: number[], maxSize: number): number[] {
  const uniqueIds = [...new Set(ids)];
  return uniqueIds.slice(Math.max(0, uniqueIds.length - maxSize));
}

export function selectQuestions(pool: Question[], quizSize: number): Question[] {
  const poolIds = new Set(pool.map((question) => question.id));
  const persistedSeenIds = getSeenIds().filter((id) => poolIds.has(id));
  const seenIdSet = new Set(persistedSeenIds);
  let freshQuestions = pool.filter((question) => !seenIdSet.has(question.id));
  let idsToMerge = persistedSeenIds;

  if (freshQuestions.length < quizSize) {
    idsToMerge = [];
    freshQuestions = pool;
  }

  const selectedQuestions = shuffleArray(freshQuestions).slice(0, quizSize);
  const selectedIds = selectedQuestions.map((question) => question.id);
  const newSeenIds = dedupeAndCapRecent([...idsToMerge, ...selectedIds], poolIds.size);

  saveSeenIds(newSeenIds);

  return selectedQuestions;
}
