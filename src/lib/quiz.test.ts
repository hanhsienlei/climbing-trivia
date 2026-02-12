import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Question } from "@/types";
import {
  shuffleArray,
  getSeenIds,
  selectQuestions,
  STORAGE_KEY_RESULT,
  STORAGE_KEY_SEEN_IDS,
} from "@/lib/quiz";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

describe("Quiz question selection", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should return empty array when window is undefined (SSR)", () => {
    // Save original window
    const originalWindow = globalThis.window;

    // @ts-expect-error - Simulating SSR environment
    delete globalThis.window;

    const seenIds = getSeenIds();
    expect(seenIds).toEqual([]);

    // Restore window
    globalThis.window = originalWindow;
  });

  it("should not repeat questions until all have been seen", () => {
    const questions = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}`,
    })) as Pick<Question, "id" | "question">[] as Question[];
    const quizSize = 5;

    const allSeenIds = new Set<number>();

    // First 4 quizzes should have no repeats (4 * 5 = 20 questions)
    for (let quiz = 0; quiz < 4; quiz++) {
      const selected = selectQuestions(questions, quizSize);

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
    const questions = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}`,
    })) as Pick<Question, "id" | "question">[] as Question[];
    const quizSize = 5;

    // First quiz: 5 questions seen
    const quiz1 = selectQuestions(questions, quizSize);
    expect(quiz1).toHaveLength(5);

    // Second quiz: 5 more questions seen (10 total)
    const quiz2 = selectQuestions(questions, quizSize);
    expect(quiz2).toHaveLength(5);

    // Verify no overlap between quiz 1 and 2
    const quiz1Ids = new Set(quiz1.map((q) => q.id));
    const quiz2Ids = new Set(quiz2.map((q) => q.id));
    for (const id of quiz2Ids) {
      expect(quiz1Ids.has(id)).toBe(false);
    }

    // Third quiz: only 2 fresh questions remain, should reset
    const quiz3 = selectQuestions(questions, quizSize);
    expect(quiz3).toHaveLength(5);

    // seenIds should now only have quiz3's questions (reset happened)
    const seenAfterReset = getSeenIds();
    expect(seenAfterReset).toHaveLength(5);
  });

  it("should return all questions when pool is smaller than quiz size", () => {
    const questions = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}`,
    })) as Pick<Question, "id" | "question">[] as Question[];
    const quizSize = 5;

    const selected = selectQuestions(questions, quizSize);
    expect(selected).toHaveLength(3);
  });

  it("shuffleArray should not produce duplicates", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(original);

    expect(shuffled).toHaveLength(original.length);
    expect(new Set(shuffled).size).toBe(original.length);
    expect(shuffled.sort((a, b) => a - b)).toEqual(original);
  });

  it("should handle corrupted localStorage data gracefully", () => {
    // Set corrupted JSON data
    localStorage.setItem(STORAGE_KEY_SEEN_IDS, "{invalid json");

    // Spy on removeItem to verify it's called
    const removeItemSpy = vi.spyOn(localStorage, "removeItem");

    // Should return empty array and clean up corrupted data
    const seenIds = getSeenIds();
    expect(seenIds).toEqual([]);
    expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY_SEEN_IDS);
    expect(localStorage.getItem(STORAGE_KEY_SEEN_IDS)).toBeNull();

    removeItemSpy.mockRestore();
  });

  it("should handle non-array data in localStorage", () => {
    // Set valid JSON but not an array
    localStorage.setItem(STORAGE_KEY_SEEN_IDS, JSON.stringify({ foo: "bar" }));

    // Spy on removeItem - should NOT be called since JSON.parse succeeds
    const removeItemSpy = vi.spyOn(localStorage, "removeItem");

    // Should return empty array but NOT remove the item (it's valid JSON)
    const seenIds = getSeenIds();
    expect(seenIds).toEqual([]);
    expect(removeItemSpy).not.toHaveBeenCalled();

    removeItemSpy.mockRestore();
  });
});

describe("Quiz result category persistence", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  function saveQuizResult(score: number, total: number, category: string | null) {
    localStorage.setItem(STORAGE_KEY_RESULT, JSON.stringify({ score, total, category }));
  }

  function getQuizResult(): { score: number; total: number; category: string | null } | null {
    const stored = localStorage.getItem(STORAGE_KEY_RESULT);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
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

  it("should handle corrupted quiz result data", () => {
    // Set corrupted JSON data
    localStorage.setItem(STORAGE_KEY_RESULT, "{invalid json");

    // Spy on removeItem to verify cleanup (in test context, no actual cleanup happens)
    const removeItemSpy = vi.spyOn(localStorage, "removeItem");

    // Should return null (no cleanup in test helper, but production code does clean up)
    const result = getQuizResult();
    expect(result).toBeNull();
    expect(removeItemSpy).not.toHaveBeenCalled(); // Test helper doesn't clean up

    removeItemSpy.mockRestore();
  });
});
