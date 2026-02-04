"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import Explanation from "@/components/Explanation";

interface Question {
  id: number;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/questions");
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        setQuestions(data);
      } catch {
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const q = questions[currentIndex];
      setShuffledAnswers(shuffleArray([q.correct_answer, ...q.wrong_answers]));
    }
  }, [questions, currentIndex]);

  const handleAnswer = useCallback(
    async (answer: string, isCorrect: boolean) => {
      setAnswered(true);
      if (isCorrect) {
        setScore((s) => s + 1);
      } else {
        setLoadingExplanation(true);
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        try {
          const q = questions[currentIndex];
          const res = await fetch("/api/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionId: q.id,
              question: q.question,
              userAnswer: answer,
              correctAnswer: q.correct_answer,
            }),
            signal: controller.signal,
          });
          const data = await res.json();
          if (!controller.signal.aborted) {
            setExplanation(data.explanation);
          }
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
          setExplanation("Could not load explanation.");
        } finally {
          if (!controller.signal.aborted) {
            setLoadingExplanation(false);
          }
        }
      }
    },
    [questions, currentIndex]
  );

  function handleNext() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      localStorage.setItem(
        "quizResult",
        JSON.stringify({ score: score, total: questions.length })
      );
      router.push("/results");
    } else {
      setCurrentIndex(nextIndex);
      setAnswered(false);
      setExplanation(null);
      setLoadingExplanation(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="text-4xl mb-4">🧗</div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Generating climbing trivia...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mb-8 flex w-full max-w-2xl items-center justify-between">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Score: {score}
        </span>
      </div>

      <QuestionCard
        question={currentQuestion.question}
        answers={shuffledAnswers}
        correctAnswer={currentQuestion.correct_answer}
        onAnswer={handleAnswer}
        disabled={answered}
      />

      <Explanation explanation={explanation} loading={loadingExplanation} />

      {answered && (
        <button
          onClick={handleNext}
          className="mt-6 rounded-full bg-zinc-900 px-8 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
        </button>
      )}
    </div>
  );
}
