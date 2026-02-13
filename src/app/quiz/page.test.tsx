import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import QuizPage from "./page";
import { STORAGE_KEY_RESULT, STORAGE_KEY_SEEN_IDS } from "@/lib/quiz";
import * as quizLib from "@/lib/quiz";
import type { Question } from "@/types";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock questions data with enough questions for a full quiz
vi.mock("@/data/questions.json", () => ({
  default: Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    category: i < 5 ? "Bouldering" : i < 10 ? "Rope Climbing" : "Australia",
    question: `Question ${i + 1}?`,
    correctAnswer: `Correct ${i + 1}`,
    wrongAnswers: [`Wrong ${i + 1}A`, `Wrong ${i + 1}B`, `Wrong ${i + 1}C`],
    explanation: `Explanation ${i + 1}`,
  })) as Question[],
}));

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

describe("QuizPage", () => {
  const mockPush = vi.fn();
  const mockSearchParams = {
    get: vi.fn(),
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockSearchParams);
    mockSearchParams.get.mockReturnValue(null);
  });

  it("should render quiz with questions", async () => {
    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeDefined();
      expect(screen.getByText(/Score: 0/i)).toBeDefined();
    });
  });

  it("should display category badge when category filter is applied", async () => {
    mockSearchParams.get.mockReturnValue("Bouldering");

    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText("Bouldering")).toBeDefined();
    });
  });

  it("should filter questions by category", async () => {
    mockSearchParams.get.mockReturnValue("Australia");

    render(<QuizPage />);

    await waitFor(() => {
      // Should select from Australia questions only (IDs 11-15)
      expect(screen.getByText(/Question 1 of/i)).toBeDefined();
    });
  });

  it("should show no questions message for invalid category", async () => {
    mockSearchParams.get.mockReturnValue("nonexistent-category");

    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText(/No questions found for "nonexistent-category"/i)).toBeDefined();
      expect(screen.getByText("Back to Home")).toBeDefined();
    });
  });

  it("should show no questions message without category suffix when pool is empty", async () => {
    vi.spyOn(quizLib, "selectQuestions").mockReturnValueOnce([]);

    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText("No questions found.")).toBeInTheDocument();
      expect(screen.queryByText(/No questions found for/i)).toBeNull();
    });
  });

  it("should navigate home when Back to Home is clicked in no questions state", async () => {
    const user = userEvent.setup();
    mockSearchParams.get.mockReturnValue("nonexistent-category");

    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText("Back to Home")).toBeDefined();
    });

    const backButton = screen.getByText("Back to Home");
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should render Quit button and navigate home when clicked", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText("Quit")).toBeDefined();
    });

    const quitButton = screen.getByText("Quit");
    await user.click(quitButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should display 4 answer options", async () => {
    render(<QuizPage />);

    await waitFor(() => {
      // Should have 4 buttons (1 correct + 3 wrong)
      const buttons = screen.getAllByRole("button");
      const answerButtons = buttons.filter((btn) => btn.textContent?.match(/Correct|Wrong/));
      expect(answerButtons.length).toBe(4);
    });
  });

  it("should increment score when correct answer is selected", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText(/Score: 0/i)).toBeDefined();
    });

    // Find and click the correct answer
    const correctButton = screen.getByText(/Correct \d+/);
    await user.click(correctButton);

    await waitFor(() => {
      expect(screen.getByText(/Score: 1/i)).toBeDefined();
    });
  });

  it("should not increment score when wrong answer is selected", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText(/Score: 0/i)).toBeDefined();
    });

    // Click a wrong answer (any wrong answer)
    const wrongButton = screen.getByText(/Wrong \d+A/);
    await user.click(wrongButton);

    await waitFor(() => {
      expect(screen.getByText(/Score: 0/i)).toBeDefined();
    });
  });

  it("should show explanation when wrong answer is selected", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Explanation \d+/)).toBeNull();
    });

    // Click wrong answer
    const wrongButton = screen.getByText(/Wrong \d+A/);
    await user.click(wrongButton);

    await waitFor(() => {
      expect(screen.getByText(/Explanation \d+/)).toBeDefined();
    });
  });

  it("should not show explanation when correct answer is selected", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    // Click correct answer
    const correctButton = screen.getByText(/Correct \d+/);
    await user.click(correctButton);

    await waitFor(() => {
      expect(screen.queryByText(/Explanation \d+/)).toBeNull();
    });
  });

  it("should show Next Question button after answering", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.queryByText("Next Question")).toBeNull();
    });

    // Answer the question
    const correctButton = screen.getByText(/Correct \d+/);
    await user.click(correctButton);

    await waitFor(() => {
      expect(screen.getByText("Next Question")).toBeDefined();
    });
  });

  it("should advance to next question when Next Question is clicked", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeDefined();
    });

    // Answer first question
    const correctButton = screen.getByText(/Correct \d+/);
    await user.click(correctButton);

    // Click Next Question
    const nextButton = screen.getByText("Next Question");
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Question 2 of/i)).toBeDefined();
    });
  });

  it("should disable answer buttons after answering", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    await waitFor(() => {
      const correctButton = screen.getByText(/Correct \d+/);
      expect(correctButton.hasAttribute("disabled")).toBe(false);
    });

    // Answer the question
    const correctButton = screen.getByText(/Correct \d+/);
    await user.click(correctButton);

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const answerButtons = buttons.filter((btn) => btn.textContent?.match(/Correct|Wrong/));
      answerButtons.forEach((btn) => {
        expect(btn.hasAttribute("disabled")).toBe(true);
      });
    });
  });

  it("should show See Results button on last question", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    // Answer 9 questions to get to the 10th (last)
    for (let i = 1; i <= 9; i++) {
      await waitFor(() => {
        expect(screen.getByText(`Question ${i} of 10`)).toBeDefined();
      });

      const correctButton = screen.getByText(/Correct \d+/);
      await user.click(correctButton);

      const nextButton = screen.getByText("Next Question");
      await user.click(nextButton);
    }

    // On the 10th question
    await waitFor(() => {
      expect(screen.getByText("Question 10 of 10")).toBeDefined();
    });

    // Answer the last question
    const correctButton = screen.getByText(/Correct \d+/);
    await user.click(correctButton);

    await waitFor(() => {
      expect(screen.getByText("See Results")).toBeDefined();
    });
  });

  it("should save result to localStorage and navigate to results page", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    // Answer all 10 questions correctly
    for (let i = 1; i <= 10; i++) {
      await waitFor(() => {
        expect(screen.getByText(`Question ${i} of 10`)).toBeDefined();
      });

      const correctButton = screen.getByText(/Correct \d+/);
      await user.click(correctButton);

      const nextButton =
        i < 10 ? screen.getByText("Next Question") : screen.getByText("See Results");
      await user.click(nextButton);
    }

    // Check localStorage
    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY_RESULT);
      expect(stored).not.toBeNull();
      const result = JSON.parse(stored!);
      expect(result.score).toBe(10);
      expect(result.total).toBe(10);
      expect(result.category).toBeNull();
    });

    // Should navigate to results
    expect(mockPush).toHaveBeenCalledWith("/results");
  });

  it("should save category with result when quiz is filtered", async () => {
    const user = userEvent.setup();
    mockSearchParams.get.mockReturnValue("Bouldering");

    render(<QuizPage />);

    // Bouldering category has 5 questions (IDs 1-5)
    const totalQuestions = 5;

    // Answer all questions
    for (let i = 1; i <= totalQuestions; i++) {
      await waitFor(() => {
        expect(screen.getByText(`Question ${i} of ${totalQuestions}`)).toBeDefined();
      });

      const correctButton = screen.getByText(/Correct \d+/);
      await user.click(correctButton);

      const nextButton =
        i < totalQuestions ? screen.getByText("Next Question") : screen.getByText("See Results");
      await user.click(nextButton);
    }

    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY_RESULT);
      expect(stored).not.toBeNull();
      const result = JSON.parse(stored!);
      expect(result.category).toBe("Bouldering");
      expect(result.total).toBe(totalQuestions);
    });
  });

  it("should track seen question IDs in localStorage", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeDefined();
    });

    // Answer first question
    const correctButton = screen.getByText(/Correct \d+/);
    await user.click(correctButton);

    // Check that seen IDs are tracked
    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY_SEEN_IDS);
      expect(stored).not.toBeNull();
      const seenIds = JSON.parse(stored!);
      expect(Array.isArray(seenIds)).toBe(true);
      expect(seenIds.length).toBeGreaterThan(0);
    });
  });

  it("should reset explanation when moving to next question", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeDefined();
    });

    // Answer incorrectly to see explanation
    const wrongButton = screen.getByText(/Wrong \d+A/);
    await user.click(wrongButton);

    const explanationText = await waitFor(() => {
      const explanation = screen.getByText(/Explanation \d+/);
      expect(explanation).toBeDefined();
      return explanation.textContent;
    });

    // Move to next question
    const nextButton = screen.getByText("Next Question");
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.queryByText(explanationText!)).toBeNull();
      expect(screen.getByText(/Question 2 of/i)).toBeDefined();
    });
  });

  it("resets selected answer styling between questions when answers overlap", async () => {
    const user = userEvent.setup();
    vi.spyOn(quizLib, "selectQuestions").mockReturnValueOnce([
      {
        id: 101,
        category: "Bouldering",
        question: "Shared Question 1?",
        correctAnswer: "Correct 1",
        wrongAnswers: ["Shared Choice", "Wrong 1B", "Wrong 1C"],
        explanation: "Explanation 1",
      },
      {
        id: 102,
        category: "Bouldering",
        question: "Shared Question 2?",
        correctAnswer: "Correct 2",
        wrongAnswers: ["Shared Choice", "Wrong 2B", "Wrong 2C"],
        explanation: "Explanation 2",
      },
    ] as Question[]);

    render(<QuizPage />);

    await waitFor(() => {
      expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Shared Choice" }));
    await user.click(screen.getByText("Next Question"));

    await waitFor(() => {
      expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
    });

    const sharedAnswer = screen.getByRole("button", { name: "Shared Choice" });
    expect(sharedAnswer.className).not.toContain("border-zinc-900");
    expect(sharedAnswer.className).not.toContain("bg-zinc-100");
  });
});
