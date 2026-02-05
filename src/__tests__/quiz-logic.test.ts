import { describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Helper functions (same as in quiz/page.tsx)
function getSeenIds(): number[] {
  const stored = localStorage.getItem("seenQuestionIds");
  return stored ? JSON.parse(stored) : [];
}

function saveSeenIds(ids: number[]) {
  localStorage.setItem("seenQuestionIds", JSON.stringify(ids));
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface Question {
  id: number;
  question: string;
}

function selectQuizQuestions(allQuestions: Question[], quizSize: number): Question[] {
  const seenIds = new Set(getSeenIds());
  let fresh = allQuestions.filter((q) => !seenIds.has(q.id));

  // If not enough fresh questions, reset and use all
  if (fresh.length < quizSize) {
    saveSeenIds([]);
    fresh = allQuestions;
  }

  const selected = shuffleArray(fresh).slice(0, quizSize);

  // Add selected to seen list
  const newSeenIds = [...getSeenIds(), ...selected.map((q) => q.id)];
  saveSeenIds(newSeenIds);

  return selected;
}

describe("Quiz question selection", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should not repeat questions until all have been seen", () => {
    const questions: Question[] = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}`,
    }));
    const quizSize = 5;

    const allSeenIds = new Set<number>();

    // First 4 quizzes should have no repeats (4 * 5 = 20 questions)
    for (let quiz = 0; quiz < 4; quiz++) {
      const selected = selectQuizQuestions(questions, quizSize);

      expect(selected).toHaveLength(quizSize);

      for (const q of selected) {
        expect(allSeenIds.has(q.id)).toBe(false);
        allSeenIds.add(q.id);
      }
    }

    // All 20 questions should have been seen
    expect(allSeenIds.size).toBe(20);
  });

  it("should reset when not enough fresh questions remain", () => {
    const questions: Question[] = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}`,
    }));
    const quizSize = 5;

    // First quiz: 5 questions seen
    const quiz1 = selectQuizQuestions(questions, quizSize);
    expect(quiz1).toHaveLength(5);

    // Second quiz: 5 more questions seen (10 total)
    const quiz2 = selectQuizQuestions(questions, quizSize);
    expect(quiz2).toHaveLength(5);

    // Verify no overlap between quiz 1 and 2
    const quiz1Ids = new Set(quiz1.map((q) => q.id));
    const quiz2Ids = new Set(quiz2.map((q) => q.id));
    for (const id of quiz2Ids) {
      expect(quiz1Ids.has(id)).toBe(false);
    }

    // Third quiz: only 2 fresh questions remain, should reset
    const quiz3 = selectQuizQuestions(questions, quizSize);
    expect(quiz3).toHaveLength(5);

    // seenIds should now only have quiz3's questions (reset happened)
    const seenAfterReset = getSeenIds();
    expect(seenAfterReset).toHaveLength(5);
  });

  it("should return all questions when pool is smaller than quiz size", () => {
    const questions: Question[] = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}`,
    }));
    const quizSize = 5;

    const selected = selectQuizQuestions(questions, quizSize);
    expect(selected).toHaveLength(3);
  });

  it("shuffleArray should not produce duplicates", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(original);

    expect(shuffled).toHaveLength(original.length);
    expect(new Set(shuffled).size).toBe(original.length);
    expect(shuffled.sort((a, b) => a - b)).toEqual(original);
  });
});

describe("Quiz result category persistence", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  function saveQuizResult(score: number, total: number, category: string | null) {
    localStorage.setItem(
      "quizResult",
      JSON.stringify({ score, total, category })
    );
  }

  function getQuizResult(): { score: number; total: number; category: string | null } | null {
    const stored = localStorage.getItem("quizResult");
    return stored ? JSON.parse(stored) : null;
  }

  function getPlayAgainUrl(category: string | null): string {
    return category ? `/quiz?category=${encodeURIComponent(category)}` : "/quiz";
  }

  it("should save category with quiz result", () => {
    saveQuizResult(7, 10, "Australia");
    const result = getQuizResult();

    expect(result).not.toBeNull();
    expect(result?.score).toBe(7);
    expect(result?.total).toBe(10);
    expect(result?.category).toBe("Australia");
  });

  it("should save null category for all-categories quiz", () => {
    saveQuizResult(5, 10, null);
    const result = getQuizResult();

    expect(result).not.toBeNull();
    expect(result?.category).toBeNull();
  });

  it("should generate correct play again URL with category", () => {
    const url = getPlayAgainUrl("Bouldering");
    expect(url).toBe("/quiz?category=Bouldering");
  });

  it("should generate correct play again URL without category", () => {
    const url = getPlayAgainUrl(null);
    expect(url).toBe("/quiz");
  });

  it("should encode special characters in category URL", () => {
    const url = getPlayAgainUrl("Competition & Olympics");
    expect(url).toBe("/quiz?category=Competition%20%26%20Olympics");
  });
});
